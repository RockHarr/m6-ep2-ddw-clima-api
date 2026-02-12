# ClimaApp 🌤️

App del clima con autenticación, búsqueda de ciudades por API, tarjetas de pronóstico (hoy/mañana), favoritos y accesibilidad WCAG AA.

## 🛠️ Stack

| Tecnología   | Versión | Uso                            |
| ------------ | ------- | ------------------------------ |
| Vue 3        | ^3.5    | Framework UI (Composition API) |
| Vite         | ^7.3    | Build tool + dev server        |
| Vue Router 4 | ^4      | Rutas + navigation guard       |
| Pinia        | ^2      | Stores reactivos               |
| Fetch API    | —       | Requests HTTP                  |
| CSS          | —       | Estilos propios + tokens       |

## 🔑 Credenciales Demo

```
Usuario: profe
Contraseña: 1234
```

## 🌐 APIs Utilizadas

- **Open-Meteo Geocoding** — Búsqueda de ciudades por nombre (sin key)
- **Open-Meteo Forecast** — Pronóstico diario: temp, clima, viento, UV (sin key)

## 📁 Arquitectura

```
src/
├── components/       # Componentes reutilizables
│   ├── AppLayout.vue       # Layout + transición de página
│   ├── NavBar.vue          # Barra superior + logout
│   ├── CitySearch.vue      # Input búsqueda (debounce 300ms)
│   ├── CityResults.vue     # Dropdown resultados
│   ├── WeatherCards.vue     # Contenedor cards clima
│   ├── WeatherCard.vue     # Card individual (emoji + temps)
│   ├── UiAlert.vue         # Alertas (error/info/success)
│   └── LoadingSkeleton.vue # Skeleton animado
├── views/
│   ├── LoginView.vue       # Login con glassmorphism
│   └── DashboardView.vue   # Dashboard principal
├── stores/
│   ├── auth.store.js       # Auth + localStorage
│   └── weather.store.js    # Clima + favoritos + lastCity
├── services/
│   ├── geocoding.js        # Fetch ciudades
│   └── weather.js          # Fetch pronóstico
├── utils/
│   └── transform.js        # Normalización + WMO codes + formatDate
├── styles/
│   ├── tokens.css          # Design tokens (colores, spacing, etc.)
│   └── main.css            # Reset + utilities + transitions
├── router/
│   └── index.js            # Rutas + guard de autenticación
├── App.vue
└── main.js
```

## ▶️ Ejecutar Localmente

```bash
npm install
npm run dev
```

El proyecto levanta en `http://localhost:5173`

## 📦 Build & Deploy (Vercel)

```bash
npm run build    # Output: dist/
```

`vercel.json` incluye rewrite SPA para que `/login` no dé 404 al refrescar.

## ✅ Checklist de Funcionalidades

### Obligatorias

- [x] Login obligatorio (`profe / 1234`)
- [x] Persistencia de sesión (localStorage)
- [x] Rutas protegidas (navigation guard)
- [x] Búsqueda de ciudades (API Geocoding)
- [x] Dropdown de resultados
- [x] Tarjetas Hoy / Mañana (API Forecast)
- [x] Estados: loading, error (con reintentar), empty
- [x] Debounce 300ms en búsqueda

### Bonus

- [x] Guardar última ciudad + autoload al entrar
- [x] Favoritos (máx 6, chips, click-to-load, persistencia)

### Extras (del artículo)

- [x] Highlights: viento (km/h) + UV index en tarjeta Hoy
- [x] Fecha formateada en español ("Martes 11 Feb")
- [x] `@keyup.enter` en el buscador
- [x] Limpiar input post-selección

## ♿ Accesibilidad (WCAG AA)

| Requisito      | Implementación                                           |
| -------------- | -------------------------------------------------------- |
| Contraste AA   | Texto 15:1, botones 4.5:1 — todos verificados            |
| Focus visible  | Outline azul 3px con offset 2px en `:focus-visible`      |
| Labels         | Todo input tiene `<label for>` o `aria-label`            |
| Keyboard nav   | Tab natural, Enter en dropdown y búsqueda                |
| Error announce | `role="alert"` en errores de login y alertas             |
| Click targets  | Min 44px height en botones e inputs                      |
| Reduced motion | `prefers-reduced-motion` desactiva todas las animaciones |

## 📝 Notas Didácticas

- **Guard** (`router/index.js`): explica por qué se protegen rutas y cómo funciona `beforeEach`
- **localStorage** (`auth.store.js`): documenta qué se persiste y por qué
- **Dual status** (`weather.store.js`): explica por qué `statusCities` y `statusWeather` son independientes
- **Transform** (`transform.js`): explica la capa de normalización y por qué los componentes no parsean JSON directo
- **Reduced motion** (`main.css`): documenta la media query y su importancia para accesibilidad
