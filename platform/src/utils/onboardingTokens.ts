/**
 * EVER Guest OS — Admin-Mintable Onboarding Token Engine
 * Authoritative registry & validation utilities for invite-only client onboarding.
 */

export interface OperationalModules {
  direct_bookings: boolean;
  housekeeping: boolean;
  room_service: boolean;
  maintenance: boolean;
  upsells: boolean;
}

export type HospitalityTier = 
  | "select"       // Select Property (≤ 25 rooms)
  | "estate"       // Full-Service Estate (26–50 rooms)
  | "resort"       // Resort Operations (51–100 rooms)
  | "portfolio";   // Portfolio Infrastructure (100+ rooms)

export interface OnboardingInvite {
  id: string;
  token: string;
  hotel_slug: string;
  hotel_name: string;
  contact_email: string;
  tier: HospitalityTier;
  room_count: number;
  base_platform_fee: number;
  attribution_rate: number; // e.g. 0.025 for 2.5%
  onboarding_fee: number;
  onboarding_status: "pending" | "paid" | "waived";
  operational_modules: OperationalModules;
  expires_in_hours: number;
  created_at: string;
  expires_at: string;
  status: "pending" | "claimed" | "expired";
  claimed_at?: string;
  claimed_by_name?: string;
}

const STORAGE_KEY = "ever_onboarding_invites_v1";

// Initial seed invites for demo & testing
const DEFAULT_INVITES: OnboardingInvite[] = [
  {
    id: "inv-001",
    token: "evt_demo_the_grand_horizon",
    hotel_slug: "grand-horizon",
    hotel_name: "The Grand Horizon Resort",
    contact_email: "generalmanager@grandhorizon.com",
    tier: "resort",
    room_count: 75,
    base_platform_fee: 599,
    attribution_rate: 0.02,
    onboarding_fee: 1200,
    onboarding_status: "paid",
    operational_modules: {
      direct_bookings: true,
      housekeeping: true,
      room_service: true,
      maintenance: true,
      upsells: true,
    },
    expires_in_hours: 168, // 7 days
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    expires_at: new Date(Date.now() + 3600000 * 144).toISOString(),
    status: "pending",
  },
  {
    id: "inv-002",
    token: "evt_demo_oceanview_boutique",
    hotel_slug: "oceanview-boutique",
    hotel_name: "Oceanview Boutique & Villas",
    contact_email: "operations@oceanviewhotel.com",
    tier: "estate",
    room_count: 36,
    base_platform_fee: 349,
    attribution_rate: 0.025,
    onboarding_fee: 650,
    onboarding_status: "waived",
    operational_modules: {
      direct_bookings: true,
      housekeeping: true,
      room_service: false,
      maintenance: true,
      upsells: true,
    },
    expires_in_hours: 48,
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    expires_at: new Date(Date.now() + 3600000 * 38).toISOString(),
    status: "pending",
  },
  {
    id: "inv-003",
    token: "evt_demo_expired_token",
    hotel_slug: "heritage-palace",
    hotel_name: "The Heritage Palace",
    contact_email: "admin@heritagepalace.com",
    tier: "select",
    room_count: 18,
    base_platform_fee: 99,
    attribution_rate: 0.03,
    onboarding_fee: 300,
    onboarding_status: "pending",
    operational_modules: {
      direct_bookings: true,
      housekeeping: true,
      room_service: false,
      maintenance: false,
      upsells: true,
    },
    expires_in_hours: 24,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    expires_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "expired",
  }
];

export function getAllInvites(): OnboardingInvite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INVITES));
      return DEFAULT_INVITES;
    }
    const parsed: OnboardingInvite[] = JSON.parse(raw);
    // Check and update expired status dynamically
    const now = Date.now();
    return parsed.map(inv => {
      if (inv.status === "pending" && new Date(inv.expires_at).getTime() < now) {
        return { ...inv, status: "expired" as const };
      }
      return inv;
    });
  } catch (err) {
    console.error("Failed to load onboarding invites:", err);
    return DEFAULT_INVITES;
  }
}

export function saveInvites(invites: OnboardingInvite[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invites));
  } catch (err) {
    console.error("Failed to save onboarding invites:", err);
  }
}

/**
 * Mint a new cryptographically secure onboarding token
 */
export function mintOnboardingToken(params: {
  hotel_slug: string;
  hotel_name: string;
  contact_email: string;
  tier: HospitalityTier;
  room_count: number;
  base_platform_fee: number;
  attribution_rate: number;
  onboarding_fee: number;
  onboarding_status: "pending" | "paid" | "waived";
  operational_modules: OperationalModules;
  expires_in_hours: number;
}): OnboardingInvite {
  const randomSuffix = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  const token = `evt_${params.hotel_slug.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${randomSuffix}`;
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + params.expires_in_hours * 3600000);

  const newInvite: OnboardingInvite = {
    id: `inv-${Date.now()}`,
    token,
    hotel_slug: params.hotel_slug,
    hotel_name: params.hotel_name,
    contact_email: params.contact_email,
    tier: params.tier,
    room_count: params.room_count,
    base_platform_fee: params.base_platform_fee,
    attribution_rate: params.attribution_rate,
    onboarding_fee: params.onboarding_fee,
    onboarding_status: params.onboarding_status,
    operational_modules: params.operational_modules,
    expires_in_hours: params.expires_in_hours,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    status: "pending",
  };

  const existing = getAllInvites();
  const updated = [newInvite, ...existing];
  saveInvites(updated);

  return newInvite;
}

/**
 * Look up and validate a token
 */
export function validateOnboardingToken(token: string): {
  valid: boolean;
  invite?: OnboardingInvite;
  reason?: "not_found" | "expired" | "already_claimed";
} {
  if (!token) return { valid: false, reason: "not_found" };

  const invites = getAllInvites();
  const found = invites.find(inv => inv.token === token);

  if (!found) {
    return { valid: false, reason: "not_found" };
  }

  if (found.status === "claimed") {
    return { valid: false, invite: found, reason: "already_claimed" };
  }

  const isExpired = new Date(found.expires_at).getTime() < Date.now() || found.status === "expired";
  if (isExpired) {
    return { valid: false, invite: found, reason: "expired" };
  }

  return { valid: true, invite: found };
}

/**
 * Claim/redeem a token upon completing client onboarding
 */
export function claimOnboardingToken(token: string, claimedByName: string): boolean {
  const invites = getAllInvites();
  const index = invites.findIndex(inv => inv.token === token);

  if (index === -1) return false;

  invites[index] = {
    ...invites[index],
    status: "claimed",
    claimed_at: new Date().toISOString(),
    claimed_by_name: claimedByName,
  };

  saveInvites(invites);
  return true;
}

export function getTierLabel(tier: HospitalityTier): string {
  switch (tier) {
    case "select":
      return "Select Property (≤25 Rooms)";
    case "estate":
      return "Full-Service Estate (26–50 Rooms)";
    case "resort":
      return "Resort Operations (51–100 Rooms)";
    case "portfolio":
      return "Portfolio Infrastructure (100+ Rooms)";
    default:
      return tier;
  }
}
