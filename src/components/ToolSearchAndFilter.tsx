import { FormEvent, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

const categories = [
  "الكل",
  "توليد الصور",
  "تحويل النص لصوت",
  "توليد الفيديو",
  "توليد النصوص",
  "الذكاء البصري",
  "البرمجة",
];

import { useTranslation } from "react-i18next";

const categoryKeys: Record<string, string> = {
  "الكل": "categories.all",
  "توليد الصور": "categories.image_gen",
  "تحويل النص لصوت": "categories.text_to_audio",
  "توليد الفيديو": "categories.video_gen",
  "توليد النصوص": "categories.text_gen",
  "الذكاء البصري": "categories.vision",
  "البرمجة": "categories.code",
};

export default function ToolSearchAndFilter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const { t, i18n } = useTranslation();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-8 rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm" dir={i18n.dir()}>
      <form className="relative" onSubmit={handleSubmit}>
        <label htmlFor="tool-search" className="sr-only">
          {t("search.label")}
        </label>
        <Search
          size={24}
          className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400"
          aria-hidden="true"
        />
        <input
          id="tool-search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("search.ai_tool")}
          className="w-full rounded-full border border-neutral-200 bg-neutral-100 px-16 py-5 text-xl placeholder-neutral-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <SlidersHorizontal size={20} aria-hidden="true" />
          {t("search.button")}
        </button>
      </form>

      <div>
        <h3 className="mb-4 text-sm font-semibold tracking-wider text-neutral-600">
          {t("search.browse_category")}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${selectedCategory === category
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-blue-300 hover:text-blue-700"
                }`}
              aria-pressed={selectedCategory === category}
            >
              {t(categoryKeys[category] || category)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
