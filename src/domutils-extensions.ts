import { hasChildren, isCDATA, isTag, isText } from 'domutils';
import type { AnyNode } from 'domhandler';
import { ElementType } from 'htmlparser2';

export function innerTextEx(node: AnyNode | AnyNode[], separator: string): string {
  if (!node) return '';
  if (Array.isArray(node))
    return node
      .map(n => innerTextEx(n, separator))
      .filter(t => !!t)
      .join(separator);
  if (hasChildren(node) && (node.type === ElementType.Tag || isCDATA(node))) {
    return innerTextEx(node.children, separator);
  }
  if (isText(node)) return node.data.trim();
  return '';
}

export function innerTextUntil(node: AnyNode | AnyNode[], stopTagName: string): string {
  if (!node) return '';
  if (Array.isArray(node)) {
    const parts = [];
    for (const n of node) {
      if (isTag(n) && n.tagName === stopTagName) break;
      const text = innerTextUntil(n, stopTagName);
      if (text) parts.push(text);
    }

    return parts.join('');
  }
  if (isTag(node) && node.tagName === stopTagName) return '';
  if (hasChildren(node) && (isTag(node) || isCDATA(node))) {
    return innerTextUntil(node.children, stopTagName);
  }
  if (isText(node)) {
    return node.data;
  }
  return '';
}
