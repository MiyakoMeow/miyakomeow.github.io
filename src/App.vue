<script setup>
import StarryBackground from "./components/StarryBackground.vue";
import ProfileCard from "./components/ProfileCard.vue";
</script>

<template>
  <StarryBackground />

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

.profile-card {
  max-width: 500px;
  width: 100%;
  text-align: center;
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
