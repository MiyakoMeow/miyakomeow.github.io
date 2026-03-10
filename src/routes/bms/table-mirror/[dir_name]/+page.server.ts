import { redirect } from "@sveltejs/kit";

export const prerender = false;

export const load = ({ params }: { params: { dir_name: string } }) => {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw redirect(301, `/bms/table/mirror-proxy/${params.dir_name}`);
};
