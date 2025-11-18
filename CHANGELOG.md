# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-18

### Added
- Initial release of babel-plugin-react-component-tagger
- Support for function components, arrow functions, and function expressions
- **Advanced Fragment Support**: Tags ALL top-level elements in fragments (not just the first)
- **Conditional Rendering**: Handles logical AND expressions (`condition && <Component />`)
- **Nested Conditionals**: Recursively processes nested logical AND (`a && b && <Component />`)
- Support for ternary expressions (`condition ? <A /> : <B />`)
- Support for direct JSX in expression containers (`{<Component />}`)
- Automatic file path detection and relative path generation
- Development-mode friendly (designed to be disabled in production)
- Comprehensive documentation and usage examples
- MIT License

### Features
- Tags ALL top-level JSX elements in fragments (major improvement over similar plugins)
- Adds `__file-path` attribute with relative file path starting from `src/`
- Prevents duplicate attributes
- Handles complex component patterns including:
  - React fragments with multiple children
  - Conditional rendering with logical AND
  - Nested conditional expressions (recursive)
  - Ternary expressions (both branches)
  - Expression containers with direct JSX
- Zero runtime overhead when used correctly
- Compatible with Vite, Webpack, Next.js, and Create React App

### Why This Matters
Many component tagging plugins only tag the first element in a fragment or don't handle conditional rendering properly. This plugin:
- Tags floating action buttons that appear conditionally
- Tags all navigation items in a fragment
- Handles real-world React patterns like `{collapsed && !selectedFile && <Button />}`
- Makes debugging complex layouts much easier

### Documentation
- Detailed README with installation instructions
- Usage examples for multiple build tools
- Troubleshooting guide
- Performance considerations
- Comparison with alternatives

[1.0.0]: https://github.com/anzal/babel-plugin-react-component-tagger/releases/tag/v1.0.0
