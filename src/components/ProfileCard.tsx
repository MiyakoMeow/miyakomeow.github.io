import { defineComponent } from "vue";

export default defineComponent({
  name: "ProfileCard",
  props: {
    className: { type: String, required: false },
  },
  setup(props) {
    return () => (
      <div
        class={[
          "bg-white/10 backdrop-blur-[10px] border border-white/20 rounded-[16px] p-8 text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)]",
          props.className,
        ]}
      >
        <div>
          <div>
            <img
              src="https://github.com/MiyakoMeow.png"
              alt="Miyako Meow"
              class="w-[120px] h-[120px] rounded-full border-[4px] border-white/30 mb-4 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform duration-300 hover:scale-105 hover:rotate-[5deg]"
            />
          </div>
          <h1
            class="my-2 text-[2.5rem] bg-clip-text text-transparent"
            style={{
              background: "linear-gradient(90deg,#a78bfa,#f472b6,#60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            MiyakoMeow
          </h1>
          <p class="text-[#a5b4fc] text-[1.1rem] mb-8">一个天天摸鱼的大学生。</p>
        </div>

        <div class="mb-10 leading-[1.6] text-white/90">
          <p>欢迎来到我的个人主页！</p>
        </div>

        <div class="flex gap-4 justify-center flex-wrap">
          <a
            href="https://github.com/MiyakoMeow"
            target="_blank"
            class="px-[1.5rem] py-[0.8rem] bg-white/10 border border-white/20 rounded-[50px] text-white no-underline font-medium transition-all duration-300 ease-in-out hover:bg-white/20 hover:shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5"
          >
            {" "}
            GitHub{" "}
          </a>
          <a
            href="https://space.bilibili.com/215242890"
            class="px-[1.5rem] py-[0.8rem] bg-white/10 border border-white/20 rounded-[50px] text-white no-underline font-medium transition-all duration-300 ease-in-out hover:bg-white/20 hover:shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5"
          >
            {" "}
            Bilibili{" "}
          </a>
          <a
            href="https://x.com/MiyakoWoW"
            class="px-[1.5rem] py-[0.8rem] bg-white/10 border border-white/20 rounded-[50px] text-white no-underline font-medium transition-all duration-300 ease-in-out hover:bg-white/20 hover:shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5"
          >
            {" "}
            X{" "}
          </a>
        </div>
      </div>
    );
  },
});
