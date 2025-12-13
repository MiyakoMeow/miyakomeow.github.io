import { defineComponent } from "vue";
import BlogLayout from "./layout/BlogLayout";
import "./styles/main.css";
import QuickActions from "./components/QuickActions";
import "./App.css";

export default defineComponent({
  name: "App",
  setup() {
    return () => (
      <>
        <BlogLayout>
          <section class="glass-container">
            <h1 class="link-title">BMS</h1>
            <div class="link-list bms-main-link">
              <a class="link-item" href="/bms/index.html">
                BMS 主页
              </a>
            </div>

            <h2 class="link-title">其他链接</h2>
            <div class="link-list-horizontal">
              <a class="link-item" href="/bms/table/self-sp/index.html">
                谱面合集（SP）
              </a>
              <a class="link-item" href="/bms/table/self-dp/index.html">
                谱面合集（DP）
              </a>
              <a class="link-item" href="/bms/table-mirror/index.html">
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
