
/**
 * @fy-/head v0.0.16
 * (c) 2022 Florian "Fy" Gasquez
 * Released under the MIT License
 */

import { reactive, shallowRef, inject, watchEffect, onBeforeUnmount } from 'vue';

function generateUUID() {
    var d = new Date().getTime();
    var d2 = (typeof performance !== "undefined" &&
        performance.now &&
        performance.now() * 1000) ||
        0;
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        var r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        }
        else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
}

class ElProperty {
    key;
    value;
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
    toString() {
        return this.value ? `${this.key}="${this.value}"` : this.key;
    }
}
class El {
    tag;
    properties;
    content;
    key;
    uuid;
    constructor(tag, properties = [], key, content) {
        this.tag = tag;
        this.properties = properties;
        this.content = content;
        if (key)
            this.key = key;
        else
            this.key = this.getKey();
        this.uuid = generateUUID();
    }
    getKey() {
        return generateUUID();
    }
    toStringProperties() {
        let propertiesString = "";
        for (const property of this.properties) {
            propertiesString += ` ${property.toString()}`;
        }
        return propertiesString.trim();
    }
    toString() {
        return `<${this.tag} ${this.toStringProperties()}>${this.content ? this.content : ""}</${this.tag}>`;
    }
    toDom(doc) {
        const el = doc.createElement(this.tag);
        for (const property of this.properties) {
            el.setAttribute(property.key, property.value ? property.value : "");
        }
        if (this.content) {
            el.innerText = this.content;
        }
        return el;
    }
}

const __fyHeadCount__ = "fyhead:count";
class FyHead {
    elements;
    context;
    currentContext;
    constructor() {
        this.elements = reactive(new Map());
        this.context = new Map();
        this.currentContext = generateUUID();
    }
    static createHead() {
        const head = new FyHead();
        return head;
    }
    setContext() {
        this.currentContext = generateUUID();
        return this.currentContext;
    }
    clearContext(ctx) {
        this.currentContext = undefined;
        this.context.delete(ctx);
    }
    addToContext(key) {
        if (this.currentContext) {
            if (!this.context.has(this.currentContext))
                this.context.set(this.currentContext, []);
            this.context.get(this.currentContext)?.push(key);
        }
    }
    install(app) {
        if (app.config.globalProperties) {
            app.config.globalProperties.$fyhead = this;
            app.provide("fyhead", this);
        }
    }
    reset(ctx) {
        for (const el of this.elements.values()) {
            if (this.context.get(ctx)?.includes(el.uuid))
                this.elements.delete(el.key);
        }
        this.clearContext(ctx);
    }
    addElement(el) {
        if (!this.currentContext) {
            console.log("Warning: Trying to add element without context: ", el);
            return;
        }
        this.addToContext(el.uuid);
        this.elements.set(el.key, el);
    }
    addTitle(title) {
        this.addElement(new El("title", [], "title", title));
    }
    addScript(src, key, nonce, async = false) {
        if (!key)
            key = generateUUID();
        const properties = [new ElProperty("id", key), new ElProperty("src", src)];
        if (async)
            properties.push(new ElProperty("async"));
        if (nonce)
            properties.push(new ElProperty("nonce", nonce));
        this.addElement(new El("script", properties, key));
    }
    addLink(rel, href, key = undefined) {
        if (!key)
            key = generateUUID();
        this.addElement(new El("link", [new ElProperty("rel", rel), new ElProperty("href", href)], key));
    }
    addMeta(value, content, type = "property") {
        const key = value + "-" + type;
        this.addElement(new El("meta", [new ElProperty(type, value), new ElProperty("content", content)], key));
    }
    renderHeadToString() {
        let headTags = "";
        Object.values(this.elements).forEach((el) => {
            headTags += `${el.toString()}\n`;
        });
        const htmlAttrs = "";
        const bodyAttrs = "";
        const bodyTags = "";
        return {
            headTags,
            htmlAttrs,
            bodyAttrs,
            bodyTags,
        };
    }
    lazySeo(data, reset = false) {
        data = shallowRef(data);
        if (data.value.url) {
            this.addMeta("og:url", data.value.url);
        }
        if (data.value.canonical) {
            this.addLink("canonical", data.value.canonical);
        }
        if (data.value.robots) {
            this.addMeta("robots", data.value.robots, "name");
        }
        if (data.value.type) {
            this.addMeta("og:type", data.value.type);
        }
        if (data.value.title) {
            this.addTitle(data.value.title);
        }
        if (data.value.description) {
            this.addMeta("og:description", data.value.description);
            this.addMeta("twitter:description", data.value.description, "name");
            this.addMeta("description", data.value.description, "name");
            this.addMeta("og:description", data.value.description);
        }
        if (data.value.modified) {
            this.addMeta("article:modified_time", data.value.modified);
        }
        if (data.value.published) {
            this.addMeta("article:published_time", data.value.published);
        }
        if (data.value.imageWidth && data.value.imageHeight) {
            this.addMeta("og:image:width", data.value.imageWidth);
            this.addMeta("og:image:height", data.value.imageHeight);
        }
        if (data.value.imageType) {
            this.addMeta("og:image:type", data.value.imageType);
        }
        if (data.value.image) {
            this.addMeta("og:image", data.value.image);
            this.addMeta("twitter:image", data.value.image, "name");
        }
        if (data.value.next) {
            this.addLink("next", data.value.next);
        }
        if (data.value.prev) {
            this.addLink("prev", data.value.prev);
        }
    }
    injectFyHead() {
        const newElements = [];
        const oldElements = [];
        if (document && document.head) {
            let headCountEl = document.querySelector(`meta[name="${__fyHeadCount__}"]`);
            const headCount = headCountEl
                ? Number(headCountEl.getAttribute("content"))
                : 0;
            if (headCountEl) {
                for (let i = 0, j = headCountEl.previousElementSibling; i < headCount; i++) {
                    if (j) {
                        oldElements.push(j);
                    }
                    j = j ? j.previousElementSibling : null;
                }
            }
            if (!headCountEl)
                headCountEl = document.createElement("meta");
            headCountEl.setAttribute("name", __fyHeadCount__);
            headCountEl.setAttribute("content", "0");
            document.head.append(headCountEl);
            for (const el of this.elements.values()) {
                const elDom = el.toDom(document);
                newElements.push(elDom);
            }
            newElements.forEach((n) => {
                document.head.insertBefore(n, headCountEl);
            });
            oldElements.forEach((n) => {
                n.remove();
            });
            headCountEl.setAttribute("content", newElements.length.toString());
        }
        return newElements;
    }
}

const useFyHead = () => {
    const fyhead = inject("fyhead");
    if (!fyhead)
        throw new Error("Did you apply app.use(fyhead)?");
    const __isBrowser__ = typeof window !== "undefined";
    const ctx = fyhead.setContext();
    if (__isBrowser__) {
        watchEffect(() => {
            fyhead.injectFyHead();
        });
        onBeforeUnmount(() => {
            fyhead.reset(ctx);
            fyhead.injectFyHead();
        });
    }
    return fyhead;
};
const createFyHead = () => FyHead.createHead();

export { createFyHead, useFyHead };
