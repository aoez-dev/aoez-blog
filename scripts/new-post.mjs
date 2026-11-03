// Usage: npm run new -- "My post title"   (or just `npm run new` to be asked)
import { createInterface } from "node:readline/promises";
import { existsSync, writeFileSync } from "node:fs";
import { stdin as input, stdout as output } from "node:process";

const BLOG_DIR = "src/data/blog";

const slugify = text =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const rl = createInterface({ input, output });
const ask = async (question, fallback = "") =>
  (await rl.question(question)).trim() || fallback;

const title = process.argv.slice(2).join(" ") || (await ask("Title: "));
if (!title) {
  rl.close();
  process.stderr.write("A title is required.\n");
  process.exit(1);
}

const description = await ask("One-line description (shown on cards): ");
const tags = (await ask("Tags, comma separated [others]: ", "others"))
  .split(",")
  .map(tag => tag.trim())
  .filter(Boolean);
rl.close();

const file = `${BLOG_DIR}/${slugify(title)}.md`;
if (existsSync(file)) {
  process.stderr.write(`${file} already exists.\n`);
  process.exit(1);
}

const frontmatter = [
  "---",
  `title: "${title.replace(/"/g, '\\"')}"`,
  `description: "${description.replace(/"/g, '\\"')}"`,
  `pubDatetime: ${new Date().toISOString()}`,
  "tags:",
  ...tags.map(tag => `  - ${tag}`),
  "# cover: ../../assets/images/my-cover.png  # optional, shown in the post header",
  "draft: true # set to false (or remove) to publish",
  "---",
  "",
  "Write your intro here.",
  "",
  "## First section",
  "",
];

writeFileSync(file, frontmatter.join("\n"));
process.stdout.write(`Created ${file}\n`);
