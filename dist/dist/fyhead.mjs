
/**
 * @fy-/head v0.0.20
 * (c) 2022 Florian "Fy" Gasquez
 * Released under the MIT License
 */

import { ref, inject, watchEffect, onBeforeUnmount } from 'vue';

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
    constructor() {
        this.elements = new Map();
    }
    static createHead() {
        const head = new FyHead();
        return head;
    }
    install(app) {
        if (app.config.globalProperties) {
            app.config.globalProperties.$fyhead = this;
            app.provide("fyhead", this);
        }
    }
    headToElements(_headTags) {
        if (!_headTags)
            return;
        const els = [];
        for (const key of Object.keys(_headTags)) {
            if (key == "title") {
                els.push(FyHead.createTitle(_headTags[key]));
            }
            else if (key == "links") {
                const links = _headTags[key];
                links.forEach((link) => {
                    els.push(FyHead.createLink(link.rel, link.href, link.key));
                });
            }
            else if (key == "metas") {
                const metas = _headTags[key];
                metas.forEach((meta) => {
                    if (meta.property)
                        els.push(FyHead.createMeta(meta.property, meta.content, "property"));
                    else if (meta.name)
                        els.push(FyHead.createMeta(meta.name, meta.content, "name"));
                });
            }
            else if (key == "scripts") {
                const scripts = _headTags[key];
                scripts.forEach((script) => {
                    els.push(FyHead.createScript(script.src, script.id, script.nonce, script.async));
                });
            }
        }
        this.addElements(els);
        return els;
    }
    removeHeadElements(els) {
        for (const el of this.elements.values()) {
            if (els.find((item) => item.uuid === el.uuid))
                this.elements.delete(el.key);
        }
    }
    addElements(els) {
        els.forEach((el) => {
            this.elements.set(el.key, el);
        });
    }
    static createTitle(title) {
        return new El("title", [], "title", title);
    }
    static createScript(src, key, nonce, async = false) {
        if (!key)
            key = generateUUID();
        const properties = [new ElProperty("id", key), new ElProperty("src", src)];
        if (async)
            properties.push(new ElProperty("async"));
        if (nonce)
            properties.push(new ElProperty("nonce", nonce));
        return new El("script", properties, key);
    }
    static createLink(rel, href, key = undefined) {
        if (!key)
            key = generateUUID();
        return new El("link", [new ElProperty("rel", rel), new ElProperty("href", href)], key);
    }
    static createMeta(value, content, type = "property") {
        const key = value + "-" + type;
        return new El("meta", [new ElProperty(type, value), new ElProperty("content", content)], key);
    }
    renderHeadToString() {
        let headTags = "";
        for (const el of this.elements.values()) {
            headTags += `${el.toString()}\n`;
        }
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
    updateDOM() {
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
                if (el.tag === "title") {
                    if (el.content) {
                        document.title = el.content;
                    }
                }
                else {
                    const elDom = el.toDom(document);
                    newElements.push(elDom);
                }
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

const __isBrowser__ = typeof window !== "undefined";
const useFyHead = (_headTagsUser) => {
    const _headTagsPlain = ref(_headTagsUser);
    const fyhead = inject("fyhead");
    if (!fyhead)
        throw new Error("Did you apply app.use(fyhead)?");
    if (__isBrowser__) {
        let _headTags = [];
        watchEffect(() => {
            _headTags = fyhead.headToElements(_headTagsPlain.value);
            fyhead.updateDOM();
        });
        onBeforeUnmount(() => {
            if (_headTags)
                fyhead.removeHeadElements(_headTags);
            fyhead.updateDOM();
        });
    }
    else {
        const _headTags = fyhead.headToElements(_headTagsPlain.value);
        if (_headTags)
            fyhead.addElements(_headTags);
    }
    return fyhead;
};
const createFyHead = () => FyHead.createHead();

export { createFyHead, useFyHead };
