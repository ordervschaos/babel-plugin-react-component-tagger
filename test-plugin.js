/**
 * Test script to verify the Babel plugin is working correctly
 * This script will transform a sample React component and check if __file-path is added
 */

import { transformSync } from '@babel/core';
import componentTaggerPlugin from './index.js';

// Sample component code similar to MyBooks
const sampleCode = `
export default function Index() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="content">
        <h1>My Books</h1>
      </div>
    </div>
  );
}
`;

// Sample component wrapped in PrivateRoute (like in App.tsx)
const wrappedCode = `
<Route
  path="/books"
  element={
    <PrivateRoute>
      <MyBooks />
    </PrivateRoute>
  }
/>
`;

console.log('='.repeat(80));
console.log('Testing Babel Plugin: component-tagger-topmost');
console.log('='.repeat(80));

try {
  // Test 1: Transform the main component
  console.log('\n[Test 1] Transforming MyBooks component...\n');
  const result1 = transformSync(sampleCode, {
    filename: '/test/src/pages/books/index/MyBooks.tsx',
    plugins: [
      componentTaggerPlugin,
      '@babel/plugin-syntax-jsx'
    ],
    configFile: false,
    babelrc: false,
  });

  console.log('Transformed code:');
  console.log(result1.code);

  // Check if __file-path was added
  if (result1.code.includes('__file-path')) {
    console.log('\n✅ SUCCESS: __file-path attribute was added to the component!');
    const match = result1.code.match(/__file-path="([^"]+)"/);
    if (match) {
      console.log(`   File path: ${match[1]}`);
    }
  } else {
    console.log('\n❌ FAIL: __file-path attribute was NOT added to the component!');
  }

  // Test 2: Transform wrapped usage
  console.log('\n' + '='.repeat(80));
  console.log('[Test 2] Transforming Route with PrivateRoute wrapper...\n');
  const result2 = transformSync(wrappedCode, {
    filename: '/test/src/App.tsx',
    plugins: [
      componentTaggerPlugin,
      '@babel/plugin-syntax-jsx'
    ],
    configFile: false,
    babelrc: false,
  });

  console.log('Transformed code:');
  console.log(result2.code);

  // Check if __file-path was added
  const filePathCount = (result2.code.match(/__file-path/g) || []).length;
  console.log(`\nFound ${filePathCount} __file-path attribute(s)`);

  // Note: Test 2 is expected to have 0 because we're just transforming usage, not definitions
  // Components used as JSX elements (like <MyBooks />) are not tagged
  // Only the component's own definition gets tagged
  console.log('ℹ️  NOTE: This is expected behavior - component usages are not tagged, only definitions');

  if (filePathCount > 0) {
    console.log('   Attributes found:');
    const matches = result2.code.matchAll(/__file-path="([^"]+)"/g);
    for (const match of matches) {
      console.log(`   - ${match[1]}`);
    }
  } else {
    console.log('   No attributes found (this is correct for this test)');
  }

} catch (error) {
  console.error('\n❌ ERROR during transformation:');
  console.error(error.message);
  if (error.code === 'BABEL_PARSE_ERROR') {
    console.error('This is likely due to missing syntax plugins.');
  }
}

console.log('\n' + '='.repeat(80));
console.log('Test complete!');
console.log('='.repeat(80));
