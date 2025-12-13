import { defineComponent } from "vue";
import "./ProfileCard.css";

export default defineComponent({
  name: "ProfileCard",
  props: {
    className: { type: String, required: false },
  },
  setup(props) {
    return () => (
      <div class={["glass-card", props.className]}>
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
          <a href="https://github.com/MiyakoMeow" target="_blank" class="link-btn">
            {" "}
            GitHub{" "}
          </a>
          <a href="https://space.bilibili.com/215242890" class="link-btn">
            {" "}
            Bilibili{" "}
          </a>
          <a href="https://x.com/MiyakoWoW" class="link-btn">
            {" "}
            X{" "}
          </a>
        </div>
      </div>
    );
  },
});
