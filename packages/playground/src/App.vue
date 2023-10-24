<script setup lang="ts">
import { useFyHead } from "@fy-/head";
import { getUrl, getLocale } from "@karpeleslab/klbfw";

useFyHead({
  title: "Playground",
  metas: [
    {
      property: "og:type",
      content: "website",
    },
  ],
  links: [
    {
      rel: "canonical",
      href: `${getUrl().scheme}://${getUrl().host}${getUrl().path}`,
      key: "canonical",
    },
  ],
});
</script>
<template>
  <RouterView v-slot="{ Component }">
    <Suspense timeout="0">
      <component :is="Component" />
      <template #fallback>
        <div>Fallback...</div>
        <!--<DefaultLoader id="app-router-suspender" :force="true" />-->
      </template>
    </Suspense>
  </RouterView>
</template>
