/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_GOOGLE_AUTH?: string;
  readonly VITE_ENABLE_SEMANTIC_SEARCH?: string;
  readonly VITE_OWNER_EMAILS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
