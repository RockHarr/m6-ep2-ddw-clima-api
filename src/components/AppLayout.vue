<script setup>
/**
 * AppLayout — Envuelve NavBar + <router-view> con transición.
 * Controla la transición fade entre login ↔ dashboard.
 */
import NavBar from './NavBar.vue'
</script>

<template>
  <div class="app-layout">
    <!-- El NavBar ahora solo se muestra en el Login o como parte del layout si no hay auth -->
    <NavBar v-if="$route.name === 'Login'" />
    
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}
</style>
