<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/stores";
</script>

<meta
  http-equiv="refresh"
  content="0;url={resolve(`/bms/table/mirror-proxy/${$page.params.dir_name}`)}"
/>

<p>
  <a href={resolve(`/bms/table/mirror-proxy/${$page.params.dir_name}`)}
    >Redirecting to /bms/table/mirror-proxy/{$page.params.dir_name}</a
  >...
</p>
