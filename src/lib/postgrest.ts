import { PostgrestClient } from "@supabase/postgrest-js";

const POSTGREST_SCHEMA = process.env.POSTGREST_SCHEMA || "public";

function resolveBaseUrl(): string {
  const pg = process.env.POSTGREST_URL || "";
  if (pg) return pg;
  const supa = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (supa) return `${supa.replace(/\/$/, "")}/rest/v1`;
  return "";
}

function resolveApiKey(): string {
  return (
    process.env.POSTGREST_API_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

export function createPostgrestClient(userToken?: string) {
  const baseUrl = resolveBaseUrl();
  const apiKey = resolveApiKey();
  const client = new PostgrestClient(baseUrl, {
    schema: POSTGREST_SCHEMA,
    fetch: (...args) => {
      let [url, options] = args;

      if (url instanceof URL || typeof url === "string") {
        const urlObj = url instanceof URL ? url : new URL(url);
        const columns = urlObj.searchParams.get("columns");

        if (columns && columns.includes('"')) {
          const fixedColumns = columns.replace(/"/g, "");
          urlObj.searchParams.set("columns", fixedColumns);
          url = urlObj.toString();
        }
      }

      return fetch(url, {
        ...options,
      } as RequestInit);
    },
  });

  client.headers.set("Content-Type", "application/json");
  if (apiKey) {
    client.headers.set("apikey", apiKey);
    client.headers.set("Authorization", `Bearer ${apiKey}`);
    client.headers.set("Postgrest-API-Key", apiKey);
  }
  return client;
}
