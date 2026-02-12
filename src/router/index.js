/**
 * Router — Rutas y Navigation Guard
 *
 * ¿Por qué existe el guard?
 * Para proteger la ruta "/" (dashboard). Si el usuario
 * no está autenticado, se redirige a /login.
 * Si ya está autenticado e intenta ir a /login, se redirige a /.
 * Esto evita que URLs públicas muestren datos privados.
 */
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store.js";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/LoginView.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    name: "Dashboard",
    component: () => import("@/views/DashboardView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * Navigation Guard global.
 * Se ejecuta ANTES de cada navegación.
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Ruta protegida + no autenticado → al login
    next({ name: "Login" });
  } else if (to.name === "Login" && authStore.isAuthenticated) {
    // Ya autenticado intentando ir al login → al dashboard
    next({ name: "Dashboard" });
  } else {
    next();
  }
});

export default router;
