import { getBlogContent } from "@/db/queries/blog";
import BlogSectionClient from "./BlogSectionClient";

export default async function BlogSection() {
  const content = await getBlogContent();

  return <BlogSectionClient content={content} />;
}
