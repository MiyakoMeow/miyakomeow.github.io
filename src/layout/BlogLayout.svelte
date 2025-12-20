<script lang="ts">
  import StarryBackground from "../components/StarryBackground.svelte";
  import ProfileCard from "../components/ProfileCard.svelte";
</script>

<StarryBackground />
<main
  class="m-0 mx-auto box-border grid w-full max-w-[1400px] grid-cols-[380px_1fr] items-start gap-8 p-8"
>
  <aside class="mt-8 flex w-full justify-center">
    <div class="m-0 mx-auto block w-full max-w-[360px] animate-fadeIn">
      <ProfileCard />
    </div>
  </aside>
  <section class="w-full">
    <slot />
  </section>
</main>
