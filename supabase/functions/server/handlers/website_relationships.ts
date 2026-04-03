/**
 * Durable provider-agnostic relationship records for map collections and carrier links.
 * These records complement website_preferences by storing role-based collections as first-class rows.
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  requireClerkSession,
  resolveWebsiteUserKeyForSession,
} from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

type RelationshipCollections = {
  connectedInsurerIds?: number[];
  customerSavedShopIds?: number[];
  insurerShortlistIds?: number[];
  shopWatchlistIds?: number[];
  updatedAt?: string | null;
};

type RelationshipConfig = {
  collectionKey: keyof RelationshipCollections;
  relationshipType:
    | "connected_insurer"
    | "customer_saved_shop"
    | "insurer_shortlist_shop"
    | "shop_watchlist_shop";
  targetType: "insurer" | "shop";
};

const RELATIONSHIP_CONFIGS: RelationshipConfig[] = [
  {
    collectionKey: "connectedInsurerIds",
    relationshipType: "connected_insurer",
    targetType: "insurer",
  },
  {
    collectionKey: "customerSavedShopIds",
    relationshipType: "customer_saved_shop",
    targetType: "shop",
  },
  {
    collectionKey: "insurerShortlistIds",
    relationshipType: "insurer_shortlist_shop",
    targetType: "shop",
  },
  {
    collectionKey: "shopWatchlistIds",
    relationshipType: "shop_watchlist_shop",
    targetType: "shop",
  },
];

function toNumericIds(values: unknown) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [...new Set(values.map((value) => Number(value)).filter((value) => Number.isFinite(value)))];
}

function mapRelationshipsToCollections(relationships: any[]) {
  const collections: RelationshipCollections = {
    connectedInsurerIds: [],
    customerSavedShopIds: [],
    insurerShortlistIds: [],
    shopWatchlistIds: [],
    updatedAt: null,
  };

  for (const relationship of relationships) {
    const config = RELATIONSHIP_CONFIGS.find(
      (entry) => entry.relationshipType === relationship.relationship_type
    );
    if (!config) {
      continue;
    }

    const targetId = Number(relationship.target_id);
    if (Number.isFinite(targetId)) {
      (collections[config.collectionKey] as number[]).push(targetId);
    }

    if (
      relationship.updated_at &&
      (!collections.updatedAt ||
        new Date(relationship.updated_at).getTime() > new Date(collections.updatedAt).getTime())
    ) {
      collections.updatedAt = relationship.updated_at;
    }
  }

  return collections;
}

function buildRelationshipRows(
  websiteUserKey: string,
  accountType: string | null | undefined,
  collections: RelationshipCollections
) {
  return RELATIONSHIP_CONFIGS.flatMap((config) =>
    toNumericIds(collections[config.collectionKey]).map((targetId) => ({
      account_type: accountType || null,
      relationship_type: config.relationshipType,
      target_id: String(targetId),
      target_label: null,
      target_metadata: {},
      target_type: config.targetType,
      website_user_key: websiteUserKey,
    }))
  );
}

export async function getWebsiteRelationships(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const session = await requireClerkSession(req, { requireEmail: false });
    const websiteUserKey = await resolveWebsiteUserKeyForSession(
      supabase,
      session,
      url.searchParams.get("websiteUserKey")
    );

    const { data, error } = await supabase
      .from("website_relationships")
      .select("*")
      .eq("website_user_key", websiteUserKey)
      .in(
        "relationship_type",
        RELATIONSHIP_CONFIGS.map((config) => config.relationshipType)
      );

    if (error) {
      console.error("Error fetching website relationships:", error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    const relationships = Array.isArray(data) ? data : [];
    return respond({
      collections: mapRelationshipsToCollections(relationships),
      relationships,
      success: true,
      updatedAt:
        relationships.reduce((latestTimestamp: string | null, relationship: any) => {
          if (!relationship.updated_at) {
            return latestTimestamp;
          }

          if (!latestTimestamp) {
            return relationship.updated_at;
          }

          return new Date(relationship.updated_at).getTime() > new Date(latestTimestamp).getTime()
            ? relationship.updated_at
            : latestTimestamp;
        }, null) || null,
    });
  } catch (error: any) {
    console.error("Error in get website relationships endpoint:", error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("website identity mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function saveWebsiteRelationships(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const session = await requireClerkSession(req, { requireEmail: false });
    const { accountType, collections, identity } = body || {};

    if (!identity) {
      return respond({ error: "Missing identity" }, 400);
    }

    const websiteUserKey = await resolveWebsiteUserKeyForSession(
      supabase,
      session,
      identity.websiteUserKey || null
    );

    const nextCollections: RelationshipCollections = {
      connectedInsurerIds: toNumericIds(collections?.connectedInsurerIds),
      customerSavedShopIds: toNumericIds(collections?.customerSavedShopIds),
      insurerShortlistIds: toNumericIds(collections?.insurerShortlistIds),
      shopWatchlistIds: toNumericIds(collections?.shopWatchlistIds),
      updatedAt: collections?.updatedAt || new Date().toISOString(),
    };

    const relationshipTypes = RELATIONSHIP_CONFIGS.map((config) => config.relationshipType);
    const { error: deleteError } = await supabase
      .from("website_relationships")
      .delete()
      .eq("website_user_key", websiteUserKey)
      .in("relationship_type", relationshipTypes);

    if (deleteError) {
      console.error("Error deleting stale website relationships:", deleteError);
      return respond({ error: sanitizeErrorMessage(deleteError) }, 500);
    }

    const rows = buildRelationshipRows(websiteUserKey, accountType, nextCollections);
    if (rows.length > 0) {
      const { error: insertError } = await supabase.from("website_relationships").insert(rows);

      if (insertError) {
        console.error("Error saving website relationships:", insertError);
        return respond({ error: sanitizeErrorMessage(insertError) }, 500);
      }
    }

    return respond({
      collections: nextCollections,
      success: true,
      updatedAt: nextCollections.updatedAt,
    });
  } catch (error: any) {
    console.error("Error in save website relationships endpoint:", error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("website identity mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}
