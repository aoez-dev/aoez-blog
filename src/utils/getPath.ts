import { BLOG_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";

/** Directory segments of the file, without empty/underscore dirs and file name. */
const getSegments = (filePath: string | undefined): string[] =>
  (filePath ?? "")
    .replace(BLOG_PATH, "")
    .split("/")
    .filter((path) => path !== "" && !path.startsWith("_"))
    .slice(0, -1)
    .map((segment) => slugifyStr(segment));

/**
 * Get full path of a blog post
 * @param id - id of the blog post (aka slug)
 * @param filePath - the blog post full file location
 * @param includeBase - whether to include `/posts` in return value
 * @returns blog post path
 */
export function getPath(
  id: string,
  filePath: string | undefined,
  includeBase = true,
) {
  const basePath = includeBase ? "/posts" : "";
  // Making sure `id` does not contain the directory
  const slug = id.split("/").slice(-1);
  return [basePath, ...getSegments(filePath), slug].join("/");
}
