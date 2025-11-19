/**
 * Type declarations for @ordervschaos/babel-plugin-react-component-tagger
 *
 * This Babel plugin adds __file-path attributes to topmost React component elements
 * for development and debugging purposes.
 */

declare module '@ordervschaos/babel-plugin-react-component-tagger' {
  import { PluginObj } from '@babel/core';

  /**
   * Babel plugin that tags topmost JSX elements with file path information
   *
   * @param api - Babel plugin API with types helper
   * @returns Babel plugin object with visitor pattern
   *
   * @example
   * // In vite.config.ts:
   * import componentTaggerPlugin from '@ordervschaos/babel-plugin-react-component-tagger';
   *
   * export default defineConfig({
   *   plugins: [
   *     react({
   *       babel: {
   *         plugins: [componentTaggerPlugin],
   *       },
   *     }),
   *   ],
   * });
   *
   * @example
   * // In babel.config.js:
   * module.exports = {
   *   plugins: ['@ordervschaos/babel-plugin-react-component-tagger']
   * };
   */
  export default function componentTaggerPlugin(api: {
    types: any;
  }): PluginObj;
}
