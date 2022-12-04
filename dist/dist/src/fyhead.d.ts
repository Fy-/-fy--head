import type { App, Ref, UnwrapRef } from "vue";
import { El } from "./element";
export type MaybeRef<T> = T | Ref<T>;
export interface FyHeadObject {
    title: MaybeRef<string>;
    metas: MaybeRef<{
        name?: string;
        property?: string;
        content: string;
    }[]>;
    links: MaybeRef<{
        rel: string;
        href: string;
        key?: string;
    }[]>;
    scripts: MaybeRef<{
        src: string;
        id: string;
        nonce?: string;
        async?: boolean;
    }[]>;
}
export type FyHeadObjectPlain = UnwrapRef<FyHeadObject>;
export declare class FyHead {
    elements: Map<string, El>;
    constructor();
    static createHead(): FyHead;
    install(app: App): void;
    headToElements(_headTags: FyHeadObjectPlain): El[] | undefined;
    removeHeadElements(els: El[]): void;
    addElements(els: El[]): void;
    static createTitle(title: string): El;
    static createScript(src: string, key?: string, nonce?: string, async?: boolean): El;
    static createLink(rel: string, href: string, key?: string | undefined): El;
    static createMeta(value: string, content: string, type?: "name" | "property"): El;
    renderHeadToString(): {
        headTags: string;
        htmlAttrs: string;
        bodyAttrs: string;
        bodyTags: string;
    };
    updateDOM(): Element[];
}
