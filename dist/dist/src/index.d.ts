import { FyHead } from "./fyhead";
import type { FyHeadObject, FyHeadObjectPlain, MaybeRef } from "./fyhead";
declare const useFyHead: (_headTagsUser: MaybeRef<FyHeadObject>) => FyHead;
declare const createFyHead: () => FyHead;
export { useFyHead, createFyHead, FyHeadObject, FyHeadObjectPlain };
