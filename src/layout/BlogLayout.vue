<script setup lang="ts">
import StarryBackground from "../components/StarryBackground.vue";
import ProfileCard from "../components/ProfileCard.tsx";
import "./BlogLayout.pcss";
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
