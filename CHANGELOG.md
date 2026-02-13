# Changelog

Todos los cambios importantes de este proyecto se documentan en este archivo.

## [Unreleased] - 2026-02-13

### Added
- Feedback de favoritos en dashboard con mensajes:
  - `Agregado a favoritos.`
  - `Eliminado de favoritos.`
  - `Esta ciudad ya está en favoritos.`
  - `Límite alcanzado: máximo 6 favoritas.`
- Sección de novedades recientes en `README.md`.

### Changed
- Ajustes de responsividad móvil en dashboard:
  - Control de overflow horizontal.
  - Drawer móvil lateral con backdrop.
  - Soporte de `safe-area-inset-top` y `100dvh`.
- Ajustes de interacción táctil:
  - Swipe para cerrar drawer limitado a puntero coarse y listeners `passive`.

### Docs
- Archivo `CHANGELOG.md` inicializado.
