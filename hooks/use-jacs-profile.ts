/**
 * useJacsProfile — loads the persisted JACS user profile from AsyncStorage.
 *
 * Returns the profile (or null while loading / not yet set).
 * Components can use this to customise UI based on the user's health goals.
 */
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { JacsUserProfile } from "@/app/setup-wizard";

export function useJacsProfile() {
  const [profile, setProfile] = useState<JacsUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("@jacs_user_profile")
      .then((raw) => {
        if (raw) {
          try { setProfile(JSON.parse(raw)); } catch { /* ignore */ }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    const raw = await AsyncStorage.getItem("@jacs_user_profile");
    if (raw) {
      try { setProfile(JSON.parse(raw)); } catch { /* ignore */ }
    }
  };

  return { profile, loading, refresh };
}
