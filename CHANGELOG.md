# Changelog

## [Unreleased]

暂无。

## [1.0.2] - 2026-06-09

### Changed

- Pins direct development dependencies in `package.json` to exact versions already resolved by `package-lock.json`.
- Keeps runtime dependency surface unchanged.

## [1.0.1] - 2026-06-03

### Fixed

- Adds the tag-triggered npm publish workflow, aligned with `route-core`, so `v*` tags can publish through GitHub Actions.

## [1.0.0] - 2026-06-03

### Added

- Initial high-performance JSON logger MVP.
- ESM/CJS/types build output with required source maps.
- Unit tests, export verification, benchmark gate, and pack smoke script.
- Release preflight gate with source-map verification, npm audit, and `prepublishOnly`.

### Performance

- Adds local benchmark scenarios against pino for message-only, object payload, disabled level, and child bindings.
- Optimizes plain-object payload logging with fast string quoting and cached object field shapes.
- Adds nested-object and Error payload benchmark scenarios, then optimizes nested/Error serialization with a custom recursive serializer.

### Known Limitations

- Pretty printing, transports, redaction, and pino compatibility helpers are outside the first MVP.
