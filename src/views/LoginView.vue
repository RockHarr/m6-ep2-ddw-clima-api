<script setup>
/**
 * LoginView — Pantalla de login.
 *
 * Credenciales demo: profe / 1234
 * - Valida contra el auth store
 * - Error visible con role="alert"
 * - Submit con Enter o click
 * - Diseño: card glassmorphism centrada
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'
import AuroraBackground from '@/components/AuroraBackground.vue'
import AppLogo from '@/components/AppLogo.vue'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showCredentials = ref(false)

function handleLogin() {
  const success = authStore.login(username.value, password.value)
  if (success) {
    router.push({ name: 'Dashboard' })
  }
}
</script>

<template>
  <main class="login-page">
    <AuroraBackground
      :colorStops="['#0f172a', '#4361ee', '#06d6a0']"
      :amplitude="1.2"
      :blend="0.6"
      :intensity="0.9"
      :speed="0.6"
    />
    <div class="login-card">
      <!-- Logo -->
      <div class="login-card__header">
        <AppLogo :size="72" :glow="true" class="login-card__logo" />
        <h1 class="login-card__title">ClimaApp</h1>
      </div>

      <!-- Formulario -->
      <form class="login-card__form" @submit.prevent="handleLogin">
        <div class="login-card__field">
          <label for="login-user" class="login-card__label">Usuario</label>
          <input
            id="login-user"
            v-model="username"
            type="text"
            class="login-card__input"
            placeholder="Ingresa tu usuario"
            autocomplete="username"
            required
          />
        </div>

        <div class="login-card__field">
          <label for="login-pass" class="login-card__label">Contraseña</label>
          <input
            id="login-pass"
            v-model="password"
            type="password"
            class="login-card__input"
            placeholder="Ingresa tu contraseña"
            autocomplete="current-password"
            required
          />
        </div>

        <!-- Error con role="alert" para lectores de pantalla -->
        <p
          v-if="authStore.loginError"
          class="login-card__error"
          role="alert"
        >
          ⚠️ {{ authStore.loginError }}
        </p>

        <button type="submit" class="login-card__submit">
          Iniciar Sesión
        </button>
      </form>

      <!-- Ayuda Pruebas -->
      <div class="login-card__helper">
        <button
          class="login-card__helper-btn"
          @click="showCredentials = !showCredentials"
          aria-label="Ver credenciales de prueba"
        >
          ℹ️ Datos de acceso
        </button>
        <div v-if="showCredentials" class="login-card__credentials">
          <p><strong>Usuario:</strong> profe</p>
          <p><strong>Clave:</strong> 1234</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  position: relative;
  overflow: hidden;
  background: var(--color-bg);
}

.login-card {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
  /* Glassmorphism */
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  padding: var(--space-3xl);
  box-shadow: var(--shadow-lg);
  animation: slide-up 0.6s ease-out;
}

.login-card__header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.login-card__logo {
  margin: 0 auto var(--space-md);
}

.login-card__title {
  color: var(--color-text);
}

.login-card__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.login-card__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.login-card__label {
  font-size: var(--font-size-small);
  font-weight: 500;
  color: var(--color-text-muted);
}

.login-card__input {
  padding: var(--space-md) var(--space-lg);
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--color-surface);
  border-radius: var(--radius-md);
  color: var(--color-text);
  min-height: 44px;
  transition: border-color var(--transition-fast),
              box-shadow var(--transition-fast);
}

.login-card__input::placeholder {
  color: var(--color-text-placeholder);
}

.login-card__input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
  outline: none;
}

.login-card__error {
  color: var(--color-error);
  font-size: var(--font-size-small);
  text-align: center;
  padding: var(--space-md);
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.login-card__submit {
  width: 100%;
  padding: var(--space-lg);
  background: var(--color-primary);
  color: white;
  font-weight: 700;
  font-size: var(--font-size-body);
  border-radius: var(--radius-md);
  min-height: 48px;
  transition: background-color var(--transition-fast),
              transform var(--transition-fast),
              box-shadow var(--transition-fast);
}

.login-card__submit:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(67, 97, 238, 0.4);
}

/* Helper styles */
.login-card__helper {
  margin-top: var(--space-xl);
  text-align: center;
}

.login-card__helper-btn {
  color: var(--color-text-muted);
  font-size: var(--font-size-small);
  text-decoration: underline;
  opacity: 0.8;
  transition: opacity var(--transition-fast);
}

.login-card__helper-btn:hover {
  opacity: 1;
}

.login-card__credentials {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  color: var(--color-text-muted);
  border: 1px dashed var(--color-surface);
  animation: fade-in 0.3s ease;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
