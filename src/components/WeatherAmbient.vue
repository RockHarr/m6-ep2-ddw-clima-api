<template>
  <!--
    Transition self-contenida: el :key fuerza un crossfade
    cuando cambia el tema o el estado día/noche.
  -->
  <Transition name="ambient" mode="out-in">
    <div
      :key="`${theme}-${isNight ? 'n' : 'd'}`"
      class="ambient"
      :class="[`ambient--${theme}`, { 'ambient--night': isNight }]"
      aria-hidden="true"
    ></div>
  </Transition>
</template>

<script setup>
/**
 * WeatherAmbient — Efecto ambiental CSS puro para el Hero widget y tarjetas.
 *
 * Props:
 *   theme    — 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'foggy' | 'default'
 *   timezone — IANA timezone string (ej. "Europe/Madrid"). Si se provee,
 *              el efecto cambia entre día (06:00-19:59) y noche (20:00-05:59).
 *              Despejado de noche → campo de estrellas en vez de rayos de sol.
 *
 * Técnica:
 *   Solo transforms y opacity → GPU-accelerated, 0 JS en el loop de animación.
 *   prefers-reduced-motion desactiva todo movimiento.
 */
import { computed } from 'vue'

const props = defineProps({
  theme:    { type: String, default: 'default' },
  timezone: { type: String, default: null },
})

const isNight = computed(() => {
  if (!props.timezone) return false
  try {
    const hour = parseInt(
      new Intl.DateTimeFormat('en', {
        timeZone: props.timezone,
        hour: 'numeric',
        hour12: false,
      }).format(new Date()),
      10
    )
    return hour < 6 || hour >= 20
  } catch {
    return false
  }
})
</script>

<style scoped>
/* ─────────────────────────────────────────────
   Transición de crossfade entre temas
   ───────────────────────────────────────────── */
.ambient-enter-active,
.ambient-leave-active {
  transition: opacity 0.7s ease;
}
.ambient-enter-from,
.ambient-leave-to {
  opacity: 0;
}

/* ─────────────────────────────────────────────
   Base: capa absoluta, sin interacción
   ───────────────────────────────────────────── */
.ambient {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

/* ─────────────────────────────────────────────
   ☀️  SUNNY día — orbe cálido + rayos giratorios
   ───────────────────────────────────────────── */
.ambient--sunny:not(.ambient--night) {
  background: radial-gradient(
    ellipse 80% 60% at 50% 40%,
    rgba(251, 191, 36, 0.38) 0%,
    rgba(251, 191, 36, 0.12) 50%,
    transparent 75%
  );
  animation: sun-pulse 5s ease-in-out infinite;
}

.ambient--sunny:not(.ambient--night)::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  transform: translate(-50%, -50%);
  background: conic-gradient(
    from 0deg,
    transparent 0deg,   rgba(251, 191, 36, 0.09) 12deg,  transparent 24deg,
    transparent 54deg,  rgba(251, 191, 36, 0.09) 66deg,  transparent 78deg,
    transparent 108deg, rgba(251, 191, 36, 0.09) 120deg, transparent 132deg,
    transparent 162deg, rgba(251, 191, 36, 0.09) 174deg, transparent 186deg,
    transparent 216deg, rgba(251, 191, 36, 0.09) 228deg, transparent 240deg,
    transparent 270deg, rgba(251, 191, 36, 0.09) 282deg, transparent 294deg,
    transparent 324deg, rgba(251, 191, 36, 0.09) 336deg, transparent 348deg
  );
  animation: sun-rotate 35s linear infinite;
}

@keyframes sun-pulse {
  0%, 100% { opacity: 0.7; }
  50%       { opacity: 1;   }
}
@keyframes sun-rotate {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* ─────────────────────────────────────────────
   🌙  SUNNY noche — campo de estrellas
   ───────────────────────────────────────────── */
.ambient--sunny.ambient--night {
  background: radial-gradient(
    ellipse 60% 40% at 50% 35%,
    rgba(99, 102, 241, 0.15) 0%,
    transparent 70%
  );
  animation: fog-pulse 10s ease-in-out infinite;
}

.ambient--sunny.ambient--night::before {
  content: '';
  position: absolute;
  inset: 0;
  /* Cuatro capas de puntos con tamaños primos → sin tiling visible */
  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 1.0)  1.2px, transparent 1.2px),
    radial-gradient(circle, rgba(255, 255, 255, 0.75) 0.9px, transparent 0.9px),
    radial-gradient(circle, rgba(200, 220, 255, 0.90) 1.4px, transparent 1.4px),
    radial-gradient(circle, rgba(255, 255, 255, 0.60) 0.7px, transparent 0.7px);
  background-size:   97px 79px, 143px 113px, 71px 59px, 127px 103px;
  background-position: 11px 17px, 53px 33px, 28px  7px,  67px  49px;
  animation: star-twinkle 4s ease-in-out infinite;
}

