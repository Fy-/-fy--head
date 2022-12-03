export declare class ElProperty {
    key: string;
    value?: string;
    constructor(key: string, value?: string);
    toString(): string;
}
type ElTag = "meta" | "link" | "script" | "title";
export declare class El {
    tag: ElTag;
    properties: ElProperty[];
    content?: string;
    key: string;
    uuid: string;
    constructor(tag: ElTag, properties?: ElProperty[], key?: string, content?: string);
    getKey(): string;
    toStringProperties(): string;
    toString(): string;
    toDom(doc: Document): HTMLMetaElement | HTMLLinkElement | HTMLScriptElement | HTMLTitleElement;
}
export {};
