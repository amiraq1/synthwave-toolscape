# AI Coding Guide — نبض (Nabd) AI Tools Directory

## Architecture Overview
Arabic-first AI tools directory built with **Vite + React 18 + TypeScript**, **TanStack Query**, **Supabase** (auth + DB + Edge Functions), **Tailwind/shadcn**. Uses **HashRouter** for static hosting compatibility.

## Critical Patterns

### Routing & Lazy Loading
- All pages lazy-loaded in [src/App.tsx](src/App.tsx) — add new routes **above** the `*` catch-all
- Global `ChatWidget` is lazy-rendered on every page; `ScrollToTop` handles navigation scroll reset
- Dev server runs on port 8080: `npm run dev`

### Data Layer (Supabase)
- Client: [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts) — uses `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Tool.id is string on client, int in DB** — always use `parseInt(id)` when querying, `String(id)` when returning
- Types auto-generated: [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts)

### TanStack Query Conventions
```ts
// Standard cache config used project-wide
staleTime: 1000 * 60 * 10,  // 10 min
gcTime: 1000 * 60 * 30,     // 30 min
refetchOnWindowFocus: false
```
- Query keys: `['tools']`, `['tool', id]`, `['reviews', toolId]`, `['semantic-search', query]`
- Review mutations invalidate: `reviews`, `review-stats`, `user-review`, `tool-ratings`

### Search Architecture
1. **Client-side**: [useTools.ts](src/hooks/useTools.ts) — `useInfiniteQuery` with ILIKE search, sanitizes `%`, `_`, `\` chars, trims to 100 chars
2. **Semantic fallback**: [useSemanticSearch.ts](src/hooks/useSemanticSearch.ts) — `useHybridSearch` triggers Edge Function when results < 3
3. **Edge Functions**: `supabase/functions/search/` uses Gemini `text-embedding-004` for vector search

### Edge Functions (Deno)
Located in `supabase/functions/`:
- `chat/` — Gemini 1.5 Flash chat with tool recommendations
- `search/` — Semantic vector search via `GEMINI_API_KEY`
- `generate-embeddings/` — Backfill embeddings for tools

Server-side envs: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`

### Auth Pattern
[useAuth.ts](src/hooks/useAuth.ts) manages Supabase auth state. Google OAuth stores return URL in `sessionStorage` as `nabd_return_to`. Always use hook helpers, not direct `supabase.auth` calls.

## UI/UX Conventions

### RTL-First Design
- All layouts default RTL; Tailwind utilities respect direction
- Arabic category names: `الكل`, `نصوص`, `صور`, `فيديو`, `برمجة`, `إنتاجية`, `دراسة وطلاب`, `صوت`
- Keep emoji/icon patterns consistent with existing toasts and badges

### Component Patterns
- `cn()` helper from [src/lib/utils.ts](src/lib/utils.ts) for conditional classnames
- Shadcn components in `src/components/ui/` — prefer these over custom implementations
- `LazyImage` for optimized image loading; `usePrefetchTool()` for hover prefetch on cards

### SEO & Structured Data
New pages must use:
```tsx
useSEO({ title: "...", description: "...", keywords: "...", ogType: "website" });
useStructuredData({ type: "itemList", name: "...", items: [...] });
```

## Key Files Reference
| Purpose | Location |
|---------|----------|
| Route definitions | [src/App.tsx](src/App.tsx) |
| Tools listing hook | [src/hooks/useTools.ts](src/hooks/useTools.ts) |
| Single tool fetch | [src/hooks/useTool.ts](src/hooks/useTool.ts) |
| Reviews (RPC-based) | [src/hooks/useReviews.ts](src/hooks/useReviews.ts) |
| Auth state | [src/hooks/useAuth.ts](src/hooks/useAuth.ts) |
| Supabase types | [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts) |
| Build config | [vite.config.ts](vite.config.ts) |

## Scripts
```bash
npm run dev        # Dev server (port 8080)
npm run build      # Production build
npm run build:dev  # Dev-mode build
npm run preview    # Preview production build
npm run lint       # ESLint
```

## Adding Features Checklist
- [ ] Lazy-load new pages in `App.tsx`
- [ ] Use TanStack Query with project cache defaults
- [ ] Sanitize user input before Supabase queries
- [ ] Add skeleton fallback for Suspense boundaries
- [ ] Include SEO hooks on new pages
- [ ] Keep Arabic text RTL-aware
- [ ] Access reviews via RPC (never expose `user_id` to client)