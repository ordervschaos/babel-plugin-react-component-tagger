/**
 * Babel plugin to add filename attribute to the topmost React component element
 *
 * This plugin identifies the topmost JSX element in each component and adds
 * a __file-path attribute with the full file path.
 *
 * NOTE: If you modify this file, you may need to restart your build process
 * or clear Babel's cache to see the changes take effect.
 */
export default function ({ types: t }) {
  // Helper method to find topmost JSX in a function/component
  function findTopmostJSX(path, state) {
    let foundTopmost = false;

    // Helper to extract JSX element from logical AND expression: condition && <JSX>
    function extractJSXFromLogicalAnd(expr) {
      if (t.isJSXElement(expr)) {
        return expr;
      }
      if (t.isLogicalExpression(expr) && expr.operator === '&&') {
        // Recursively check the right operand (left is usually the condition)
        return extractJSXFromLogicalAnd(expr.right);
      }
      return null;
    }

    // Helper to tag ALL top-level JSX elements in a fragment
    function tagFragmentChildren(fragment) {
      if (!t.isJSXFragment(fragment)) return;

      // Tag all top-level JSX elements (not just the first)
      for (const child of fragment.children) {
        if (t.isJSXElement(child)) {
          state.topmostElements.add(child.openingElement);
          foundTopmost = true;
        } else if (t.isJSXExpressionContainer(child)) {
          const expression = child.expression;

          // Handle direct JSX: {<Component />}
          if (t.isJSXElement(expression)) {
            state.topmostElements.add(expression.openingElement);
            foundTopmost = true;
          }
          // Handle logical AND: {condition && <Component />}
          else if (t.isLogicalExpression(expression) && expression.operator === '&&') {
            const jsxElement = extractJSXFromLogicalAnd(expression);
            if (jsxElement) {
              state.topmostElements.add(jsxElement.openingElement);
              foundTopmost = true;
            }
          }
          // Handle ternary: condition ? <A /> : <B />
          else if (t.isConditionalExpression(expression)) {
            if (t.isJSXElement(expression.consequent)) {
              state.topmostElements.add(expression.consequent.openingElement);
              foundTopmost = true;
            }
            if (t.isJSXElement(expression.alternate)) {
              state.topmostElements.add(expression.alternate.openingElement);
              foundTopmost = true;
            }
          }
        }
      }
    }


    path.traverse({
      ReturnStatement(returnPath) {
        if (foundTopmost) return;

        const argument = returnPath.node.argument;

        // Check if return contains JSX
        if (t.isJSXElement(argument)) {
          state.topmostElements.add(argument.openingElement);
          foundTopmost = true;
        } else if (t.isJSXFragment(argument)) {
          tagFragmentChildren(argument);
        }
      },

      // Handle arrow functions with implicit return: () => <div>...</div> or () => <>...</>
      ArrowFunctionExpression(arrowPath) {
        if (foundTopmost) return;

        const body = arrowPath.node.body;

        // Direct JSX return without block
        if (t.isJSXElement(body)) {
          state.topmostElements.add(body.openingElement);
          foundTopmost = true;
        } else if (t.isJSXFragment(body)) {
          tagFragmentChildren(body);
        }
      },

      // Handle JSX elements passed as prop values: <Route element={<MyComponent />} />
      JSXExpressionContainer(exprPath) {
        const expression = exprPath.node.expression;

        // Check if this is inside a JSX attribute (prop value)
        if (t.isJSXAttribute(exprPath.parent)) {
          // Handle direct JSX element: element={<Component />}
          if (t.isJSXElement(expression)) {
            state.topmostElements.add(expression.openingElement);
          }
          // Handle logical AND: element={condition && <Component />}
          else if (t.isLogicalExpression(expression) && expression.operator === '&&') {
            const jsxElement = extractJSXFromLogicalAnd(expression);
            if (jsxElement) {
              state.topmostElements.add(jsxElement.openingElement);
            }
          }
          // Handle ternary: element={condition ? <A /> : <B />}
          else if (t.isConditionalExpression(expression)) {
            if (t.isJSXElement(expression.consequent)) {
              state.topmostElements.add(expression.consequent.openingElement);
            }
            if (t.isJSXElement(expression.alternate)) {
              state.topmostElements.add(expression.alternate.openingElement);
            }
          }
        }
      }
    });
  }

  return {
    name: 'component-tagger-topmost',
    visitor: {
      // Track the program level to identify top-level functions/components
      Program: {
        enter(path, state) {
          state.topmostElements = new Set();
          state.filePath = '';

          try {
            // Get the current filepath from the state
            if (state && state.file && state.file.opts) {
              state.filePath = state.file.opts.filename || '';
              // Remove everything before 'src/' to get relative path
              const srcIndex = state.filePath.indexOf('src/');
              if (srcIndex !== -1) {
                state.filePath = state.filePath.substring(srcIndex);
              }
            }
          } catch (error) {
            console.error('Error getting file path in Babel plugin:', error);
          }
        }
      },

      // Identify function components and their return statements
      FunctionDeclaration(path, state) {
        findTopmostJSX(path, state);
      },

      VariableDeclarator(path, state) {
        // Handle arrow function components: const Component = () => <div>...</div>
        if (t.isArrowFunctionExpression(path.node.init) ||
            t.isFunctionExpression(path.node.init)) {
          findTopmostJSX(path, state);
        }
      },

      // Tag the topmost JSX elements
      JSXOpeningElement(path, state) {
        if (state.topmostElements && state.topmostElements.has(path.node)) {
          const filePath = state.filePath || 'unknown';

          // Check if attribute already exists
          const hasAttribute = path.node.attributes.some(
            attr => t.isJSXAttribute(attr) &&
                   attr.name &&
                   attr.name.name === '__file-path'
          );

          if (!hasAttribute) {
            path.node.attributes.push(
              t.jsxAttribute(
                t.jsxIdentifier('__file-path'),
                t.stringLiteral(filePath)
              )
            );
          }
        }
      }
    }
  };
}
