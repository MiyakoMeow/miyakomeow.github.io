<script setup>
defineProps({
  className: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div :class="['profile-card', className]">
    <div class="profile-header">
      <div class="avatar">
        <img src="https://github.com/MiyakoMeow.png" alt="Miyako Meow" />
      </div>
      <h1>Miyako Meow</h1>
      <p class="subtitle">Frontend Developer & Star Gazer</p>
    </div>
    
    <div class="bio">
      <p>
        Welcome to my corner of the universe. I build beautiful web experiences and explore the cosmos of code.
      </p>
    </div>

    <div class="links">
      <a href="https://github.com/miyakomeow" target="_blank" class="link-btn">
        GitHub
      </a>
      <a href="#" class="link-btn">
        Twitter
      </a>
      <a href="#" class="link-btn">
        Blog
      </a>
    </div>
  </div>
</template>

<style scoped>
.profile-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  color: white;
  max-width: 500px;
  width: 100%;
  text-align: center;
  animation: fadeIn 1s ease-out;
}

.avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
}

.avatar img:hover {
  transform: scale(1.05) rotate(5deg);
}

h1 {
  margin: 0.5rem 0;
  font-size: 2.5rem;
  background: linear-gradient(to right, #fff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #a5b4fc;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.bio {
  margin-bottom: 2.5rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.link-btn {
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
}

.link-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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
