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

  // Fetch upcoming matches - usar !inner para relaciones many-to-one
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id,
      fase,
      fecha_hora,
      estadio,
      estado,
      predicciones_cerradas,
      equipo_local:teams!equipo_local_id(id, nombre, codigo, bandera_url),
      equipo_visitante:teams!equipo_visitante_id(id, nombre, codigo, bandera_url)
    `)
    .gte("fecha_hora", new Date().toISOString())
    .eq("estado", "proximo")
    .order("fecha_hora", { ascending: true });

  // Fetch user predictions (goles_local, goles_visitante para inicializar panel)
  const { data: predictions } = await supabase
    .from("predictions")
    .select("id, match_id, goles_local, goles_visitante")
    .eq("user_id", session.userId);

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
