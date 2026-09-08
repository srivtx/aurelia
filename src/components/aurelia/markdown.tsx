/* ============================================================
   AURELIA — Markdown-lite renderer (no dependencies)
   Renders the AI stylist's markdown replies as React elements.
   Pure function of the string → hydration-safe, XSS-safe
   (text nodes only, no dangerouslySetInnerHTML anywhere).

   Supports: ### headings, --- and *** rules, > quotes, bullet dashes,
   numbered lists, bold, italic, bold-italic, `code`, [links](url),
   bare URLs, | tables |, triple-backtick fences.
   ============================================================ */

import { Fragment, type ReactNode } from "react";

/* ---------- inline parsing ---------- */

const INLINE_CODE = /`([^`\n]+)`/g;
const LINK = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g;
const BARE_URL = /(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;:!?'"])/g;

/* first-match + index lookups (NOTE: .match() with a g flag drops .index —
   which silently killed inline styling; these stay non-global) */
const BOLD_ITALIC_M = /\*\*\*([^*\n]+)\*\*\*/;
const BOLD_M = /\*\*([^*\n]+)\*\*/;
const ITALIC_M = /(?<!\*)\*([^*\n]+)\*(?!\*)|(?<![\w_])_([^_\n]+)_(?![\w_])/;

type Seg = { t: "text" | "code" | "link" | "bold" | "italic" | "bolditalic"; s: string; href?: string };

/* tokenize one line into styled segments (deterministic order) */
function inlineSegments(line: string): Seg[] {
  /* pass 1: extract code spans & links first so their content is protected */
  const protectedRanges: { start: number; end: number; seg: Seg }[] = [];
  let m: RegExpExecArray | null;

  INLINE_CODE.lastIndex = 0;
  while ((m = INLINE_CODE.exec(line))) {
    protectedRanges.push({ start: m.index, end: m.index + m[0].length, seg: { t: "code", s: m[1] } });
  }
  LINK.lastIndex = 0;
  while ((m = LINK.exec(line))) {
    protectedRanges.push({ start: m.index, end: m.index + m[0].length, seg: { t: "link", s: m[1], href: m[2] } });
  }
  BARE_URL.lastIndex = 0;
  while ((m = BARE_URL.exec(line))) {
    const url = m[2];
    if (protectedRanges.some((r) => m!.index >= r.start && m!.index < r.end)) continue;
    protectedRanges.push({ start: m.index + m[1].length, end: m.index + m[1].length + url.length, seg: { t: "link", s: url, href: url } });
  }

  protectedRanges.sort((a, b) => a.start - b.start);
  const out: Seg[] = [];
  let cursor = 0;

  const pushText = (text: string) => {
    if (!text) return;
    /* pass 2: bold-italic → bold → italic inside plain text */
    const parts: Seg[] = [];
    let rest = text;
    let guard = 0;
    while (rest && guard++ < 400) {
      const bi = rest.match(BOLD_ITALIC_M);
      const b = rest.match(BOLD_M);
      const i = rest.match(ITALIC_M);
      if (bi && bi.index !== undefined) {
        parts.push({ t: "text", s: rest.slice(0, bi.index) }, { t: "bolditalic", s: bi[1] });
        rest = rest.slice(bi.index + bi[0].length);
      } else if (b && b.index !== undefined) {
        parts.push({ t: "text", s: rest.slice(0, b.index) }, { t: "bold", s: b[1] });
        rest = rest.slice(b.index + b[0].length);
      } else if (i && i.index !== undefined) {
        const content = i[1] ?? i[2];
        parts.push({ t: "text", s: rest.slice(0, i.index) }, { t: "italic", s: content });
        rest = rest.slice(i.index + i[0].length);
      } else {
        parts.push({ t: "text", s: rest });
        rest = "";
      }
    }
    out.push(...parts);
  };

  for (const r of protectedRanges) {
    if (r.start < cursor) continue; /* overlap — keep first */
    pushText(line.slice(cursor, r.start));
    out.push(r.seg);
    cursor = r.end;
  }
  pushText(line.slice(cursor));
  return out;
}

function renderInline(line: string, keyPrefix: string): ReactNode[] {
  return inlineSegments(line).map((seg, i) => {
    const key = `${keyPrefix}-${i}`;
    switch (seg.t) {
      case "code":
        return (
          <code key={key} className="px-1.5 py-0.5 rounded-[6px] bg-surface-deep text-[12.5px] font-mono" style={{ background: "var(--surface-deep)" }}>
            {seg.s}
          </code>
        );
      case "link":
        return (
          <a key={key} href={seg.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 font-semibold" style={{ color: "var(--rose)" }}>
            {seg.s}
          </a>
        );
      case "bold":
        return (
          <strong key={key} className="font-bold" style={{ color: "var(--ink)" }}>
            {seg.s}
          </strong>
        );
      case "italic":
        return <em key={key}>{seg.s}</em>;
      case "bolditalic":
        return (
          <strong key={key} className="font-bold italic">
            {seg.s}
          </strong>
        );
      default:
        return <Fragment key={key}>{seg.s}</Fragment>;
    }
  });
}

/* ---------- block parsing ---------- */

type Block =
  | { t: "p"; lines: string[] }
  | { t: "h"; level: number; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "quote"; lines: string[] }
  | { t: "hr" }
  | { t: "code"; text: string }
  | { t: "table"; header: string[]; rows: string[][] };

const HR_RE = /^ {0,3}((?:-{2,}\s*)*(?:-{3,})|(?:\*\s*){3,}|(?:_\s*){3,})$/;
const UL_RE = /^(\s*)[-*+]\s+(.+)$/;
const OL_RE = /^(\s*)\d+[.)]\s+(.+)$/;
const H_RE = /^(#{1,4})\s+(.+)$/;
const QUOTE_RE = /^ {0,3}>\s?(.*)$/;

function splitRow(line: string): string[] {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((c) => c.trim());
}

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    /* fenced code */
    if (/^ {0,3}```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^ {0,3}```/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++; /* closing fence */
      blocks.push({ t: "code", text: buf.join("\n") });
      continue;
    }

    /* horizontal rule --- *** ___ (also swallows the raw *** the model emits) */
    if (HR_RE.test(line.trim())) {
      blocks.push({ t: "hr" });
      i++;
      continue;
    }

    /* heading */
    const h = line.match(H_RE);
    if (h) {
      blocks.push({ t: "h", level: h[1].length, text: h[2].replace(/#+\s*$/, "").trim() });
      i++;
      continue;
    }

    /* table: | a | b | header, then |---|---| */
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? "")) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push({ t: "table", header, rows });
      continue;
    }

    /* blockquote */
    if (QUOTE_RE.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && QUOTE_RE.test(lines[i])) {
        buf.push(lines[i].replace(QUOTE_RE, "$1"));
        i++;
      }
      blocks.push({ t: "quote", lines: buf });
      continue;
    }

    /* bullet list */
    if (UL_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const um = lines[i].match(UL_RE);
        if (um) {
          items.push(um[2].trim());
          i++;
        } else if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length) {
          /* continuation line for the previous item */
          items[items.length - 1] += ` ${lines[i].trim()}`;
          i++;
        } else break;
      }
      blocks.push({ t: "ul", items });
      continue;
    }

    /* numbered list */
    if (OL_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const om = lines[i].match(OL_RE);
        if (om) {
          items.push(om[2].trim());
          i++;
        } else if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length) {
          items[items.length - 1] += ` ${lines[i].trim()}`;
          i++;
        } else break;
      }
      blocks.push({ t: "ol", items });
      continue;
    }

    /* paragraph (gather until blank / list / heading / hr) */
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !H_RE.test(lines[i]) &&
      !HR_RE.test(lines[i].trim()) &&
      !UL_RE.test(lines[i]) &&
      !OL_RE.test(lines[i]) &&
      !QUOTE_RE.test(lines[i]) &&
      !/^ {0,3}```/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ t: "p", lines: para });
  }

  return blocks;
}

