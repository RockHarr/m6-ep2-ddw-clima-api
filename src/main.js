/**
 * main.js — Entry point de la app.
 *
 * Inicializa: Vue, Pinia (stores), Router.
 * Carga la sesión de auth ANTES de montar,
 * para que el guard del router sepa si el usuario
 * ya estaba autenticado.
 */
import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router/index.js";
import App from "./App.vue";
import "./styles/main.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Cargar sesión ANTES de montar para que el router guard funcione
import { useAuthStore } from "./stores/auth.store.js";
const authStore = useAuthStore();
authStore.loadSession();

app.mount("#app");
