import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";

function getEnv(name: string): string {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`${name} environment variable is missing.`);
  }

  return value;
}

export function getSupabaseUrl(): string {
  return getEnv("SUPABASE_URL");
}

export function createUserClient(request: Request): SupabaseClient {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    throw new Error("Authorization header is missing.");
  }

  return createClient(getSupabaseUrl(), getEnv("SUPABASE_ANON_KEY"), {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createServiceRoleClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function requireUser(client: SupabaseClient): Promise<User> {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("Authenticated user is required.");
  }

  return user;
}