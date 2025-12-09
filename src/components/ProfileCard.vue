<script setup lang="ts">
interface Props {
  className?: string;
}

defineProps<Props>();
</script>

<template>
  <div :class="['glass-card', className]">
    <div class="profile-header">
      <div class="avatar">
        <img src="https://github.com/MiyakoMeow.png" alt="Miyako Meow" />
      </div>
      <h1>MiyakoMeow</h1>
      <p class="subtitle">一个天天摸鱼的大学生。</p>
    </div>

    <div class="bio">
      <p>欢迎来到我的个人主页！</p>
    </div>

    <div class="links">
      <a href="https://github.com/MiyakoMeow" target="_blank" class="link-btn"> GitHub </a>
      <a href="https://space.bilibili.com/215242890" class="link-btn"> Bilibili </a>
      <a href="https://x.com/MiyakoWoW" class="link-btn"> X </a>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@reference "tailwindcss";

.glass-card {
  @apply text-white;
}

.avatar img {
  @apply w-[120px] h-[120px] rounded-full border-[4px] border-white/30 mb-4 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform duration-300;
  transition: transform 0.3s ease;
  &:hover {
    @apply scale-105 rotate-[5deg];
  }
}

h1 {
  @apply my-2 text-[2.5rem] bg-[linear-gradient(90deg,#a78bfa,#f472b6,#60a5fa)] bg-clip-text text-transparent;
  -background-clip: text;
  -text-fill-color: transparent;
}

.subtitle {
  @apply text-[#a5b4fc] text-[1.1rem] mb-8;
}

.bio {
  @apply mb-10 leading-[1.6] text-white/90;
}

.links {
  @apply flex gap-4 justify-center flex-wrap;
}

.link-btn {
  @apply px-[1.5rem] py-[0.8rem] bg-white/10 border border-white/20 rounded-[50px] text-white no-underline font-medium;
  transition: all 0.3s ease;
  &:hover {
    @apply bg-white/20 shadow-[0_5px_15px_rgba(0,0,0,0.2)];
    transform: translateY(-2px);
  }
}
</style>
