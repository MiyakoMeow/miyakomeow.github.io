import { defineComponent } from "vue";
import BlogLayout from "../layout/BlogLayout";
import "../styles/main.pcss";
import QuickActions from "../components/QuickActions";
import "./BMS.pcss";

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
          <div class="glass-container bms-index-container">
            <h1 class="content-title">BMS</h1>
            <div class="links-grid">
              {links.map((link) => (
                <a key={link.href} class="link-card" href={link.href}>
                  <div class="link-title">{link.title}</div>
                  <div class="link-desc">{link.desc}</div>
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
