// 构建前自动生成「paicoding 已存在文章」清单，供 theme.ts 决定 canonical 归属。
//
// 背景：同一篇内容双发到 paicoding.com（每天首发）和 javabetter.cn（每 1~2 周 build）。
// canonical 统一让给首发的 paicoding。但要判断某篇是否真在 paicoding 上，不能看 HTTP 状态码
// ——paicoding 对不存在的 slug 会返回 200 + 首页，所以唯一可靠信号是 <title> 是否等于首页标题。
//
// 用法：build 前自动运行（见 package.json 的 docs:build）。也可单独 `node scripts/gen-paicoding-canonical.mjs` 刷新。
// 新发文章无需任何手动标记：只要 paicoding 上 slug = markdown 文件名，下次 build 就会自动让权。

import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(SCRIPT_DIR, "../src");
const OUT = resolve(SRC, ".vuepress/paicoding-canonical.json");

// 双发集中的目录（相对 docs/src）。以后若在别处双发，往这里加目录即可。
const CANDIDATE_DIRS = ["sidebar/itwanger", "ai/video", "zhishixingqiu"];
const HOST = "https://paicoding.com";
const HOME_TITLE = "技术派 - Java技术社区 | RAG+Agent实战项目教程+AI助手";
const CONCURRENCY = 8;
const TIMEOUT_MS = 15000;

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".md") && !/^(README|index)\.md$/i.test(name)) out.push(p);
  }
  return out;
}

async function probe(slug) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${HOST}/${slug}`, { signal: ctrl.signal, redirect: "follow" });
    if (!res.ok) return false;
    const html = await res.text();
    const m = html.match(/<title>([\s\S]*?)<\/title>/i);
    const title = m ? m[1].trim() : "";
    // 标题恰好等于首页标题（或为空）说明该 slug 不存在，paicoding 用首页兜底
    return title !== "" && title !== HOME_TITLE;
  } catch {
    return null; // 网络异常：返回 null，调用方据此保留旧清单中的该项
  } finally {
    clearTimeout(t);
  }
}

async function pool(items, worker, size) {
  const results = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        results[idx] = await worker(items[idx]);
      }
    })
  );
  return results;
}

const slugs = [
  ...new Set(
    CANDIDATE_DIRS.flatMap((d) => walk(resolve(SRC, d))).map((p) =>
      p.slice(p.lastIndexOf("/") + 1, -3)
    )
  ),
].sort();

console.log(`[paicoding-canonical] 探测 ${slugs.length} 个候选 slug ...`);

const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf-8")) : {};
const states = await pool(slugs, probe, CONCURRENCY);

const manifest = {};
let ok = 0, kept = 0, errors = 0;
slugs.forEach((slug, idx) => {
  const state = states[idx];
  if (state === true) {
    manifest[slug] = `${HOST}/${slug}`;
    ok++;
  } else if (state === null) {
    // 网络异常：沿用上次清单结果，避免误判
    errors++;
    if (prev[slug]) {
      manifest[slug] = prev[slug];
      kept++;
    }
  }
  // state === false：paicoding 上不存在，保持自指（不写入清单）
});

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
console.log(
  `[paicoding-canonical] 命中 ${ok} 篇 → 让权 paicoding；网络异常 ${errors}（沿用旧值 ${kept}）；清单已写入 ${OUT}`
);
