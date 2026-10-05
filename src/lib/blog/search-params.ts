export function normalizeBlogSearchParams(params: {
  q?: string | string[];
  category?: string | string[];
  sort?: string | string[];
  page?: string | string[];
}) {
  const first = (value: unknown) => {
    const selected = Array.isArray(value) ? value[0] : value;
    return typeof selected === "string" ? selected.slice(0, 200) : undefined;
  };
  return { q: first(params.q), category: first(params.category), sort: first(params.sort), page: first(params.page) };
}
