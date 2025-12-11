import { defineComponent } from "vue";
import BlogLayout from "../layout/BlogLayout";
import QuickActions from "../components/QuickActions";

interface LinkItem {
  href: string;
  title: string;
  desc: string;
}

export default defineComponent({
  name: "BMS",
  setup() {
    const links: LinkItem[] = [
      { href: "/bms/table/self-sp/", title: "MiyakoMeow谱面合集（SP）", desc: "SP 谱面合集" },
      { href: "/bms/table/self-dp/", title: "MiyakoMeow谱面合集（DP）", desc: "DP 谱面合集" },
      { href: "/bms/table-mirror/", title: "表镜像", desc: "无参数显示导航，有参数跳转" },
    ];

    return () => (
      <>
        <BlogLayout>
          <div class="bg-white/10 backdrop-blur-[10px] rounded-[20px] p-8 mt-8 border border-white/10 text-white w-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-fadeIn">
            <h1 class="text-white text-center mb-8 text-[2.5rem] text-shadow-title">BMS</h1>
            <div class="grid grid-cols-[repeat(2,minmax(240px,1fr))] gap-4 mt-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  class="block p-[1.25rem] rounded-[14px] bg-black/20 border border-white/10 text-white no-underline transition-transform duration-150 ease-in-out transition-colors duration-300 ease-in-out hover:bg-white/6 hover:-translate-y-0.5"
                  href={link.href}
                >
                  <div class="text-[1.2rem] font-bold mb-[0.5rem] text-[#64b5f6]">{link.title}</div>
                  <div class="text-[0.95rem] text-white/80">{link.desc}</div>
                </a>
              ))}
            </div>
          </div>
        </BlogLayout>
        <QuickActions />
      </>
    );
  },
});
