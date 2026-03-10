<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/stores";

  const targetDirName = $page.params.dir_name;
  const redirectUrl = resolve(`/bms/table/mirror-proxy/${targetDirName}`, {});
</script>

<svelte:head>
  <meta http-equiv="refresh" content={redirectUrl} />
</svelte:head>

<p>
  <a href={redirectUrl}
    >Redirecting to /bms/table/mirror-proxy/{decodeURIComponent(targetDirName)}</a
  >...
</p>
