<div class="glass-card">
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

<style>
  @reference "tailwindcss";

  .glass-card {
    @apply rounded-[16px] border border-white/20 bg-white/10 p-8 text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[10px];
    -webkit-backdrop-filter: blur(10px);
  }

  .glass-card .avatar img {
    @apply mb-4 h-[120px] w-[120px] rounded-full border-[4px] border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform duration-300;
    transition: transform 0.3s ease;
    &:hover {
      @apply scale-105 rotate-[5deg];
    }
  }

  .glass-card h1 {
    @apply my-2 bg-[linear-gradient(90deg,#a78bfa,#f472b6,#60a5fa)] bg-clip-text text-[2.5rem] text-transparent;
  }

  .glass-card .subtitle {
    @apply mb-8 text-[1.1rem] text-[#a5b4fc];
  }

  .glass-card .bio {
    @apply mb-10 leading-[1.6] text-white/90;
  }

  .glass-card .links {
    @apply flex flex-wrap justify-center gap-4;
  }

  .glass-card .link-btn {
    @apply rounded-[50px] border border-white/20 bg-white/10 px-[1.5rem] py-[0.8rem] font-medium text-white no-underline;
    transition: all 0.3s ease;
    &:hover {
      @apply bg-white/20 shadow-[0_5px_15px_rgba(0,0,0,0.2)];
      transform: translateY(-2px);
    }
  }
</style>
