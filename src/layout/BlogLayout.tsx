import { defineComponent } from "vue";
import StarryBackground from "../components/StarryBackground";
import ProfileCard from "../components/ProfileCard";

export default defineComponent({
  name: "BlogLayout",
  setup(_, { slots }) {
    return () => (
      <>
        <StarryBackground />
        <main class="grid grid-cols-[380px_1fr] gap-8 items-start max-w-[1400px] m-0 mx-auto p-8 w-full box-border">
          <aside class="flex justify-center w-full mt-8">
            <ProfileCard className="max-w-[360px] w-full animate-fadeIn m-0 mx-auto block" />
          </aside>
          <section class="w-full">{slots.default?.()}</section>
        </main>
      </>
    );
  },
});
