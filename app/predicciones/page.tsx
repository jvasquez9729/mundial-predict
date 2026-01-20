import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";
import { PredictionsPanel } from "@/components/predictions-panel";

export default async function PrediccionesPage() {
  // Verificar autenticación usando el sistema de sesión
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const supabase = createServiceClient();

  // Fetch user profile desde la tabla users (no profiles)
  const { data: userProfile } = await supabase
    .from("users")
    .select("id, nombre_completo, email, cedula, celular, es_admin, creado_en")
    .eq("id", session.userId)
    .single();

  if (!userProfile) {
    redirect("/login");
  }

  // Fetch upcoming matches
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      equipo_local:equipo_local_id(id, nombre, codigo),
      equipo_visitante:equipo_visitante_id(id, nombre, codigo)
    `)
    .gte("fecha_hora", new Date().toISOString())
    .eq("estado", "proximo")
    .order("fecha_hora", { ascending: true });

  // Fetch user predictions
  const { data: predictions } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", session.userId);

  // Crear objeto user compatible con PredictionsPanel
  const user = {
    id: userProfile.id,
    email: userProfile.email,
    nombre_completo: userProfile.nombre_completo,
    es_admin: userProfile.es_admin,
  };

  return (
    <PredictionsPanel 
      user={user} 
      profile={userProfile} 
      matches={matches || []} 
      existingPredictions={predictions || []}
    />
  );
}