@keyframes star-twinkle {
  0%, 100% { opacity: 0.65; }
  50%       { opacity: 1;    }
}

/* ─────────────────────────────────────────────
   ⛅  CLOUDY — blobs difusos cruzando
   ───────────────────────────────────────────── */
.ambient--cloudy::before,
.ambient--cloudy::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(28px);
  animation: cloud-drift linear infinite;
}

.ambient--cloudy::before {
  width: 320px;
  height: 110px;
  background: rgba(148, 163, 184, 0.32);
  top: 20%;
  left: -340px;
  animation-duration: 13s;
}

.ambient--cloudy::after {
  width: 240px;
  height: 90px;
  background: rgba(100, 116, 139, 0.24);
  top: 55%;
  left: -260px;
  animation-duration: 19s;
  animation-delay: -7s;
}

@keyframes cloud-drift {
  to { transform: translateX(calc(100% + 600px)); }
}

/* ─────────────────────────────────────────────
   🌧️  RAINY — líneas diagonales cayendo
   ───────────────────────────────────────────── */
.ambient--rainy {
  background-image: repeating-linear-gradient(
    -65deg,
    transparent,
    transparent 3px,
    rgba(147, 197, 253, 0.16) 3px,
    rgba(147, 197, 253, 0.16) 4px
  );
  background-size: 8px 100%;
  animation: rain-fall 0.45s linear infinite;
}

@keyframes rain-fall {
  to { background-position: 10px 80px; }
}

/* ─────────────────────────────────────────────
   ❄️  SNOWY — copos en dos capas
   ───────────────────────────────────────────── */
.ambient--snowy::before,
.ambient--snowy::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.7) 1.5px, transparent 1.5px);
}

.ambient--snowy::before {
  top: -120px;
  height: 120px;
  background-size: 55px 30px;
  opacity: 0.8;
  animation: snow-fall 4s linear infinite;
}

.ambient--snowy::after {
  top: -90px;
  height: 90px;
  background-size: 40px 20px;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.65) 1px, transparent 1px);
  background-position: 20px 10px;
  opacity: 0.7;
  animation: snow-fall 6s linear infinite;
  animation-delay: -2.5s;
}

/* Distancia suficiente para cubrir pantallas altas */
@keyframes snow-fall {
  to { transform: translateY(110vh); }
}

/* ─────────────────────────────────────────────
   ⛈️  STORMY — lluvia intensa + relámpago
   ───────────────────────────────────────────── */
.ambient--stormy {
  background-image: repeating-linear-gradient(
    -65deg,
    transparent,
    transparent 2px,
    rgba(147, 197, 253, 0.18) 2px,
    rgba(147, 197, 253, 0.18) 3px
  );
  background-size: 6px 100%;
  animation: rain-fall 0.25s linear infinite;
}

.ambient--stormy::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  border-radius: inherit;
  opacity: 0;
  animation: lightning-flash 6s ease-in-out infinite;
}

@keyframes lightning-flash {
  0%, 86%, 88%, 90%, 100% { opacity: 0;    }
  87%, 89%                 { opacity: 0.12; }
}

/* ─────────────────────────────────────────────
   🌫️  FOGGY — niebla / llovizna / granizo
   Blobs muy difusos moviéndose muy lentamente
   ───────────────────────────────────────────── */
.ambient--foggy::before,
.ambient--foggy::after {
  content: '';
  position: absolute;
  width: 160%;
  height: 65%;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(148, 163, 184, 0.32) 0%, transparent 65%);
  filter: blur(32px);
  animation: fog-drift linear infinite;
}

.ambient--foggy::before {
  top: 10%;
  left: -80%;
  animation-duration: 28s;
}

.ambient--foggy::after {
  top: 45%;
  left: -80%;
  animation-duration: 40s;
  animation-delay: -16s;
}

@keyframes fog-drift {
  to { transform: translateX(120%); }
}

/* ─────────────────────────────────────────────
   🔘  DEFAULT — pulso neutral suave
   ───────────────────────────────────────────── */
.ambient--default {
  background: radial-gradient(
    ellipse at 50% 60%,
    rgba(148, 163, 184, 0.08) 0%,
    transparent 65%
  );
  animation: fog-pulse 9s ease-in-out infinite;
}

@keyframes fog-pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.9; }
}

/* ─────────────────────────────────────────────
   ♿ Sin movimiento si el usuario lo prefiere
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .ambient,
  .ambient::before,
  .ambient::after {
    animation: none !important;
  }
}
</style>
