import { redirect } from "@sveltejs/kit";

export const prerender = false;

export const load = () => {
  redirect(301, "/bms/table/mirror-proxy");
};
