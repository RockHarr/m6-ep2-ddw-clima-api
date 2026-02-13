<template>
  <!--
    AppLogo — Logotipo SVG de ClimaApp.
    Un sol asomándose detrás de una nube redondeada.
    Props:
      size   — ancho/alto en px (el SVG es cuadrado). Default: 48
      glow   — añade drop-shadow azul. Default: false
  -->
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="['app-logo', { 'app-logo--glow': glow }]"
    aria-hidden="true"
    role="img"
  >
    <!-- ☀️ Sol (detrás de la nube) -->
    <!-- Rayos -->
    <g class="sun-rays" transform="translate(22, 22)">
      <line x1="0"  y1="-11" x2="0"  y2="-8"  stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="0"  y1="8"   x2="0"  y2="11"  stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="-11" y1="0"  x2="-8"  y2="0"  stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="8"   y1="0"  x2="11"  y2="0"  stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="-7.8" y1="-7.8" x2="-5.7" y2="-5.7" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="5.7"  y1="5.7"  x2="7.8"  y2="7.8"  stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="7.8"  y1="-7.8" x2="5.7"  y2="-5.7" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="-5.7" y1="5.7"  x2="-7.8" y2="7.8"  stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    <!-- Círculo sol -->
    <circle cx="22" cy="22" r="7" fill="#fbbf24"/>

    <!-- ☁️ Nube (delante del sol) -->
    <!-- Forma: tres círculos fusionados + base plana -->
    <path
      d="M14 42
         C14 42 10 42 10 38
         C10 34 13.5 32 17 33
         C17.5 30 20 28 23 28
         C26 28 28 30 28.5 32.5
         C30 32 32 32.5 33 34
         C35 34 37 36 37 38.5
         C37 41 35 42 33 42
         Z"
      fill="url(#cloudGradient)"
    />

    <!-- Gradiente nube -->
    <defs>
      <linearGradient id="cloudGradient" x1="10" y1="28" x2="37" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#e2e8f0"/>
        <stop offset="100%" stop-color="#94a3b8"/>
      </linearGradient>
      <filter id="logoGlow">
        <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#4361ee" flood-opacity="0.6"/>
      </filter>
    </defs>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 48 },
  glow: { type: Boolean, default: false },
})
</script>

<style scoped>
.app-logo {
  display: block;
  flex-shrink: 0;
}

.app-logo--glow {
  filter: url(#logoGlow) drop-shadow(0 0 8px rgba(67, 97, 238, 0.5));
}
</style>
