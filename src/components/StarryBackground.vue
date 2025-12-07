<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const canvasRef = ref(null);
let animationId = null;

onMounted(() => {
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");
  let width = window.innerWidth;
  let height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  const stars = [];
  const STAR_COUNT = 200;

  class Star {
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

    update() {
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

    draw() {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#0f0c29");
    gradient.addColorStop(0.5, "#302b63");
    gradient.addColorStop(1, "#24243e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    stars.forEach((star) => {
      star.update();
      star.draw();
    });

    animationId = requestAnimationFrame(animate);
  }

  animate();

  const handleResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  };

  window.addEventListener("resize", handleResize);

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
    cancelAnimationFrame(animationId);
  });
});
</script>

<template>
  <canvas ref="canvasRef" class="starry-background"></canvas>
</template>

<style scoped>
.starry-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}
</style>
