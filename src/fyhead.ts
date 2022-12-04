import type { App, Ref, ShallowReactive, UnwrapRef } from "vue";
import { reactive, shallowRef } from "vue";
import { generateUUID } from "./helpers";
import { El, ElProperty } from "./element";

const __fyHeadCount__ = "fyhead:count";

// Inspired by @vueuse/head
export type MaybeRef<T> = T | Ref<T>;

export interface FyHeadObject {
  title: MaybeRef<string>;
  metas: MaybeRef<
    {
      name?: string;
      property?: string;
      content: string;
    }[]
  >;
  links: MaybeRef<
    {
      rel: string;
      href: string;
      key?: string;
    }[]
  >;
  scripts: MaybeRef<
    {
      src: string;
      id: string;
      nonce?: string;
      async?: boolean;
    }[]
  >;
}
export type FyHeadObjectPlain = UnwrapRef<FyHeadObject>;

export class FyHead {
  elements: Map<string, El>;

  constructor() {
    this.elements = new Map<string, El>();
  }
  static createHead() {
    const head = new FyHead();
    return head;
  }
  install(app: App) {
    if (app.config.globalProperties) {
      app.config.globalProperties.$fyhead = this;
      app.provide("fyhead", this);
    }
  }
  headToElements(_headTags: FyHeadObjectPlain) {
    if (!_headTags) return;
    const els: El[] = [];
    for (const key of Object.keys(_headTags) as Array<
      keyof FyHeadObjectPlain
    >) {
      if (key == "title") {
        els.push(FyHead.createTitle(_headTags[key]));
      } else if (key == "links") {
        const links = _headTags[key];
        links.forEach((link) => {
          els.push(FyHead.createLink(link.rel, link.href, link.key));
        });
      } else if (key == "metas") {
        const metas = _headTags[key];
        metas.forEach((meta) => {
          if (meta.property)
            els.push(
              FyHead.createMeta(meta.property, meta.content, "property")
            );
          else if (meta.name)
            els.push(FyHead.createMeta(meta.name, meta.content, "name"));
        });
      } else if (key == "scripts") {
        const scripts = _headTags[key];
        scripts.forEach((script) => {
          els.push(
            FyHead.createScript(
              script.src,
              script.id,
              script.nonce,
              script.async
            )
          );
        });
      }
    }
    this.addElements(els);
    return els;
  }
  removeHeadElements(els: El[]) {
    for (const el of this.elements.values()) {
      if (els.find((item) => item.uuid === el.uuid))
        this.elements.delete(el.key);
    }
  }
  addElements(els: El[]) {
    els.forEach((el) => {
      this.elements.set(el.key, el);
    });
  }
  static createTitle(title: string) {
    return new El("title", [], "title", title);
  }
  static createScript(
    src: string,
    key?: string,
    nonce?: string,
    async: boolean = false
  ) {
    if (!key) key = generateUUID();
    const properties = [new ElProperty("id", key), new ElProperty("src", src)];
    if (async) properties.push(new ElProperty("async"));
    if (nonce) properties.push(new ElProperty("nonce", nonce));
    return new El("script", properties, key);
  }
  static createLink(
    rel: string,
    href: string,
    key: string | undefined = undefined
  ) {
    if (!key) key = generateUUID();
    return new El(
      "link",
      [new ElProperty("rel", rel), new ElProperty("href", href)],
      key
    );
  }
  static createMeta(
    value: string,
    content: string,
    type: "name" | "property" = "property"
  ) {
    const key = value + "-" + type;
    return new El(
      "meta",
      [new ElProperty(type, value), new ElProperty("content", content)],
      key
    );
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
    const newElements: Element[] = [];
    const oldElements: Element[] = [];
    if (document && document.head) {
      let headCountEl = document.querySelector(
        `meta[name="${__fyHeadCount__}"]`
      );
      const headCount = headCountEl
        ? Number(headCountEl.getAttribute("content"))
        : 0;

      if (headCountEl) {
        for (
          let i = 0, j = headCountEl.previousElementSibling;
          i < headCount;
          i++
        ) {
          if (j) {
            oldElements.push(j);
          }
          j = j ? j.previousElementSibling : null;
        }
      }
      if (!headCountEl) headCountEl = document.createElement("meta");
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
