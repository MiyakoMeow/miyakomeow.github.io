import { defineComponent } from "vue";
import BlogLayout from "./layout/BlogLayout";
import QuickActions from "./components/QuickActions";

export default defineComponent({
  name: "App",
  setup() {
    return () => (
      <>
        <BlogLayout>
          <section class="bg-white/10 backdrop-blur-[10px] rounded-[20px] p-8 mt-8 border border-white/10 text-white w-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-fadeIn">
            <h1 class="text-white text-center mb-8 text-[2.5rem] text-shadow-title">BMS</h1>
            <div class="flex flex-col gap-4 items-center mb-8">
              <a
                class="inline-block px-[1.5rem] py-[0.8rem] bg-white/10 border border-white/20 rounded-[12px] text-white no-underline transition-all duration-200 ease-in-out hover:bg-white/20 hover:-translate-y-0.5"
                href="/bms/index.html"
              >
                BMS 主页
              </a>
            </div>

            <h2 class="text-white text-center mb-8 text-[2.5rem] text-shadow-title">其他链接</h2>
            <div class="flex flex-row gap-4 justify-center items-center flex-wrap">
              <a
                class="inline-block px-[1.5rem] py-[0.8rem] bg-white/10 border border-white/20 rounded-[12px] text-white no-underline transition-all duration-200 ease-in-out hover:bg-white/20 hover:-translate-y-0.5"
                href="/bms/table/self-sp/index.html"
              >
                谱面合集（SP）
              </a>
              <a
                class="inline-block px-[1.5rem] py-[0.8rem] bg-white/10 border border-white/20 rounded-[12px] text-white no-underline transition-all duration-200 ease-in-out hover:bg-white/20 hover:-translate-y-0.5"
                href="/bms/table/self-dp/index.html"
              >
                谱面合集（DP）
              </a>
              <a
                class="inline-block px-[1.5rem] py-[0.8rem] bg-white/10 border border-white/20 rounded-[12px] text-white no-underline transition-all duration-200 ease-in-out hover:bg-white/20 hover:-translate-y-0.5"
                href="/bms/table-mirror/index.html"
              >
                表镜像
              </a>
            </div>
          </section>
        </BlogLayout>
        <QuickActions />
      </>
    );
  },
});
