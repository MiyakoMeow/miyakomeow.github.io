<script lang="ts">
  interface Props {
    /** 子元素内容 */
    children?: import("svelte").Snippet;
    /** 自定义类名 */
    class?: string;
    /** 内边距变体 */
    padding?: "none" | "sm" | "md" | "lg";
    /** 圆角变体 */
    rounded?: "sm" | "md" | "lg" | "xl";
    /** 是否添加动画 */
    animate?: boolean;
    /** 背景透明度变体 */
    variant?: "default" | "light" | "dark";
    /** 自定义样式对象 */
    style?: Record<string, string>;
    /** 元素ID */
    id?: string;
  }

  let {
    children,
    class: className = "",
    padding = "lg",
    rounded = "xl",
    animate = false,
    variant = "default",
    style = {},
    id,
  }: Props = $props();

  const paddingConfig = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const roundedConfig = {
    sm: "rounded-[10px]",
    md: "rounded-[14px]",
    lg: "rounded-[18px]",
    xl: "rounded-[20px]",
  };

  const variantStyles = {
    default: {
      backgroundColor: "rgb(var(--glass-white-10))",
      borderColor: "rgb(var(--glass-white-10))",
    },
    light: {
      backgroundColor: "rgb(var(--glass-white-15))",
      borderColor: "rgb(var(--glass-white-15))",
    },
    dark: {
      backgroundColor: "rgb(var(--glass-black-20))",
      borderColor: "rgb(var(--glass-white-05))",
    },
  };

  const containerStyleString = $derived(
    Object.entries({
      backdropFilter: "blur(10px)",
      boxShadow: "0 8px 32px rgb(var(--glass-black-30))",
      transition:
        "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
      ...variantStyles[variant],
      ...style,
    })
      .map(([key, value]) => `${key}:${value}`)
      .join(";"),
  );
</script>

<div
  {id}
  class="relative block text-white {paddingConfig[padding]} {roundedConfig[rounded]} {className}"
  class:animate-fadeIn={animate}
  style={containerStyleString}
>
  {#if children}
    {@render children()}
  {/if}
</div>
