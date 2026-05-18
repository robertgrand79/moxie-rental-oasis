// Minimal HTML → plain text converter for the multipart/alternative `text` body
// every transactional email should ship alongside its HTML. We don't pull in a
// library because (a) every Deno-compatible html-to-text package balloons the
// edge bundle by 200-400KB and (b) our newsletter HTML shape is fixed and
// predictable — TipTap output, our template wrapper, hosted images.
//
// What this preserves:
//   - paragraph breaks (p, br, div, h*, li, blockquote → newlines)
//   - link URLs (rendered inline as "text (url)")
//   - basic list structure
//   - decoded HTML entities (&amp; &nbsp; &#39; etc.)
//
// What it drops:
//   - all tags
//   - image alt text only if explicitly present (we render <img alt="..."> as [alt])
//   - styling, scripts, comments
//
// This is intentionally conservative. Email clients that fall back to text/plain
// (very few in 2026, but Gmail's "clipped" expander does it) need something
// readable, not a pixel-perfect markdown render.

const BLOCK_TAGS = ['p', 'div', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr', 'blockquote', 'pre'];

export function htmlToText(html: string): string {
  if (!html) return '';

  let text = html;

  // Strip script/style blocks entirely — content inside them is never user text.
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Render anchors as "label (url)". Skip tracking/unsubscribe URLs because
  // they're machine identifiers, not user-meaningful links.
  text = text.replace(
    /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_match, href, label) => {
      const cleanLabel = label.replace(/<[^>]+>/g, '').trim();
      if (!href || href.startsWith('#') || href.includes('unsubscribe-newsletter')) {
        return cleanLabel;
      }
      // If label IS the href (or close enough) don't double-print.
      if (cleanLabel === href || cleanLabel === '') return href;
      return `${cleanLabel} (${href})`;
    },
  );

  // Render <img alt="..."> as [alt] so visually-impaired recipients reading the
  // text/plain version know an image was there.
  text = text.replace(
    /<img\s+[^>]*alt=["']([^"']+)["'][^>]*>/gi,
    (_match, alt) => `[${alt}]`,
  );
  text = text.replace(/<img[^>]*>/gi, '[image]');

  // Convert block-level closers to single newlines, lists to bulleted lines.
  text = text.replace(/<li[^>]*>/gi, '\n  • ');
  for (const tag of BLOCK_TAGS) {
    text = text.replace(new RegExp(`</?${tag}[^>]*>`, 'gi'), '\n');
  }

  // Drop everything else.
  text = text.replace(/<[^>]+>/g, '');

  // Decode the entity classes we actually see in newsletter copy.
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, code) => String.fromCharCode(parseInt(code, 16)));

  // Collapse runs of whitespace; preserve at most two newlines for paragraph
  // separation. Trim each line so leading bullet-pad isn't doubled.
  text = text
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}
