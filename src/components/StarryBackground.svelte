<script lang="ts">
import { onMount } from "svelte";

class Star {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
  fadeDirection: number;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 2;
    this.speedX = (Math.random() - 0.5) * 0.2;
    this.speedY = (Math.random() - 0.5) * 0.2;
    this.opacity = Math.random();
    this.fadeSpeed = 0.01 + Math.random() * 0.02;
    this.fadeDirection = 1;
  }

  update(width: number, height: number): void {
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

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

let canvasRef: HTMLCanvasElement | null = null;

onMount(() => {
  const canvas = canvasRef;
  if (!canvas) return;

  const rawCtx = canvas.getContext("2d");
  if (!rawCtx) return;
  const ctx: CanvasRenderingContext2D = rawCtx;

  let width = window.innerWidth;
  let height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  const stars: Star[] = [];
  const STAR_COUNT = 200;

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star(width, height));
  }

  let animationId: number | null = null;

  function animate(): void {
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#0f0c29");
    gradient.addColorStop(0.5, "#302b63");
    gradient.addColorStop(1, "#24243e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    stars.forEach((star) => {
      star.update(width, height);
      star.draw(ctx);
    });

    animationId = requestAnimationFrame(animate);
  }

  const handleResize = (): void => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  };

  window.addEventListener("resize", handleResize);
  animate();

  return () => {
    window.removeEventListener("resize", handleResize);
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
    }
  };
});
</script>

<canvas bind:this={canvasRef} class="starry-background"></canvas>

<style>
@reference "tailwindcss";

.starry-background {
  @apply fixed top-0 left-0 w-full h-full z-0 pointer-events-none;
}
</style>
