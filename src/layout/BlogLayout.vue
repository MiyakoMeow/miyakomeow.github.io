<script setup lang="ts">
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

<style lang="postcss" scoped>
@reference "tailwindcss";

.blog-container {
  @apply grid grid-cols-[380px_1fr] gap-8 items-start max-w-[1400px] m-0 mx-auto p-8 w-full box-border;
  @media (max-width: 1024px) {
    @apply grid-cols-1 max-w-[95%] p-6;
  }
  @media (max-width: 768px) {
    @apply max-w-full p-4;
  }
}

.sidebar {
  @apply flex justify-center w-full;
  @media (min-width: 769px) {
    @apply mt-8;
  }
}

.profile-card {
  @apply max-w-[360px] w-full animate-[fadeIn_0.8s_ease-out] m-0 mx-auto block;
}

.content {
  @apply w-full;
  @media (max-width: 768px) {
    @apply flex justify-center;
    :deep(.glass-container) {
      @apply max-w-[360px] w-full;
    }
  }
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
