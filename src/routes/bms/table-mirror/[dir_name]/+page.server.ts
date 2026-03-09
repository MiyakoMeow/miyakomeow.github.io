import { redirect } from "@sveltejs/kit";

export const prerender = false;

export const load = ({ params }) => {
  throw redirect(301, `/bms/table/mirror-proxy/${params.dir_name}`);
};
