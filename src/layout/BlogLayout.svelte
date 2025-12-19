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
    @apply m-0 mx-auto box-border grid w-full max-w-[1400px] grid-cols-[380px_1fr] items-start gap-8 p-8;
  }

  .sidebar {
    @apply mt-8 flex w-full justify-center;
  }

  .profile-card {
    @apply m-0 mx-auto block w-full max-w-[360px] animate-[fadeIn_0.8s_ease-out];
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
