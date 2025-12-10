import { defineComponent } from "vue";
import "./QuickActions.pcss";

export default defineComponent({
  name: "QuickActions",
  setup() {
    function scrollToTop(): void {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function goHome(): void {
      window.location.href = "/";
    }

    return () => (
      <div class="floating-actions">
        <button class="fab" type="button" aria-label="主页" title="主页" onClick={goHome}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="icon"
            fill="currentColor"
          >
            <path d="M12 3.172 3 10.172V21h6v-5h6v5h6V10.172L12 3.172z" />
          </svg>
        </button>
        <button
          class="fab"
          type="button"
          aria-label="回到顶部"
          title="回到顶部"
          onClick={scrollToTop}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="icon"
            fill="currentColor"
          >
            <path d="M12 4l-7 7h4v9h6v-9h4L12 4z" />
          </svg>
        </button>
      </div>
    );
  },
});
