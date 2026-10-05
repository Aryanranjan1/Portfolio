import { classifyEmbedSource, classifyVideoSource } from "./video-source";



export const BLOG_BLOCK_TYPES = [
  "heading",
  "paragraph",
  "image",
  "gallery",
  "video",
  "quote",
  "list",
  "code",
  "table",
  "comparison",
  "callout",
  "tool",
  "embed",
] as const;

export type BlogBlockType = (typeof BLOG_BLOCK_TYPES)[number];

export type BlogBlock = {
  id: string;
  articleId: string;
  type: BlogBlockType | string;
  position: number;
  data: Record<string, unknown>;
};

const MAX = {
  heading: 500,
  paragraph: 20_000,
  quote: 20_000,
  listItems: 100,
  listItem: 5_000,
  code: 50_000,
  tableRows: 100,
  tableColumns: 20,
  tableCell: 5_000,
  comparisonRows: 100,
  comparisonColumns: 20,
  galleryImages: 50,
  imageAlt: 500,
  imageCaption: 2_000,
  videoUrl: 2_000,
  videoTitle: 500,
  embedUrl: 2_000,
  embedTitle: 500,
  embedCaption: 2_000,
  calloutTitle: 500,
  calloutBody: 20_000,
  toolName: 500,
  toolDescription: 5_000,
} as const;

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]) {
  return Object.keys(value).every((key) => keys.includes(key));
}

function isStringArray(
  value: unknown,
  maxItems: number,
  maxLength: number,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= maxItems &&
    value.every(
      (item) =>
        isString(item) &&
        item.length <= maxLength,
    )
  );
}

function isStringMatrix(
  value: unknown,
  maxRows: number,
  maxColumns: number,
  maxCellLength: number,
): value is string[][] {
  return (
    Array.isArray(value) &&
    value.length <= maxRows &&
    value.every(
      (row) =>
        Array.isArray(row) &&
        row.length <= maxColumns &&
        row.every(
          (cell) =>
            isString(cell) &&
            cell.length <= maxCellLength,
        ),
    )
  );
}

function isValidUrl(value: unknown): value is string {
  if (!isString(value) || value.length === 0) {
    return false;
  }

  try {
    const url = new URL(value);
    const placeholder = ["example.com", "example.org", "example.net"].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
    return !placeholder && (url.protocol === "http:" || url.protocol === "https:");
  } catch {
    return false;
  }
}

function isValidPosition(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0
  );
}

export type BlogBlockFieldErrors = Record<string, string>;

