import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
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
      return json({ error: "Faça login como coordenador." }, 401);
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
      return json({ error: "Só o coordenador gerencia acessos." }, 403);
    }

    const { userId, active } = await req.json();
    const targetId = String(userId || "");
    const shouldActivate = Boolean(active);

    if (!targetId) {
      return json({ error: "Usuário não informado." }, 400);
    }

    if (targetId === userData.user.id) {
      return json({ error: "Você não pode alterar o próprio acesso." }, 403);
    }

    const { data: target, error: targetError } = await admin
      .from("staff")
      .select("username, role")
      .eq("user_id", targetId)
      .single();

    if (targetError || !target) {
      return json({ error: "Usuário não encontrado." }, 404);
    }

    if (target.role === "admin") {
      return json({ error: "Não é possível bloquear o coordenador." }, 403);
    }

    const { error: authError } = await admin.auth.admin.updateUserById(targetId, {
      ban_duration: shouldActivate ? "none" : "876000h",
    });

    if (authError) {
      throw authError;
    }

    const { error: staffError } = await admin
      .from("staff")
      .update({ is_active: shouldActivate })
      .eq("user_id", targetId);

    if (staffError) {
      throw staffError;
    }

    return json({ ok: true, username: target.username, active: shouldActivate });
  } catch (error) {
    return json({ error: error.message ?? String(error) }, 500);
  }
});
