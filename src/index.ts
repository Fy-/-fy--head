import type { Ref } from "vue";
import { inject, onBeforeUnmount, watchEffect, ref } from "vue";
import { FyHead } from "./fyhead";
import type { FyHeadObject, FyHeadObjectPlain, MaybeRef } from "./fyhead";
import type { El } from "./element";

const __isBrowser__ = typeof window !== "undefined";

const useFyHead = (_headTagsUser: MaybeRef<FyHeadObject>) => {
  const _headTagsPlain = ref(_headTagsUser) as Ref<FyHeadObjectPlain>;
  const fyhead = inject<FyHead>("fyhead");

  if (!fyhead) throw new Error("Did you apply app.use(fyhead)?");

  if (__isBrowser__) {
    let _headTags: El[] | undefined = [];

    watchEffect(() => {
      _headTags = fyhead.headToElements(_headTagsPlain.value);
      fyhead.updateDOM();
    });

    onBeforeUnmount(() => {
      if (_headTags) fyhead.removeHeadElements(_headTags);
      fyhead.updateDOM();
    });
  } else {
    const _headTags = fyhead.headToElements(_headTagsPlain.value);
    if (_headTags) fyhead.addElements(_headTags);
  }
  return fyhead;
};

const createFyHead = () => FyHead.createHead();

export { useFyHead, createFyHead, FyHeadObject, FyHeadObjectPlain };
