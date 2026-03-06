import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { createSupabaseNetworkError, isSupabaseNetworkError } from '@/lib/supabaseNetwork';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    '[نبض AI] Supabase environment variables are missing.\n' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.'
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

const globalFetch = globalThis.fetch.bind(globalThis);
const supabaseHost = new URL(SUPABASE_URL).host;
let supabaseNetworkUnavailable = false;

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    supabaseNetworkUnavailable = false;
  });
}

const isSupabaseRequest = (input: string | URL | Request) => {
  const requestUrl =
    input instanceof Request
      ? new URL(input.url)
      : new URL(typeof input === "string" ? input : input.toString(), SUPABASE_URL);

  return requestUrl.host === supabaseHost;
};

const supabaseFetch: typeof fetch = async (input, init) => {
  if (!isSupabaseRequest(input)) {
    return globalFetch(input, init);
  }

  if (supabaseNetworkUnavailable) {
    throw createSupabaseNetworkError("cached offline host");
  }

  try {
    const response = await globalFetch(input, init);
    supabaseNetworkUnavailable = false;
    return response;
  } catch (error) {
    supabaseNetworkUnavailable = true;
    throw (isSupabaseNetworkError(error) ? createSupabaseNetworkError(error) : createSupabaseNetworkError(error));
  }
};

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: supabaseFetch,
    },
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
  }
);

export { isSupabaseNetworkError };