/* ---------- component ---------- */

export function Markdown({ text, size = "chat" }: { text: string; size?: "chat" | "sheet" }) {
  const blocks = parseBlocks(text);
  const paraCls = size === "chat" ? "text-[14px] leading-[21px]" : "text-[14.5px] leading-[22px]";

  return (
    <div className="markdown-body space-y-2">
      {blocks.map((b, bi) => {
        const key = `b${bi}`;
        switch (b.t) {
          case "h": {
            const sz = b.level <= 2 ? "text-[15.5px]" : "text-[14.5px]";
            return (
              <p key={key} className={`font-display font-bold ${sz} leading-[20px] pt-1`} style={{ color: "var(--ink)" }}>
                {renderInline(b.text, key)}
              </p>
            );
          }
          case "hr":
            return <div key={key} className="h-px my-1" style={{ background: "var(--line)" }} />;
          case "ul":
            return (
              <ul key={key} className="space-y-1.5">
                {b.items.map((it, ii) => (
                  <li key={ii} className="flex gap-2.5">
                    <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--rose)" }} />
                    <span className={`min-w-0 ${paraCls} leading-[20px]`}>{renderInline(it, `${key}-${ii}`)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key} className="space-y-1.5">
                {b.items.map((it, ii) => (
                  <li key={ii} className="flex gap-2.5">
                    <span
                      className="shrink-0 grid place-items-center w-[18px] h-[18px] rounded-full text-[10.5px] font-bold mt-[1px]"
                      style={{ background: "var(--rose-soft)", color: "var(--rose-deep, var(--rose))" }}
                    >
                      {ii + 1}
                    </span>
                    <span className={`min-w-0 ${paraCls} leading-[20px]`}>{renderInline(it, `${key}-${ii}`)}</span>
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={key} className="pl-3 border-l-2 py-0.5" style={{ borderColor: "var(--rose)" }}>
                {b.lines.map((l, li) => (
                  <p key={li} className={`italic ${paraCls}`}>
                    {renderInline(l, `${key}-${li}`)}
                  </p>
                ))}
              </blockquote>
            );
          case "code":
            return (
              <pre
                key={key}
                className="rounded-[10px] p-3 overflow-x-auto text-[12px] font-mono leading-[17px]"
                style={{ background: "var(--surface-deep)", color: "var(--ink-2)" }}
              >
                {b.text}
              </pre>
            );
          case "table":
            return (
              <div key={key} className="overflow-x-auto rounded-[10px] border" style={{ borderColor: "var(--line)" }}>
                <table className="w-full text-[12.5px]">
                  <thead style={{ background: "var(--surface-deep)" }}>
                    <tr>
                      {b.header.map((c, ci) => (
                        <th key={ci} className="text-left font-bold px-2.5 py-2" style={{ color: "var(--ink)" }}>
                          {renderInline(c, `${key}-h${ci}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, ri) => (
                      <tr key={ri} style={{ borderTopWidth: 1, borderTopColor: "var(--line)", borderTopStyle: "solid" }}>
                        {row.map((c, ci) => (
                          <td key={ci} className="px-2.5 py-2 align-top" style={{ color: "var(--ink-2)" }}>
                            {renderInline(c, `${key}-${ri}-${ci}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return (
              <p key={key} className={paraCls}>
                {b.lines.map((l, li) => (
                  <Fragment key={li}>
                    {li > 0 && <br />}
                    {renderInline(l, `${key}-${li}`)}
                  </Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}
