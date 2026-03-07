import type { Tool } from "@/hooks/useTools";

interface CatalogPageParams {
  category?: string;
  pageParam?: number;
  offset?: number;
  pageSize?: number;
  searchQuery?: string;
  selectedPersona?: string;
  sortBy?: string;
}

interface FallbackToolStats {
  total_tools: number;
  total_categories: number;
  arabic_tools: number;
  free_tools: number;
}

interface FallbackTrendingTool {
  id: number;
  title: string;
  clicks_count: number;
}

let cachedCatalogTools: Tool[] | null = null;
let catalogInFlight: Promise<Tool[]> | null = null;

const buildDataUrl = (relativePath: string) => {
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${relativePath.replace(/^\//, "")}`;
};

const normalizeTools = (tools: Tool[]): Tool[] =>
  tools
    .filter(Boolean)
    .map((tool) => ({
      ...tool,
      id: String(tool.id),
      is_published: tool.is_published ?? true,
      features: tool.features ? [...tool.features] : null,
      screenshots: tool.screenshots ? [...tool.screenshots] : null,
    }));

const loadCatalogJson = async (relativePath: string) => {
  const response = await fetch(buildDataUrl(relativePath), { cache: "force-cache" });

  if (!response.ok) {
    throw new Error(`Failed to load catalog data: ${response.status}`);
  }

  return normalizeTools((await response.json()) as Tool[]);
};

const toNumber = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);

const toTimestamp = (value?: string | null) => {
  const timestamp = Date.parse(value ?? "");
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const normalizeText = (value?: string | null) => (value ?? "").trim().toLowerCase();

const includesAny = (source: string, tokens: string[]) => tokens.some((token) => source.includes(token));

const filterPublishedTools = (tools: Tool[]) => tools.filter((tool) => tool.is_published !== false);

const matchesPersona = (tool: Tool, selectedPersona: string) => {
  const category = normalizeText(tool.category);
  const personaId = normalizeText(selectedPersona);

  if (!personaId || personaId === "all") return true;

  if (personaId === "designer" || personaId === "design") {
    return includesAny(category, ["صور", "تصميم", "فيديو"]);
  }

  if (personaId === "developer" || personaId === "dev") {
    return includesAny(category, ["برمجة", "تطوير", "code"]);
  }

  if (personaId === "marketer" || personaId === "content") {
    return includesAny(category, ["تسويق", "نصوص", "محتوى"]);
  }

  if (personaId === "student") {
    return includesAny(category, ["دراسة", "تعليم", "بحث", "طلاب"]);
  }

  return true;
};

const matchesCategory = (tool: Tool, category: string) => {
  const normalizedCategory = normalizeText(category);
  const toolCategory = normalizeText(tool.category);

  if (!normalizedCategory || normalizedCategory === "الكل") return true;

  if (normalizedCategory === "توليد نصوص") return toolCategory.includes("نصوص");
  if (normalizedCategory === "توليد صور وفيديو") return includesAny(toolCategory, ["صور", "فيديو"]);
  if (normalizedCategory === "مساعدات إنتاجية") return toolCategory.includes("إنتاجية");
  if (normalizedCategory === "صناعة محتوى") return includesAny(toolCategory, ["محتوى", "تسويق"]);
  if (normalizedCategory === "تطوير وبرمجة") return includesAny(toolCategory, ["برمجة", "تطوير", "code"]);
  if (normalizedCategory === "تعليم وبحث") return includesAny(toolCategory, ["تعليم", "دراسة", "طلاب", "بحث"]);

  return toolCategory.includes(normalizedCategory);
};

const matchesSearch = (tool: Tool, searchQuery: string) => {
  const query = normalizeText(searchQuery);

  if (!query) return true;

  return [
    tool.title,
    tool.title_en,
    tool.description,
    tool.description_en,
    tool.category,
  ].some((value) => normalizeText(value).includes(query));
};

const sortTools = (tools: Tool[], sortBy = "trending") => {
  const items = [...tools];

  items.sort((left, right) => {
    switch (sortBy) {
      case "newest":
        return toTimestamp(right.created_at) - toTimestamp(left.created_at);
      case "top_rated": {
        const ratingDiff = toNumber(right.average_rating) - toNumber(left.average_rating);
        if (ratingDiff !== 0) return ratingDiff;
        return toNumber(right.reviews_count) - toNumber(left.reviews_count);
      }
      case "popular":
      case "fastest": {
        const viewsDiff = toNumber(right.views_count) - toNumber(left.views_count);
        if (viewsDiff !== 0) return viewsDiff;
        return toNumber(right.clicks_count) - toNumber(left.clicks_count);
      }
      case "alphabetical":
        return (left.title ?? "").localeCompare(right.title ?? "", "ar");
      case "trending":
      default: {
        const featuredDiff = Number(Boolean(right.is_featured)) - Number(Boolean(left.is_featured));
        if (featuredDiff !== 0) return featuredDiff;

        const clicksDiff = toNumber(right.clicks_count) - toNumber(left.clicks_count);
        if (clicksDiff !== 0) return clicksDiff;

        return toTimestamp(right.created_at) - toTimestamp(left.created_at);
      }
    }
  });

  return items;
};

const isArabicTool = (tool: Tool) =>
  Boolean(tool.supports_arabic) || toNumber(tool.arabic_score) > 0 || /[\u0600-\u06FF]/.test(tool.description ?? "");

const isFreeTool = (tool: Tool) => {
  const pricing = normalizeText(tool.pricing_type);
  return includesAny(pricing, ["مجاني", "freemium", "free"]);
};

export const loadToolsCatalogData = async (): Promise<Tool[]> => {
  if (cachedCatalogTools) return cachedCatalogTools;

  if (!catalogInFlight) {
    catalogInFlight = loadCatalogJson("/data/tools.cleaned.json")
      .then((tools) => {
        cachedCatalogTools = tools;
        return tools;
      })
      .finally(() => {
        catalogInFlight = null;
      });
  }

  return catalogInFlight;
};

export const getToolsPageFromCatalog = async ({
  category = "الكل",
  pageParam = 0,
  offset,
  pageSize = 8,
  searchQuery = "",
  selectedPersona = "all",
  sortBy = "trending",
}: CatalogPageParams) => {
  const from = typeof offset === "number" ? offset : pageParam * pageSize;
  const to = from + pageSize;

  const allTools = filterPublishedTools(await loadToolsCatalogData());
  const filteredTools = allTools.filter(
    (tool) =>
      matchesSearch(tool, searchQuery) &&
      matchesPersona(tool, selectedPersona) &&
      matchesCategory(tool, category),
  );

  const sortedTools = sortTools(filteredTools, sortBy);

  return {
    data: sortedTools.slice(from, to),
    count: sortedTools.length,
  };
};

export const getToolsStatsFromCatalog = async (): Promise<FallbackToolStats> => {
  const tools = filterPublishedTools(await loadToolsCatalogData());

  return {
    total_tools: tools.length,
    total_categories: new Set(tools.map((tool) => tool.category).filter(Boolean)).size,
    arabic_tools: tools.filter(isArabicTool).length,
    free_tools: tools.filter(isFreeTool).length,
  };
};

export const getTrendingToolsFromCatalog = async (limit = 10): Promise<FallbackTrendingTool[]> => {
  const tools = sortTools(filterPublishedTools(await loadToolsCatalogData()), "trending");

  return tools.slice(0, limit).map((tool) => ({
    id: Number(tool.id),
    title: tool.title ?? "",
    clicks_count: toNumber(tool.clicks_count),
  }));
};

export const getLatestToolsFromCatalog = async (limit = 3): Promise<Tool[]> => {
  const tools = sortTools(filterPublishedTools(await loadToolsCatalogData()), "newest");
  return tools.slice(0, limit);
};
