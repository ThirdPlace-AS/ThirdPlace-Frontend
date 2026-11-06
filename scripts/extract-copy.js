#!/usr/bin/env node
// Extracts every user-facing string the app owns (JSX text, string props that
// people read or hear, showToast/DemoNote copy, src/copy/*) into one list, so
// the copy can be audited and the voice test (tests/copyVoice.test.ts) can
// check all of it. Fixture data (names, places, chat messages) is excluded:
// it is sample content, not product copy.
//
// usage: node scripts/extract-copy.js [--json]   (from the repo root)
const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const ROOT = path.resolve(__dirname, "..");
const DIRS = ["app", "src"];
const SKIP = [
  /^src[\\/]fixtures[\\/]/,
  /^app[\\/]_sandbox[\\/]/,
  /^src[\\/]theme[\\/]/,
];
const PROPS = new Set([
  "label",
  "title",
  "subtitle",
  "message",
  "hint",
  "placeholder",
  "actionLabel",
  "secondaryLabel",
  "accessibilityLabel",
  "accessibilityHint",
  "helper",
  "error",
  "body",
]);

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(path.join(ROOT, dir), {
    withFileTypes: true,
  })) {
    const rel = path.join(dir, e.name);
    if (SKIP.some((re) => re.test(rel))) continue;
    if (e.isDirectory()) out.push(...walk(rel));
    else if (/\.(tsx?|jsx?)$/.test(e.name)) out.push(rel);
  }
  return out;
}

const norm = (s) => s.replace(/\s+/g, " ").trim();
const human = (s) =>
  /[A-Za-zÆØÅæøå]{2}/.test(s) && !/^[a-z]+(-[a-z]+)+$/.test(s);

function templateText(node) {
  return node.quasis.map((q) => q.value.cooked).join("…");
}

function extract() {
  const items = [];
  for (const file of DIRS.flatMap(walk)) {
    const src = fs.readFileSync(path.join(ROOT, file), "utf8");
    let ast;
    try {
      ast = parser.parse(src, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
      });
    } catch {
      continue;
    }
    const add = (kind, text, node) => {
      const t = norm(text);
      if (!t || !human(t)) return;
      items.push({
        file: file.split(path.sep).join("/"),
        line: node.loc.start.line,
        kind,
        text: t,
      });
    };
    traverse(ast, {
      JSXText(p) {
        add("text", p.node.value, p.node);
      },
      JSXAttribute(p) {
        const name = p.node.name.name;
        if (!PROPS.has(name) || !p.node.value) return;
        const v = p.node.value;
        if (v.type === "StringLiteral") add(name, v.value, v);
        else if (v.type === "JSXExpressionContainer") {
          const e = v.expression;
          if (e.type === "StringLiteral") add(name, e.value, e);
          else if (e.type === "TemplateLiteral") add(name, templateText(e), e);
          else if (e.type === "ConditionalExpression") {
            for (const b of [e.consequent, e.alternate]) {
              if (b.type === "StringLiteral") add(name, b.value, b);
              else if (b.type === "TemplateLiteral")
                add(name, templateText(b), b);
            }
          }
        }
      },
      JSXExpressionContainer(p) {
        // {"literal"} / {`template`} children of an element
        if (p.parent.type !== "JSXElement") return;
        const e = p.node.expression;
        if (e.type === "StringLiteral") add("text", e.value, e);
        else if (e.type === "TemplateLiteral") add("text", templateText(e), e);
      },
      CallExpression(p) {
        const c = p.node.callee;
        if (c.type !== "Identifier" || c.name !== "showToast") return;
        const arg = p.node.arguments[0];
        if (!arg || arg.type !== "ObjectExpression") return;
        for (const prop of arg.properties) {
          if (
            prop.type !== "ObjectProperty" ||
            !["title", "body"].includes(prop.key.name)
          )
            continue;
          const v = prop.value;
          if (v.type === "StringLiteral")
            add(`toast.${prop.key.name}`, v.value, v);
          else if (v.type === "TemplateLiteral")
            add(`toast.${prop.key.name}`, templateText(v), v);
        }
      },
      ObjectProperty(p) {
        // shared copy modules: src/copy/*
        if (!/^src[\\/]copy[\\/]/.test(file)) return;
        const v = p.node.value;
        if (v.type === "StringLiteral") add("copy", v.value, v);
        else if (v.type === "TemplateLiteral") add("copy", templateText(v), v);
      },
    });
  }
  return items;
}

module.exports = { extract };

if (require.main === module) {
  const items = extract();
  if (process.argv.includes("--json"))
    process.stdout.write(JSON.stringify(items, null, 2));
  else
    for (const i of items)
      console.log(`${i.file}:${i.line}\t${i.kind}\t${i.text}`);
}
