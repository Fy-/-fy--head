import type { App, Ref, ShallowReactive } from "vue";
import { El } from "./element";
type MaybeRef<T> = T | Ref<T>;
export interface FyHeadLazy {
    name?: string;
    title?: string;
    image?: string;
    imageType?: string;
    imageWidth?: string;
    imageHeight?: string;
    description?: string;
    published?: string;
    modified?: string;
    keywords?: string;
    type?: "blog" | "search" | "article" | "website";
    searchAction?: string;
    next?: string;
    prev?: string;
    canonical?: string;
    locale?: string;
    robots?: string;
    url?: string;
}
export declare class FyHead {
    elements: ShallowReactive<Map<string, El>>;
    context: Map<string, string[]>;
    currentContext?: string;
    constructor();
    static createHead(): FyHead;
    setContext(): string;
    clearContext(ctx: string): void;
    addToContext(key: string): void;
    install(app: App): void;
    reset(ctx: string): void;
    addElement(el: El): void;
    addTitle(title: string): void;
    addScript(src: string, key?: string, nonce?: string, async?: boolean): void;
    addLink(rel: string, href: string, key?: string | undefined): void;
    addMeta(value: string, content: string, type?: "name" | "property"): void;
    renderHeadToString(): {
        headTags: string;
        htmlAttrs: string;
        bodyAttrs: string;
        bodyTags: string;
    };
    lazySeo(data: MaybeRef<FyHeadLazy>, reset?: boolean): void;
    injectFyHead(): Element[];
}
export {};
