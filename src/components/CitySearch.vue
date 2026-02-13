<script setup>
/**
 * CitySearch — Campo de búsqueda de ciudades.
 *
 * Funcionalidades:
 * - Input con label accesible
 * - @keyup.enter para buscar con Enter
 * - Debounce de 300ms al escribir
 * - Validación: no busca si el campo está vacío
 * - Se limpia después de seleccionar una ciudad
 * - Búsqueda por voz con Web Speech API (si el navegador lo soporta)
 */
import { ref, watch, onUnmounted } from 'vue'
import { useWeatherStore } from '@/stores/weather.store.js'

const weatherStore = useWeatherStore()
const query = ref('')
let debounceTimer = null

const emit = defineEmits(['search'])

// ── Voz ──────────────────────────────────────────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const isVoiceSupported = !!SpeechRecognition

const isListening = ref(false)
const voiceMessage = ref('') // info / warning al usuario
let recognition = null

function startVoice() {
  if (!isVoiceSupported) return

  // Crear instancia nueva en cada llamada (spec recomienda no reusar)
  recognition = new SpeechRecognition()
  recognition.lang = navigator.language || 'es-ES'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onstart = () => {
    isListening.value = true
    voiceMessage.value = ''
  }

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    query.value = transcript // dispara el watch → debounce → búsqueda
  }

  recognition.onerror = (event) => {
    isListening.value = false
    if (event.error === 'not-allowed') {
      voiceMessage.value = 'Permiso de micrófono denegado. Habilítalo en la configuración del navegador.'
    } else if (event.error === 'no-speech') {
      voiceMessage.value = 'No se detectó voz. Intenta de nuevo.'
    } else {
      voiceMessage.value = 'Error al usar el micrófono. En Firefox puede requerir permisos especiales o no estar soportado.'
    }
  }

  recognition.onend = () => {
    isListening.value = false
  }

  try {
    recognition.start()
  } catch {
    isListening.value = false
    voiceMessage.value = 'No se pudo iniciar el reconocimiento de voz.'
  }
}

function stopVoice() {
  if (recognition) recognition.stop()
}

onUnmounted(() => {
  if (recognition) recognition.abort()
})

// ── Búsqueda texto ────────────────────────────────────────────────────────────

function handleSearch() {
  const trimmed = query.value.trim()
  if (!trimmed) return
  weatherStore.searchCitiesAction(trimmed)
}

watch(query, (newVal) => {
  clearTimeout(debounceTimer)
  emit('search', newVal)

  if (!newVal.trim()) {
    weatherStore.searchCitiesAction('')
    return
  }

  debounceTimer = setTimeout(() => {
    handleSearch()
  }, 300)
})

function clearInput() {
  query.value = ''
}

defineExpose({ clearInput })
</script>

<template>
  <div class="city-search">
    <div class="city-search__wrapper">
      <span class="city-search__icon" aria-hidden="true">🔍</span>
      <input
        id="city-input"
        v-model="query"
        type="text"
        class="city-search__input"
        :class="{ 'city-search__input--with-mic': isVoiceSupported }"
        placeholder="Buscar ciudad..."
        autocomplete="off"
        aria-label="Buscar ciudad"
        @keyup.enter="handleSearch"
      />

      <!-- Botón de voz: solo si el navegador lo soporta -->
      <button
        v-if="isVoiceSupported"
        class="city-search__mic"
        :class="{ 'city-search__mic--listening': isListening }"
        :aria-label="isListening ? 'Detener escucha' : 'Buscar por voz'"
        :title="isListening ? 'Escuchando… haz clic para detener' : 'Buscar por voz (Firefox puede no soportarlo o pedir permisos especiales)'"
        type="button"
        @click="isListening ? stopVoice() : startVoice()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
          <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1.5 4v6a1.5 1.5 0 0 0 3 0V5a1.5 1.5 0 0 0-3 0zM5.25 11a.75.75 0 0 1 .75.75 6 6 0 0 0 12 0 .75.75 0 0 1 1.5 0 7.5 7.5 0 0 1-6.75 7.455V21h2.25a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1 0-1.5h2.25v-1.795A7.5 7.5 0 0 1 4.5 11.75.75.75 0 0 1 5.25 11z"/>
        </svg>
      </button>
    </div>

    <!-- Mensaje de estado / advertencia: solo cuando hay algo que decir -->
    <Transition name="voice-msg">
      <p v-if="voiceMessage" class="city-search__voice-msg" role="alert">
        {{ voiceMessage }}
      </p>
      <p v-else-if="isListening" class="city-search__voice-msg city-search__voice-msg--listening" aria-live="polite">
        🎙 Escuchando… di el nombre de la ciudad
      </p>
    </Transition>
  </div>
</template>

<style scoped>
.city-search {
  width: 100%;
}

.city-search__wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.city-search__icon {
  position: absolute;
  left: var(--space-md);
  color: var(--color-text-placeholder);
  font-size: 1rem;
  pointer-events: none;
}

.city-search__input {
  width: 100%;
  padding: var(--space-md) var(--space-md) var(--space-md) 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  min-height: 44px;
  transition: all var(--transition-base);
}

/* Dar espacio al botón del micro */
.city-search__input--with-mic {
  padding-right: 56px;
}

.city-search__input::placeholder {
  color: var(--color-text-placeholder);
}

.city-search__input:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

/* ── Botón micrófono ── */
.city-search__mic {
  position: absolute;
  right: 6px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}

.city-search__mic:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-text);
}

/* Estado activo: rojo + pulso */
.city-search__mic--listening {
  background: rgba(239, 68, 68, 0.25);
  color: #f87171;
  animation: mic-pulse 1.2s ease-in-out infinite;
}

@keyframes mic-pulse {
  0%, 100% { box-shadow: 0 0 0 0   rgba(239, 68, 68, 0.5); }
  50%       { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);   }
}

/* ── Mensajes de estado ── */
.city-search__voice-msg {
  margin-top: 6px;
  font-size: 0.75rem;
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: var(--radius-sm, 4px);
  padding: 6px 10px;
  line-height: 1.4;
}

.city-search__voice-msg--listening {
  color: #93c5fd;
  background: rgba(96, 165, 250, 0.1);
  border-color: rgba(96, 165, 250, 0.25);
}

/* Transición del mensaje */
.voice-msg-enter-active,
.voice-msg-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.voice-msg-enter-from,
.voice-msg-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
