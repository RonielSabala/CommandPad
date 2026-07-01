import { Anchor } from '@/common/constants/dom';
import { MarkdownToken } from '@/common/config';

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Render inline note markdown (code, bold, italic, links) to an HTML string.
 * Code spans are extracted to placeholders first so their content is protected
 * from the later bold/italic/link passes. The output is injected via
 * `dangerouslySetInnerHTML`; all user text is escaped up front.
 */
export function formatNoteText(text: string): string {
  const placeholders: string[] = [];

  let escaped = escapeHtml(text).replace(MarkdownToken.CODE_REGEX, (_, inner: string) => {
    const index = placeholders.length;
    placeholders.push(`<span class="note-code">${inner}</span>`);
    return `\x00CODE${index}\x00`;
  });

  escaped = escaped.replace(
    MarkdownToken.BOLD_REGEX,
    (_, inner: string) => `<span class="note-bold">${inner}</span>`,
  );

  escaped = escaped.replace(
    MarkdownToken.ITALIC_REGEX,
    (_, g1: string, g2: string) => `<span class="note-italic">${g1 ?? g2}</span>`,
  );

  escaped = escaped.replace(
    MarkdownToken.URL_REGEX,
    (url: string) =>
      `<a href="${url}" class="note-link" target="${Anchor.TARGET_BLANK}" rel="${Anchor.REL}">${url}</a>`,
  );

  // eslint-disable-next-line no-control-regex
  escaped = escaped.replace(/\x00CODE(\d+)\x00/g, (_, i: string) => placeholders[Number(i)]);

  return escaped;
}
