<script setup>
/**
 * AppLayout — Envuelve NavBar + <router-view> con transición.
 * Controla la transición fade entre login ↔ dashboard.
 */
import NavBar from './NavBar.vue'
</script>

<template>
  <div class="app-layout">
    <NavBar />
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
  display: flex;
  flex-direction: column;
}
</style>
