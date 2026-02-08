import { supabase } from "./client";
import type { Profile } from "./types";

export async function getProfile(email: string): Promise<Profile | null> {
  try {
    console.log("🔍 Fetching profile for:", email);

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.log("⏱️ Profile fetch timed out after 5 seconds");
        resolve(null);
      }, 5000);
    });

    const fetchPromise = supabase.from("profiles").select("*").eq("email", email).single();

    const result = await Promise.race([fetchPromise, timeoutPromise]);

    if (result === null) {
      console.log("⚠️ Profile fetch timed out - continuing without profile");
      return null;
    }

    const { data, error } = result as any;

    if (error) {
      if (error.code === "PGRST116") {
        console.log("ℹ️ No profile found for", email);
        return null;
      }
      if (error.code === "PGRST205" || error.code === "42P01") {
        console.log("ℹ️ Profiles table not set up yet - using local storage");
        return null;
      }
      console.error("Error fetching profile:", error);
      return null;
    }

    console.log("✅ Profile loaded from database");

    const profile = data as Profile;
    if (email.toLowerCase() === "bidondent@gmail.com" && !profile.is_admin) {
      console.log("👑 Auto-upgrading bidondent@gmail.com to admin status...");
      try {
        await supabase.from("profiles").update({ is_admin: true }).eq("email", email);

        profile.is_admin = true;
        console.log("✅ Profile upgraded to admin");
      } catch (upgradeError) {
        console.error(
          "⚠️ Failed to upgrade to admin (will try again on next login):",
          upgradeError
        );
      }
    }

    return profile;
  } catch (error) {
    console.error("Error in getProfile:", error);
    return null;
  }
}

export async function saveProfile(profile: Profile): Promise<boolean> {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("❌ Cannot save profile: User not authenticated");
      return false;
    }

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!currentProfile) {
      const { data: emailTaken } = await supabase
        .from("profiles")
        .select("user_id, email")
        .eq("email", profile.email)
        .maybeSingle();

      if (emailTaken && emailTaken.user_id !== user.id) {
        console.error(`❌ Email ${profile.email} is already in use by another account`);
        return false;
      }
    }

    const profileData: any = {
      user_id: user.id,
      email: profile.email,
      name: profile.name,
      phone: profile.phone || null,
      profile_image_url: profile.profile_image_url || null,
      account_type: profile.account_type,
      is_admin: profile.email.toLowerCase() === "bidondent@gmail.com"
    };

    if (profile.setup_completed !== undefined) {
      profileData.setup_completed = profile.setup_completed;
    }

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id, email")
      .eq("email", profile.email)
      .maybeSingle();

    if (existingProfile && existingProfile.user_id !== profile.user_id) {
      console.log(
        `🔄 Email ${profile.email} exists with different user_id - cleaning up old profile...`
      );
      await supabase.from("profiles").delete().eq("email", profile.email).neq("user_id", profile.user_id);
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(profileData, {
        onConflict: "user_id"
      });

    if (error) {
      if (error.code === "23505" && error.message.includes("profiles_email_key")) {
        console.warn(`⚠️ Email conflict detected for ${profile.email} - attempting to resolve...`);

        await supabase.from("profiles").delete().eq("email", profile.email).neq("user_id", profile.user_id);

        const { error: retryError } = await supabase
          .from("profiles")
          .upsert(profileData, {
            onConflict: "user_id"
          });

        if (retryError) {
          console.error("Error saving profile after retry:", retryError);
          return false;
        }

        console.log("✅ Profile saved after resolving conflict");
        return true;
      }

      console.error("Error saving profile:", error);
      return false;
    }

    console.log("✅ Profile saved to database");
    return true;
  } catch (error) {
    console.error("Error in saveProfile:", error);
    return false;
  }
}

export async function markSetupCompleted(email: string): Promise<boolean> {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("❌ Cannot mark setup completed: User not authenticated");
      return false;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ setup_completed: true })
      .eq("user_id", user.id)
      .eq("email", email);

    if (error) {
      console.error("Error marking setup completed:", error);
      return false;
    }

    console.log("✅ Setup marked as completed for:", email);
    return true;
  } catch (error) {
    console.error("Error in markSetupCompleted:", error);
    return false;
  }
}
