import type { App, Ref, ShallowReactive } from 'vue';
import { reactive, shallowRef } from 'vue';
import { generateUUID } from './helpers';
import { El, ElProperty } from './element';

const __fyHeadCount__ = 'fyhead:count';

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
  type?: 'blog' | 'search' | 'article' | 'website';
  searchAction?: string;
  next?: string;
  prev?: string;
  canonical?: string;
  locale?: string;
  robots?: string;
  url?: string;
}

export class FyHead {
  elements: ShallowReactive<Map<string, El>>;
  context: Map<string, string[]>;
  currentContext?: string;
  constructor() {
    this.elements = reactive<Map<string, El>>(new Map<string, El>());
    this.context = new Map<string, string[]>();
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
  clearContext(ctx: string) {
    this.currentContext = undefined;
    this.context.delete(ctx);
  }
  addToContext(key: string) {
    if (this.currentContext) {
      if (!this.context.has(this.currentContext))
        this.context.set(this.currentContext, []);
      this.context.get(this.currentContext)?.push(key);
    }
  }
  install(app: App) {
    if (app.config.globalProperties) {
      app.config.globalProperties.$fyhead = this;
      app.provide('fyhead', this);
    }
  }
  reset(ctx: string) {
    for (const el of this.elements.values()) {
      if (this.context.get(ctx)?.includes(el.uuid))
        this.elements.delete(el.key);
    }
    this.clearContext(ctx);
  }
  addElement(el: El) {
    if (!this.currentContext) {
      console.log('Warning: Trying to add element without context: ', el);
      return;
    }
    this.addToContext(el.uuid);
    this.elements.set(el.key, el);
  }
  addTitle(title: string) {
    this.addElement(new El('title', [], 'title', title));
  }
  addScript(src: string, key?: string, nonce?: string, async: boolean = false) {
    if (!key) key = generateUUID();
    const properties = [new ElProperty('id', key), new ElProperty('src', src)];
    if (async) properties.push(new ElProperty('async'));
    if (nonce) properties.push(new ElProperty('nonce', nonce));
    this.addElement(new El('script', properties, key));
  }
  addLink(rel: string, href: string, key: string | undefined = undefined) {
    if (!key) key = generateUUID();
    this.addElement(
      new El(
        'link',
        [new ElProperty('rel', rel), new ElProperty('href', href)],
        key
      )
    );
  }
  addMeta(
    value: string,
    content: string,
    type: 'name' | 'property' = 'property'
  ) {
    const key = value + '-' + type;
    this.addElement(
      new El(
        'meta',
        [new ElProperty(type, value), new ElProperty('content', content)],
        key
      )
    );
  }
  renderHeadToString() {
    let headTags = '';
    Object.values(this.elements).forEach((el) => {
      headTags += `${el.toString()}\n`;
    });
    const htmlAttrs = '';
    const bodyAttrs = '';
    const bodyTags = '';
    return {
      headTags,
      htmlAttrs,
      bodyAttrs,
      bodyTags,
    };
  }
  lazySeo(data: MaybeRef<FyHeadLazy>, reset: boolean = false) {
    data = shallowRef(data);
    if (data.value.url) {
      this.addMeta('og:url', data.value.url);
    }
    if (data.value.canonical) {
      this.addLink('canonical', data.value.canonical);
    }
    if (data.value.robots) {
      this.addMeta('robots', data.value.robots, 'name');
    }
    if (data.value.type) {
      this.addMeta('og:type', data.value.type);
    }
    if (data.value.title) {
      this.addTitle(data.value.title);
    }
    if (data.value.description) {
      this.addMeta('og:description', data.value.description);
      this.addMeta('twitter:description', data.value.description, 'name');
      this.addMeta('description', data.value.description, 'name');
      this.addMeta('og:description', data.value.description);
    }
    if (data.value.modified) {
      this.addMeta('article:modified_time', data.value.modified);
    }
    if (data.value.published) {
      this.addMeta('article:published_time', data.value.published);
    }
    if (data.value.imageWidth && data.value.imageHeight) {
      this.addMeta('og:image:width', data.value.imageWidth);
      this.addMeta('og:image:height', data.value.imageHeight);
    }
    if (data.value.imageType) {
      this.addMeta('og:image:type', data.value.imageType);
    }
    if (data.value.image) {
      this.addMeta('og:image', data.value.image);
      this.addMeta('twitter:image', data.value.image, 'name');
    }
    if (data.value.next) {
      this.addLink('next', data.value.next);
    }
    if (data.value.prev) {
      this.addLink('prev', data.value.prev);
    }
  }
  injectFyHead() {
    const newElements: Element[] = [];
    const oldElements: Element[] = [];
    if (document && document.head) {
      let headCountEl = document.querySelector(
        `meta[name="${__fyHeadCount__}"]`
      );
      const headCount = headCountEl
        ? Number(headCountEl.getAttribute('content'))
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
      if (!headCountEl) headCountEl = document.createElement('meta');
      headCountEl.setAttribute('name', __fyHeadCount__);
      headCountEl.setAttribute('content', '0');
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

      headCountEl.setAttribute('content', newElements.length.toString());
    }

    return newElements;
  }
}
