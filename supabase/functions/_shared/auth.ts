import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";

function getEnv(name: string): string {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`${name} environment variable is missing.`);
  }

  return value;
}

export function createUserClient(request: Request): SupabaseClient {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    throw new Error("Authorization header is missing.");
  }

  return createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_ANON_KEY"), {
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

export async function requireUser(client: SupabaseClient): Promise<User> {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("인증된 사용자가 필요합니다.");
  }

  return user;
}
