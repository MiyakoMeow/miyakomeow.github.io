<script lang="ts">
import StarryBackground from "../components/StarryBackground.svelte";
import ProfileCard from "../components/ProfileCard.svelte";
</script>

<StarryBackground />
<main class="blog-container">
  <aside class="sidebar">
    <div class="profile-card">
      <ProfileCard />
    </div>
  </aside>
  <section class="content">
    <slot />
  </section>
</main>

<style>
@reference "tailwindcss";

.blog-container {
  @apply grid grid-cols-[380px_1fr] gap-8 items-start max-w-[1400px] m-0 mx-auto p-8 w-full box-border;
}

.sidebar {
  @apply flex justify-center w-full mt-8;
}

.profile-card {
  @apply max-w-[360px] w-full animate-[fadeIn_0.8s_ease-out] m-0 mx-auto block;
}

.content {
  @apply w-full;
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
