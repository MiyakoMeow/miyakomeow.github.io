import { defineComponent } from "vue";
import StarryBackground from "../components/StarryBackground";
import ProfileCard from "../components/ProfileCard";
import "./BlogLayout.pcss";

export default defineComponent({
  name: "BlogLayout",
  setup(_, { slots }) {
    return () => (
      <>
        <StarryBackground />
        <main class="blog-container">
          <aside class="sidebar">
            <ProfileCard className="profile-card" />
          </aside>
          <section class="content">{slots.default?.()}</section>
        </main>
      </>
    );
  },
});
