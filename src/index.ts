import type { App, Ref } from "vue";
import { inject, watch, onBeforeUnmount, watchEffect, ref } from "vue";
import { FyHead } from "./fyhead";
import type { FyHeadLazy } from "./fyhead";

const useFyHead = () => {
  const fyhead = inject<FyHead>("fyhead");
  if (!fyhead) throw new Error("Did you apply app.use(fyhead)?");
  const __isBrowser__ = typeof window !== "undefined";
  if (__isBrowser__) {
    const ctx = fyhead.setContext();
    watchEffect(() => {
      fyhead.injectFyHead();
    });

    onBeforeUnmount(() => {
      fyhead.reset(ctx);
      fyhead.injectFyHead();
    });
  } else {
    fyhead.setContext();
  }
  return fyhead;
};

const createFyHead = () => FyHead.createHead();

export { useFyHead, createFyHead, FyHeadLazy };