export function getBlockDataErrors(type: BlogBlockType | string, data: unknown): BlogBlockFieldErrors {
  if (!isObject(data)) return { data: "Block data must be an object." };
  const errors: BlogBlockFieldErrors = {};
  const keys = (allowed: string[]) => { if (!hasOnlyKeys(data, allowed)) errors.data = "This block contains unsupported fields."; };
  const required = (key: string, label: string, max: number) => {
    const value = data[key];
    if (!isString(value) || !value.trim()) errors[key] = `${label} is required.`;
    else if (value.length > max) errors[key] = `${label} must be ${max} characters or fewer.`;
  };
  const url = (key: string, label: string, max: number) => {
    const value = data[key];
    if (!isString(value) || !value.trim()) errors[key] = `${label} is required.`;
    else if (value.length > max || !isValidUrl(value)) errors[key] = `Enter a valid ${label.toLowerCase()}.`;
  };
  switch (type) {
    case "heading":
      keys(["text", "level"]); required("text", "Heading", MAX.heading);
      if (data.level !== undefined && data.level !== 2 && data.level !== 3 && data.level !== 4) errors.level = "Choose heading level 2, 3, or 4.";
      break;
    case "paragraph": keys(["text"]); required("text", "Paragraph", MAX.paragraph); break;
    case "image":
      keys(["url", "alt", "caption"]); url("url", "Image URL", 2048); required("alt", "Alt text", MAX.imageAlt);
      if (data.caption !== undefined && (!isString(data.caption) || data.caption.length > MAX.imageCaption)) errors.caption = "Caption is too long.";
      break;
    case "gallery": {
      keys(["images"]); const images = data.images;
      if (!Array.isArray(images) || images.length === 0) { errors.images = "Add at least one image to the gallery."; break; }
      if (images.length > MAX.galleryImages) errors.images = `Gallery supports up to ${MAX.galleryImages} images.`;
      images.forEach((image, index) => {
        if (!isObject(image)) { errors[`image-${index}`] = `Gallery image ${index + 1} is invalid.`; return; }
        if (!hasOnlyKeys(image, ["url", "alt", "caption"])) errors[`image-${index}`] = `Gallery image ${index + 1} contains unsupported fields.`;
        if (!isString(image.url) || !image.url.trim()) errors[`image-${index}.url`] = `Image ${index + 1}: URL is required.`;
        else if (!isValidUrl(image.url)) errors[`image-${index}.url`] = `Image ${index + 1}: enter a valid URL.`;
        if (!isString(image.alt) || !image.alt.trim()) errors[`image-${index}.alt`] = `Image ${index + 1}: alt text is required.`;
        else if (image.alt.length > MAX.imageAlt) errors[`image-${index}.alt`] = `Image ${index + 1}: alt text is too long.`;
        if (image.caption !== undefined && (!isString(image.caption) || image.caption.length > MAX.imageCaption)) errors[`image-${index}.caption`] = `Image ${index + 1}: caption is too long.`;
      }); break;
    }
    case "video": {
      keys(["url", "title"]); url("url", "Video URL", MAX.videoUrl);
      if (isString(data.url) && isValidUrl(data.url) && classifyVideoSource(data.url).type === "unsupported") errors.url = "This video source is not supported. Use YouTube, Vimeo, or a direct MP4, WebM, or MOV file URL.";
      if (data.title !== undefined && (!isString(data.title) || data.title.length > MAX.videoTitle)) errors.title = "Video title is too long.";
      break;
    }
    case "quote":
      keys(["text", "author"]); required("text", "Quote", MAX.quote);
      if (data.author !== undefined && (!isString(data.author) || data.author.length > MAX.quote)) errors.author = "Attribution is too long.";
      break;
    case "list": {
      keys(["items", "ordered"]); const items = data.items;
      if (!Array.isArray(items) || items.length === 0) errors.items = "Add at least one list item.";
      else items.forEach((item, index) => { if (!isString(item) || !item.trim()) errors[`item-${index}`] = `List item ${index + 1} is required.`; else if (item.length > MAX.listItem) errors[`item-${index}`] = `List item ${index + 1} is too long.`; });
      if (Array.isArray(items) && items.length > MAX.listItems) errors.items = `A list supports up to ${MAX.listItems} items.`;
      if (data.ordered !== undefined && typeof data.ordered !== "boolean") errors.ordered = "Choose an ordered or unordered list.";
      break;
    }
    case "code":
      keys(["code", "language", "filename"]); required("code", "Code", MAX.code);
      if (data.language !== undefined && (!isString(data.language) || data.language.length > 100)) errors.language = "Language must be 100 characters or fewer.";
      if (data.filename !== undefined && (!isString(data.filename) || data.filename.length > 500)) errors.filename = "Title must be 500 characters or fewer.";
      break;
    case "table":
    case "comparison": {
      keys(["columns", "rows"]); const columns = data.columns; const rows = data.rows; const comparison = type === "comparison";
      if (!isStringArray(columns, comparison ? MAX.comparisonColumns : MAX.tableColumns, MAX.tableCell)) errors.columns = "Enter valid column headings.";
      else {
        if (columns.length < (comparison ? 2 : 1)) errors.columns = comparison ? "Add at least two comparison sides." : "Add at least one table column.";
        columns.forEach((column, index) => { if (!column.trim()) errors[`column-${index}`] = `Column ${index + 1} needs a heading.`; });
      }
      if (!isStringMatrix(rows, comparison ? MAX.comparisonRows : MAX.tableRows, comparison ? MAX.comparisonColumns : MAX.tableColumns, MAX.tableCell)) errors.rows = "Enter valid table rows and cells.";
      else {
        if (!rows.length) errors.rows = comparison ? "Add at least one comparison point." : "Add at least one table row.";
        rows.forEach((row, ri) => {
          if (Array.isArray(columns) && row.length !== columns.length) errors[`row-${ri}`] = `Row ${ri + 1} must have ${columns.length} cells.`;
          row.forEach((cell, ci) => { if (!cell.trim()) errors[`cell-${ri}-${ci}`] = `Row ${ri + 1}, column ${ci + 1} is required.`; });
        });
      }
      break;
    }
    case "callout":
      keys(["text", "title", "variant"]); required("text", "Callout content", MAX.calloutBody);
      if (data.title !== undefined && (!isString(data.title) || data.title.length > MAX.calloutTitle)) errors.title = "Callout title is too long.";
      if (data.variant !== undefined && !["info", "success", "warning", "note"].includes(String(data.variant))) errors.variant = "Choose a supported callout style.";
      break;
    case "tool":
      keys(["name", "description", "url"]); required("name", "Tool name", MAX.toolName);
      if (data.description !== undefined && (!isString(data.description) || data.description.length > MAX.toolDescription)) errors.description = "Tool description is too long.";
      if (data.url !== undefined && data.url !== "" && (!isString(data.url) || !isValidUrl(data.url))) errors.url = "Enter a valid tool URL.";
      break;
    case "embed":
      keys(["url", "title", "caption"]); url("url", "Embed URL", MAX.embedUrl);
      if (isString(data.url) && isValidUrl(data.url) && !classifyEmbedSource(data.url)) errors.url = "This provider is not supported for embeds. Use a YouTube or Vimeo video URL that permits iframe embedding.";
      if (data.title !== undefined && (!isString(data.title) || data.title.length > MAX.embedTitle)) errors.title = "Embed title is too long.";
      if (data.caption !== undefined && (!isString(data.caption) || data.caption.length > MAX.embedCaption)) errors.caption = "Embed caption is too long.";
      break;
    default: errors.type = "Choose a supported article block type.";
  }
  return errors;
}

