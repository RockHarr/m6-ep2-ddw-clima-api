# ClimaApp 🌤️

App del clima con autenticación, búsqueda de ciudades por API, tarjetas de pronóstico (hoy/mañana), favoritos y accesibilidad WCAG AA.

## 🛠️ Stack

| Tecnología   | Versión | Uso                            |
| ------------ | ------- | ------------------------------ |
| Vue 3        | ^3.5    | Framework UI (Composition API) |
| Vite         | ^7.3    | Build tool + dev server        |
| Vue Router 4 | ^4      | Rutas + navigation guard       |
| Pinia        | ^3      | Stores reactivos               |
| OGL          | latest  | WebGL para efecto Aurora       |
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
- **Nominatim (OSM)** — Geocodificación inversa para geolocalización (sin key)

## 📁 Arquitectura

```
src/
├── components/       # Componentes reutilizables
│   ├── AppLayout.vue         # Layout + transición de página
│   ├── NavBar.vue            # Barra superior + logout
│   ├── CitySearch.vue        # Input búsqueda (debounce 300ms)
│   ├── CityResults.vue       # Dropdown resultados + ciudades populares
│   ├── WeatherCards.vue      # Contenedor cards clima
│   ├── WeatherCard.vue       # Card individual (emoji + temps + barra visual)
│   ├── SidebarCityCard.vue   # Tarjeta rica con reloj local y clima actual
│   ├── AuroraBackground.vue  # Efecto aurora WebGL (vue-bits, requiere ogl)
│   ├── ShinyText.vue         # Texto con brillo deslizante (vue-bits)
│   ├── UiAlert.vue           # Alertas (error/info/success)
│   └── LoadingSkeleton.vue   # Skeleton animado
├── views/
│   ├── LoginView.vue         # Login glassmorphism + fondo Aurora
│   └── DashboardView.vue     # Dashboard: sidebar + bento grid
├── stores/
│   ├── auth.store.js         # Auth + persistencia localStorage
│   └── weather.store.js      # Clima + favoritos + lastCity + geolocalización
├── services/
│   ├── geocoding.js          # Fetch ciudades (Open-Meteo)
│   └── weather.js            # Fetch pronóstico (Open-Meteo)
├── utils/
│   └── transform.js          # Normalización + WMO codes + formatDate
├── styles/
│   ├── tokens.css            # Design tokens (colores, spacing, transitions, themes)
│   └── main.css              # Reset + utilities + animaciones
├── router/
│   └── index.js              # Rutas + guard de autenticación
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
- [x] Favoritos (máx 6, click-to-load, persistencia)
- [x] Reloj local en tiempo real por zona horaria de cada ciudad
- [x] Pronóstico horario 24h (scroll horizontal)

### Extras (del artículo)

- [x] Highlights: viento (km/h) + UV index en tarjeta Hoy
- [x] Fecha formateada en español ("Martes 11 Feb")
- [x] `@keyup.enter` en el buscador
- [x] Limpiar input post-selección

### Mejoras UX

- [x] Fondo Aurora animado en login (WebGL via OGL)
- [x] Texto bienvenida con efecto ShinyText en empty state
- [x] Geolocalización del navegador con banner de permiso explicativo (fallback: New York)
- [x] Viento e índice UV integrados en el widget Hero (no en cards separadas)
- [x] Botón favorito como CTA claro ("☆ Guardar ciudad" / "★ Ciudad guardada")
- [x] "Descubre el mundo" visible desde el primer render (ciudades populares con clima)
- [x] Sección favoritos vacía: invitación a guardar ciudades
- [x] Descubrimiento oculto en mobile hasta que el usuario busca activamente
- [x] Debounce reset: campo vacío vuelve a mostrar ciudades populares
- [x] Estado de error para carga de clima con botón reintentar
- [x] Botón ✕ solo visible en ciudades guardadas como favoritas

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
- **Geolocalización** (`weather.store.js → geolocateCity`): patrón de permiso explícito + geocodificación inversa + fallback silencioso
- **Componentes vue-bits** (`AuroraBackground.vue`, `ShinyText.vue`): portados de TypeScript a JS, sin dependencia de la librería original — solo `ogl` para el canvas WebGL
