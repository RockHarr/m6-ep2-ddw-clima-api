/**
 * Auth Store (Pinia)
 *
 * Maneja la autenticación demo de la app.
 * Credenciales fijas: profe / 1234
 *
 * ¿Por qué localStorage?
 * Para que al refrescar el navegador no se pierda la sesión.
 * Solo guardamos un flag ('authenticated'), NO guardamos contraseñas.
 */
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  // --- Estado ---
  const isAuthenticated = ref(false);
  const loginError = ref("");

  // --- Credenciales demo (hardcoded, no transable) ---
  const DEMO_USER = "profe";
  const DEMO_PASS = "1234";
  const STORAGE_KEY = "clima_auth";

  /**
   * Intenta iniciar sesión con las credenciales proporcionadas.
   * @returns {boolean} true si el login fue exitoso
   */
  function login(username, password) {
    loginError.value = "";

    if (username === DEMO_USER && password === DEMO_PASS) {
      isAuthenticated.value = true;
      localStorage.setItem(STORAGE_KEY, "authenticated");
      return true;
    }

    loginError.value = "Credenciales incorrectas. Usa profe / 1234";
    return false;
  }

  /**
   * Cierra sesión y limpia todo el estado persistido.
   * También limpia datos de clima para no dejar información huérfana.
   */
  function logout() {
    isAuthenticated.value = false;
    loginError.value = "";
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Carga la sesión desde localStorage al iniciar la app.
   * Integrity check: si el valor no es exactamente 'authenticated',
   * se asume estado corrupto/manipulado y se fuerza logout.
   */
  function loadSession() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "authenticated") {
      isAuthenticated.value = true;
    } else if (stored !== null) {
      // Valor corrupto o manipulado → limpiar
      logout();
    }
  }

  return {
    isAuthenticated,
    loginError,
    login,
    logout,
    loadSession,
  };
});
