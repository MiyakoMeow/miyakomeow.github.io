<script setup>
import StarryBackground from "../components/StarryBackground.vue";
import ProfileCard from "../components/ProfileCard.vue";
</script>

<template>
  <StarryBackground />
  <main class="blog-container">
    <aside class="sidebar">
      <ProfileCard className="profile-card" />
    </aside>
    <section class="content">
      <slot />
    </section>
  </main>
  
</template>

<style scoped>
.blog-container {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 2rem;
  align-items: start;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.sidebar {
  display: flex;
  justify-content: center;
}

.profile-card {
  max-width: 360px;
  width: 100%;
  animation: fadeIn 0.8s ease-out;
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

@media (max-width: 1024px) {
  .blog-container {
    grid-template-columns: 1fr;
  }
}
</style>
