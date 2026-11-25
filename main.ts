// main.ts — entry for make.fun bounty makefun-x-reposts-02.
// Reads POSTS.json (our 7 verified quote posts on X) and copies it to
// the output directory, as the harness requires. Standard library only,
// no network access.
//
// Validation (added after the first run): every entry must be an X post
// URL of the form https://x.com/<handle>/status/<digits>, there must be
// 1-15 of them, and no post may be listed twice. Anything else fails
// loudly instead of shipping a bad POSTS.json.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? ".";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";

const POST_URL = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/;

const postsPath = join(botDir, "POSTS.json");
const raw = readFileSync(postsPath, "utf8");
const data = JSON.parse(raw) as { posts: string[] };

if (!Array.isArray(data.posts) || data.posts.length === 0) {
  throw new Error("POSTS.json must hold a non-empty posts list");
}
if (data.posts.length > 15) {
  throw new Error(`POSTS.json holds ${data.posts.length} posts, at most 15 allowed`);
}

const seen = new Set<string>();
for (const url of data.posts) {
  if (typeof url !== "string" || !POST_URL.test(url)) {
    throw new Error(`Not an X post URL: ${url}`);
  }
  const id = url.split("/status/")[1];
  if (seen.has(id)) {
    throw new Error(`Post listed twice: ${url}`);
  }
  seen.add(id);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "POSTS.json"), JSON.stringify(data, null, 2) + "\n");

for (const url of data.posts) {
  console.log(url);
}
console.log(`Wrote ${data.posts.length} post(s) to ${join(outDir, "POSTS.json")}`);
