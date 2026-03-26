import type { Profile } from "./types";
import {
  buildWebsiteIdentityQuery,
  requestSupabaseEdge,
  SUPABASE_EDGE_ROUTES,
} from "./runtime";

export type WebsiteProfileIdentity = {
  clerkUserId?: string | null;
  email?: string | null;
  websiteUserKey?: string | null;
};

function normalizeProfileIdentity(
  identityOrEmail: string | WebsiteProfileIdentity
): WebsiteProfileIdentity {
  if (typeof identityOrEmail === "string") {
    return { email: identityOrEmail };
  }

  return {
    clerkUserId: identityOrEmail.clerkUserId || null,
    email: identityOrEmail.email || null,
    websiteUserKey: identityOrEmail.websiteUserKey || null,
  };
}

export async function getProfile(
  identityOrEmail: string | WebsiteProfileIdentity
): Promise<Profile | null> {
  const identity = normalizeProfileIdentity(identityOrEmail);

  if (!identity.email && !identity.clerkUserId && !identity.websiteUserKey) {
    return null;
  }

  try {
    const query = buildWebsiteIdentityQuery(identity).toString();
    const payload = await requestSupabaseEdge<{ profile?: Profile | null }>(
      `${SUPABASE_EDGE_ROUTES.userProfile}?${query}`,
      {
        method: "GET",
      }
    );

    return payload.profile || null;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in getProfile:", error);
    return null;
  }
}

export async function saveProfile(
  profile: Profile,
  identity?: WebsiteProfileIdentity
): Promise<boolean> {
  try {
    await requestSupabaseEdge(SUPABASE_EDGE_ROUTES.userProfile, {
      body: JSON.stringify({
        identity: {
          clerkUserId: identity?.clerkUserId || null,
          email: identity?.email || profile.email,
          websiteUserKey: identity?.websiteUserKey || null,
        },
        profile,
      }),
      method: "POST",
    });

    if (import.meta.env.DEV) console.log("✅ Profile saved to database");
    return true;
  } catch (error) {
    console.error("Error in saveProfile:", error);
    return false;
  }
}

export async function markSetupCompleted(
  email: string,
  identity?: WebsiteProfileIdentity
): Promise<boolean> {
  try {
    const profile = await getProfile({
      clerkUserId: identity?.clerkUserId,
      email,
      websiteUserKey: identity?.websiteUserKey,
    });

    if (!profile) {
      return false;
    }

    return saveProfile(
      {
        ...profile,
        setup_completed: true,
      },
      identity
    );
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in markSetupCompleted:", error);
    return false;
  }
}
