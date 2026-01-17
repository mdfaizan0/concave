import { supabase } from "../lib/supabase.js";

export async function resolveAccess({
  userId,
  resourceType,
  resourceId,
  requireEdit = false
}) {
  const table = resourceType === "file" ? "files" : "folders";

  // 1️⃣ Owner check
  const { data: owned } = await supabase
    .from(table)
    .select("id")
    .eq("id", resourceId)
    .eq("owner_id", userId)
    .single();

  if (owned) {
    return { role: "owner" };
  }
  
  // 2️⃣ Shared access
  const { data: share } = await supabase
  .from("shares")
  .select("role")
  .eq("resource_type", resourceType)
  .eq("resource_id", resourceId)
  .eq("user_id", userId)
  .single();
  
  if (!share) return null;
  
  if (requireEdit && share.role !== "editor") {
    return null;
  }
  
  return share;
}