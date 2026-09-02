import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function staffEmail(username: string) {
  return `${username.toLowerCase()}@clinica.internal`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Faça login como coordenador." }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: me, error: meError } = await admin
      .from("staff")
      .select("role")
      .eq("user_id", userData.user.id)
      .single();

    if (meError || me?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Só o coordenador cadastra funcionários." }), {
        status: 403,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { username, password, storeId, role } = await req.json();
    const cleanUser = String(username || "").trim().toLowerCase();
    const store = Number(storeId);
    const job = role === "doctor" ? "doctor" : "reception";

    if (!/^[a-z0-9._-]{3,30}$/.test(cleanUser) || !password || String(password).length < 6) {
      return new Response(JSON.stringify({ error: "Usuário (3-30 letras/números) e senha com no mínimo 6 caracteres." }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (![1, 2, 3].includes(store)) {
      return new Response(JSON.stringify({ error: "Escolha a localidade." }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await admin.auth.admin.createUser({
      email: staffEmail(cleanUser),
      password: String(password),
      email_confirm: true,
      user_metadata: { username: cleanUser, role: job, store_id: store },
    });

    if (error || !data.user) throw error ?? new Error("Falha ao criar usuário");

    const { error: staffError } = await admin.from("staff").insert({
      user_id: data.user.id,
      username: cleanUser,
      role: job,
      store_id: store,
    });

    if (staffError) throw staffError;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message ?? String(error) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
