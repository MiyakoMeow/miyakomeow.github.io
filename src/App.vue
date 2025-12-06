<script setup>
import StarryBackground from './components/StarryBackground.vue'
import ProfileCard from './components/ProfileCard.vue'
</script>

<template>
  <StarryBackground />
  <a
    href="https://github.com/MiyakoMeow"
    target="_blank"
    rel="noopener noreferrer"
    class="fixed top-4 right-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg"
  >
    GitHub
  </a>
  
  <main class="container">
    <ProfileCard className="profile-card" />
  </main>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  padding: 2rem;
  box-sizing: border-box;
}
</style>
