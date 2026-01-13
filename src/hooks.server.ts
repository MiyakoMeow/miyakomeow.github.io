import type { Handle } from "@sveltejs/kit";

export const handle: Handle = ({ event, resolve }) => {
  // 对于静态部署，使用简单的 handle 函数
  // 语言切换完全由客户端处理
  return resolve(event);
};
