# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-14

### Added

- **Core Form Class** with event-driven architecture

  - Fine-grained field subscriptions for optimal performance
  - Event system supporting `change`, `changeMany`, `touch`, `touchMany`, `validate`, `validated`, `reset`
  - Subscription-based reactivity - no React state in Form class
  - Automatic cleanup on component unmount

- **React Integration**

  - `fieldwise()` builder pattern for creating form hooks
  - `useForm()` hook - subscribe to all fields
  - `useSlice(keys)` hook - subscribe to specific fields only
  - Input helper `i()` for easy input binding
  - Type-safe API with full TypeScript inference

- **Validation System**

  - Plugin-based validation architecture with `registerValidator` API
  - Support for multiple validators (sync and async)
  - Parallel async validation execution
  - Error-dependent validators with access to sync validation results
  - Built-in Zod schema validation via `zod()` plugin
  - Touch state tracking per field
  - `isValidating` flag for async validation states

- **Plugin System**

  - Extensible architecture for custom behavior
  - `zod()` plugin for Zod schema validation
  - `logFormEvents()` debug plugin with formatted console output
  - Simple plugin API - receive Form instance, listen/emit events

- **Developer Experience**

  - 100% TypeScript with full type inference
  - Generic form values with mapped FieldSet type
  - Type-safe event handlers
  - Debug mode with configurable event logging
  - Comprehensive API documentation
  - Multiple usage examples and patterns

- **Performance Optimizations**

  - Microtask batching for synchronous updates
  - No unnecessary re-renders with fine-grained subscriptions
  - Efficient subscription cleanup
  - Immutable value updates for React reconciliation

- **Testing**

  - 100% code coverage (81 passing tests)
  - Unit tests for Form class
  - Integration tests for React hooks
  - Tests for validation, plugins, and edge cases

- **Documentation**
  - Comprehensive README with examples
  - Migration guides from Formik and React Hook Form
  - Testing patterns and best practices
  - Troubleshooting section
  - Clear documentation of current limitations

### Design Decisions

- **One form per `fieldwise()` call** - Consistent with industry standards (React Hook Form, Formik)
- **Flat data structures** - Nested structures planned for future releases
- **Event-driven state** - All state lives in Form class, React only subscribes
- **Zod for validation** - Built-in support for Zod, extensible for other libraries

### Known Limitations

- Nested data structures not yet supported (planned for 1.x release)
- Field arrays not yet supported (planned for future release)
- Workarounds available and documented for common nested use cases

[1.0.0]: https://github.com/akuzko/fieldwise/releases/tag/v1.0.0
