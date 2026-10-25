import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { InactivityModal } from "../shared/InactivityModal";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: string;
  hotelId: string | null;
  subscriptionStatus: string;
  loading: boolean;
  isOnline: boolean;
  lastLogin: string | null;
  signOut: () => Promise<void>;
  touchActivity: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: "guest",
  hotelId: null,
  subscriptionStatus: "unsubscribed",
  loading: true,
  isOnline: false,
  lastLogin: null,
  signOut: async () => {},
  touchActivity: () => {},
});

// Inactivity threshold: 30 minutes in milliseconds
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
// Countdown displayed to user before auto sign-out
const WARNING_COUNTDOWN_SECONDS = 60;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string>("guest");
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("unsubscribed");
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [showInactivityModal, setShowInactivityModal] = useState<boolean>(false);

  const lastActivityRef = useRef<number>(Date.now());
  const inactivityCheckTimerRef = useRef<NodeJS.Timeout | null>(null);
  const presenceHeartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Update online presence & last login in Supabase
  const updatePresence = useCallback(async (userId: string, online: boolean, updateTimestamp = false) => {
    try {
      const payload: Record<string, any> = {
        online_status: online,
      };
      if (updateTimestamp) {
        payload.last_login = new Date().toISOString();
      }

      await supabase
        .from("users")
        .update(payload)
        .eq("id", userId);

      setIsOnline(online);
      if (updateTimestamp && payload.last_login) {
        setLastLogin(payload.last_login);
      }
    } catch (err) {
      console.warn("[AuthContext] Failed to update presence in Supabase:", err);
    }
  }, []);

  const extractRolesAndMetadata = useCallback(async (authUser: User) => {
    const metadata = authUser.user_metadata || {};
    let currentRole = metadata.role || "hotel_receptionist";
    let currentHotelId = metadata.hotel_id || null;
    let userLastLogin: string | null = null;
    let userOnlineStatus = true;

    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("role, hotel_id, last_login, online_status")
        .eq("id", authUser.id)
        .single();
        
      if (!error && userData) {
        currentRole = userData.role || currentRole;
        currentHotelId = userData.hotel_id || currentHotelId;
        userLastLogin = userData.last_login || null;
        userOnlineStatus = userData.online_status ?? true;
      }

      // Fetch subscription status if hotel_id exists
      if (currentHotelId) {
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("hotel_id", currentHotelId)
          .single();
          
        if (subData) {
          setSubscriptionStatus(subData.status);
        }
      }

      // Record dynamic login timestamp and mark as online in Supabase
      const nowIso = new Date().toISOString();
      await updatePresence(authUser.id, true, true);
      userLastLogin = nowIso;
      userOnlineStatus = true;

    } catch (err) {
      console.error("[AuthContext] Error fetching user role:", err);
    }

    setRole(currentRole);
    setHotelId(currentHotelId);
    setLastLogin(userLastLogin);
    setIsOnline(userOnlineStatus);
    setLoading(false);
  }, [updatePresence]);

  useEffect(() => {
    // Check initial active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        extractRolesAndMetadata(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // On initial sign in or token refresh, extract and update presence
        extractRolesAndMetadata(session.user);
      } else {
        setRole("guest");
        setHotelId(null);
        setSubscriptionStatus("unsubscribed");
        setIsOnline(false);
        setLastLogin(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [extractRolesAndMetadata]);

  // Periodic heartbeat: keeps presence fresh every 5 minutes while user is active
  useEffect(() => {
    if (!user) {
      if (presenceHeartbeatRef.current) clearInterval(presenceHeartbeatRef.current);
      return;
    }

    presenceHeartbeatRef.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current < INACTIVITY_TIMEOUT_MS) {
        updatePresence(user.id, true, false);
      }
    }, 5 * 60 * 1000);

    return () => {
      if (presenceHeartbeatRef.current) clearInterval(presenceHeartbeatRef.current);
    };
  }, [user, updatePresence]);

  // Mark offline when user closes tab / window
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user?.id) {
        // Try beacon if supported or immediate fetch
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseKey) {
          const payload = JSON.stringify({ online_status: false });
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon?.(
            `${supabaseUrl}/rest/v1/users?id=eq.${user.id}`,
            blob
          );
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user]);

  // Inactivity tracking (30 minutes)
  const touchActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showInactivityModal) {
      setShowInactivityModal(false);
    }
  }, [showInactivityModal]);

  useEffect(() => {
    if (!user) return;

    // Listen to user interactions (throttled)
    let lastThrottledTime = 0;
    const handleUserInteraction = () => {
      const now = Date.now();
      if (now - lastThrottledTime > 5000) {
        lastThrottledTime = now;
        lastActivityRef.current = now;
      }
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
    events.forEach(evt => window.addEventListener(evt, handleUserInteraction, { passive: true }));

    // Check inactivity every 30 seconds
    inactivityCheckTimerRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime >= INACTIVITY_TIMEOUT_MS && !showInactivityModal) {
        setShowInactivityModal(true);
      }
    }, 30 * 1000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserInteraction));
      if (inactivityCheckTimerRef.current) clearInterval(inactivityCheckTimerRef.current);
    };
  }, [user, showInactivityModal]);

  const signOut = async () => {
    try {
      if (user?.id) {
        await updatePresence(user.id, false, false);
      }
    } catch (e) {
      console.warn("[AuthContext] Failed to mark user offline:", e);
    }

    // Immediately reset in-memory state
    setUser(null);
    setSession(null);
    setRole("guest");
    setHotelId(null);
    setSubscriptionStatus("unsubscribed");
    setIsOnline(false);
    setLastLogin(null);
    setShowInactivityModal(false);

    // Completely clear persistent and session storage
    sessionStorage.removeItem("ever_sandbox_data_v2");
    sessionStorage.clear();
    
    // Clear Supabase auth keys from localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("sb-") || key.includes("supabase") || key.startsWith("ever_session"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (err) {
      console.warn("[AuthContext] Error purging localStorage auth keys:", err);
    }

    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (err) {
      console.warn("[AuthContext] Supabase signOut error:", err);
    }
  };

  const handleStaySignedIn = () => {
    setShowInactivityModal(false);
    lastActivityRef.current = Date.now();
    if (user?.id) {
      updatePresence(user.id, true, false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        hotelId,
        subscriptionStatus,
        loading,
        isOnline,
        lastLogin,
        signOut,
        touchActivity,
      }}
    >
      {children}
      <InactivityModal
        isOpen={showInactivityModal}
        countdownSeconds={WARNING_COUNTDOWN_SECONDS}
        onStaySignedIn={handleStaySignedIn}
        onSignOut={signOut}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
