/*
========================
SECTION: PROFILE DATA HOOK
========================
*/

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const profileCache = new Map();

export default function useUserProfile(email) {
  const [profile, setProfile] = useState(() => profileCache.get(email || "") || null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const cleanEmail = (email || "").trim();
      if (!cleanEmail) {
        if (active) setProfile(null);
        return;
      }

      const cached = profileCache.get(cleanEmail);
      if (cached) {
        if (active) setProfile(cached);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("name, avatar_url")
        .ilike("email", cleanEmail)
        .maybeSingle();

      const normalized = {
        name: data?.name || "",
        avatar_url: data?.avatar_url || "",
      };

      profileCache.set(cleanEmail, normalized);
      if (active) setProfile(normalized);
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [email]);

  return profile;
}
