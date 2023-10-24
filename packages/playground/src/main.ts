import { createApp as createRegularApp, createSSRApp } from "vue";
import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
} from "vue-router";
import { createFyHead } from "@fy-/head";
import { createPinia } from "pinia";
import { getPrefix } from "@karpeleslab/klbfw";
import routes from "./routes";
import App from "./AppSuspender.vue";

export const createApp = async (isSSR = false) => {
  const pinia = createPinia();
  const head = createFyHead();
  const app = isSSR ? createSSRApp(App) : createRegularApp(App);
  const router = createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory(getPrefix())
      : createWebHistory(getPrefix()),
    routes,
    scrollBehavior(to) {
      if (to.hash) {
        return {
          el: to.hash,
        };
      }
    },
  });
  router.afterEach((to) => {
    if (typeof window !== "undefined" && !to.hash) window.scrollTo(0, 0);
  });
  app.use(head);
  app.use(pinia);
  app.use(router);

  return { app, router, head, pinia };
};

createApp(false).then(({ app, router, pinia }) => {
  router.isReady().then(async () => {
    app.mount("#app");
  });
});
