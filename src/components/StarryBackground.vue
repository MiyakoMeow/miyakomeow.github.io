<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId: number | null = null;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = window.innerWidth;
  let height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  const stars: Star[] = [];
  const STAR_COUNT = 200;

  class Star {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    fadeSpeed: number;
    fadeDirection: number;

    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2;
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.speedY = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random();
      this.fadeSpeed = 0.01 + Math.random() * 0.02;
      this.fadeDirection = 1;
    }

    update(): void {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      this.opacity += this.fadeSpeed * this.fadeDirection;
      if (this.opacity > 1) {
        this.opacity = 1;
        this.fadeDirection = -1;
      } else if (this.opacity < 0.2) {
        this.opacity = 0.2;
        this.fadeDirection = 1;
      }
    }

    draw(): void {
      ctx!.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx!.beginPath();
      ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx!.fill();
    }
  }

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star());
  }

  function animate(): void {
    ctx!.clearRect(0, 0, width, height);

    // Draw background gradient
    const gradient = ctx!.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#0f0c29");
    gradient.addColorStop(0.5, "#302b63");
    gradient.addColorStop(1, "#24243e");
    ctx!.fillStyle = gradient;
    ctx!.fillRect(0, 0, width, height);

    stars.forEach((star) => {
      star.update();
      star.draw();
    });

    animationId = requestAnimationFrame(animate);
  }

  animate();

  const handleResize = (): void => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  };

  window.addEventListener("resize", handleResize);

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
    }
  });
});
</script>

<template>
  <canvas ref="canvasRef" class="starry-background"></canvas>
</template>

<style lang="postcss" scoped>
@reference "tailwindcss";

.starry-background {
  @apply fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none;
}
</style>
