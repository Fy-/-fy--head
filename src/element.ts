import { generateUUID } from "./helpers";

export class ElProperty {
  key: string;
  value?: string;
  constructor(key: string, value?: string) {
    this.key = key;
    this.value = value;
  }
  toString() {
    return this.value ? `${this.key}="${this.value}"` : this.key;
  }
}
type ElTag = "meta" | "link" | "script" | "title";

export class El {
  tag: ElTag;
  properties: ElProperty[];
  content?: string;
  key: string;
  uuid: string;
  constructor(
    tag: ElTag,
    properties: ElProperty[] = [],
    key?: string,
    content?: string
  ) {
    this.tag = tag;
    this.properties = properties;
    this.content = content;
    if (key) this.key = key;
    else this.key = this.getKey();
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
    return `<${this.tag} ${this.toStringProperties()}>${
      this.content ? this.content : ""
    }</${this.tag}>`;
  }
  toDom(doc: Document) {
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
