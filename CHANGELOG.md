# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.1] - 2025-08-07

### Fixed

- Bug in padding with zeros for the datetime stamp.

## [0.4.0] - 2025-08-05

### Added

- Convert dates to ISO format in local time zone.

## [0.3.1] - 2024-03-10

### Fixed

- Export all from config in the index.

## [0.3.0] - 2024-03-05

### Added

- Use of [@mischareitsma/config-parser](https://www.npmjs.com/package/@mischareitsma/config-parser)
  to do the configuration parsing.

### Removed

- The configuration parsing software.

## [0.2.1] - 2024-02-13

### Changed

- Moved tests from `__test__` to `test` directory.

### Fixed

- Missing `-` between the logger name and log message for file handlers.

## [0.2.0] - 2023-11-23

### Added

- Capability to create loggers and handlers from configuration.
- Schema for configuration of loggers and handlers.k

### Changed

- Complete overhaul of the README, now includes a description and examples of
  the full package.

## [0.1.1] - 2023-11-08

### Added

- This change log file.

### Changed

- Update README with a simple description and example usage.
- Moved `@types/node` from development dependencies to dependencies.

## [0.1.0] - 2023-11-05

### Added

- Initial version of logging module

[Unreleased]: https://github.com/mischareitsma/logging-ts/compare/v0.4.1...HEAD
[0.4.1]: https://github.com/mischareitsma/logging-ts/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/mischareitsma/logging-ts/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/mischareitsma/logging-ts/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/mischareitsma/logging-ts/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/mischareitsma/logging-ts/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/mischareitsma/logging-ts/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/mischareitsma/logging-ts/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/mischareitsma/logging-ts/releases/tag/v0.1.0
