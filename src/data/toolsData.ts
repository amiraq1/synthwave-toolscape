import type { Tool } from "@/hooks/useTools";

let cachedTools: Tool[] | null = null;
let inFlight: Promise<Tool[]> | null = null;

export const loadToolsData = async (): Promise<Tool[]> => {
  if (cachedTools) return cachedTools;

  if (!inFlight) {
    const base = import.meta.env.BASE_URL || "/";
    const url = `${base.replace(/\/$/, "")}/data/tools.json`;

    inFlight = fetch(url, { cache: "force-cache" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load tools data: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        cachedTools = data as Tool[];
        return cachedTools;
      })
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
};
