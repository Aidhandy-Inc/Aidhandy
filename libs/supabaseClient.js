import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let cachedClient = null;

const missingEnvMessage =
  "Supabase environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required. Add them to your .env and Vercel project settings.";

const getSupabaseClient = () => {
  if (cachedClient) return cachedClient;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(missingEnvMessage);
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
};

export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getSupabaseClient();
      const value = client[prop];
      return typeof value === "function" ? value.bind(client) : value;
    },
    has(_target, prop) {
      return prop in getSupabaseClient();
    },
    ownKeys() {
      return Reflect.ownKeys(getSupabaseClient());
    },
    getOwnPropertyDescriptor(_target, prop) {
      const client = getSupabaseClient();
      const descriptor = Object.getOwnPropertyDescriptor(client, prop);
      if (descriptor) return descriptor;
      return {
        configurable: true,
        enumerable: true,
        value: client[prop],
      };
    },
  }
);

export const ensureSupabaseIsConfigured = () => {
  try {
    return getSupabaseClient();
  } catch (error) {
    console.error(error.message);
    return null;
  }
};
