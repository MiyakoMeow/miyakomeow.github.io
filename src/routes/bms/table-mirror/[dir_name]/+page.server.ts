import { redirect } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const prerender = false;

export const load: PageServerLoad = ({ params }) => {
  redirect(301, `/bms/table/mirror-proxy/${params.dir_name}`);
};
