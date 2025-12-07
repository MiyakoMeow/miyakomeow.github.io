<script setup>
import StarryBackground from "../components/StarryBackground.vue";

const links = [
  { href: "./self-table-sp/", title: "MiyakoMeow谱面合集（SP）", desc: "SP 谱面合集" },
  { href: "./self-table-dp/", title: "MiyakoMeow谱面合集（DP）", desc: "DP 谱面合集" },
];
</script>

<template>
  <div>
    <StarryBackground />
    <main class="container">
      <div class="bms-index-container">
        <h1>BMS</h1>
        <div class="links-grid">
          <a v-for="link in links" :key="link.href" class="link-card" :href="link.href">
            <div class="link-title">{{ link.title }}</div>
            <div class="link-desc">{{ link.desc }}</div>
          </a>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.bms-index-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.bms-index-container h1 {
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  gap: 1rem;
}

.link-card {
  display: block;
  padding: 1.25rem;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  transition:
    transform 0.15s ease,
    background 0.3s ease;
}

.link-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.06);
}

.link-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #64b5f6;
}

.link-desc {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 768px) {
  .container {
    padding: 1.5rem;
  }

  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