export function validateBlockData(type: BlogBlockType | string, data: unknown): boolean {
  return Object.keys(getBlockDataErrors(type, data)).length === 0;
}

export function isValidBlogBlock(
  block: unknown,
): block is BlogBlock {
  if (!isObject(block)) {
    return false;
  }

  if (!isNonEmptyString(block.id)) {
    return false;
  }

  if (!isNonEmptyString(block.articleId)) {
    return false;
  }

  if (!isNonEmptyString(block.type)) {
    return false;
  }

  if (!isValidPosition(block.position)) {
    return false;
  }

  if (!isObject(block.data)) {
    return false;
  }

  if (validateBlockData(block.type, block.data)) return true;
  // Keep legacy, otherwise-safe URLs renderable so the public page can show
  // an explicit external fallback. Saves still reject unsupported sources.
  if ((block.type === "video" || block.type === "embed") && isValidUrl(block.data.url)) {
    const errors = getBlockDataErrors(block.type, block.data);
    return Object.keys(errors).length === 1 && Boolean(errors.url);
  }
  return false;
}

export function getYoutubeEmbedUrl(
  url: string,
): string | null {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname === "youtube.com" ||
      parsed.hostname === "www.youtube.com"
    ) {
      const videoId =
        parsed.searchParams.get("v");

      if (!videoId) {
        return null;
      }

      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (
      parsed.hostname === "youtu.be" ||
      parsed.hostname === "www.youtu.be"
    ) {
      const videoId =
        parsed.pathname.replace(/^\/+/, "");

      if (!videoId) {
        return null;
      }

      return `https://www.youtube.com/embed/${videoId}`;
    }

    return null;
  } catch {
    return null;
  }
}

export function getVimeoEmbedUrl(
  url: string,
): string | null {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname !== "vimeo.com" &&
      parsed.hostname !== "www.vimeo.com"
    ) {
      return null;
    }

    const videoId =
      parsed.pathname
        .split("/")
        .filter(Boolean)
        .at(-1);

    if (!videoId || !/^\d+$/.test(videoId)) {
      return null;
    }

    return `https://player.vimeo.com/video/${videoId}`;
  } catch {
    return null;
  }
}
