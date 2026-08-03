import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: string;
  hotelId: string | null;
  subscriptionStatus: string;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: "guest",
  hotelId: null,
  subscriptionStatus: "unsubscribed",
  loading: true,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string>("guest");
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("unsubscribed");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        extractRolesAndMetadata(session.user);
      } else {
        setRole("guest");
        setHotelId(null);
        setSubscriptionStatus("unsubscribed");
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const extractRolesAndMetadata = async (user: User) => {
    // By default, extract from user_metadata (which can be set during signup or via admin triggers)
    const metadata = user.user_metadata || {};
    let currentRole = metadata.role || "hotel_receptionist";
    let currentHotelId = metadata.hotel_id || null;

    // For extra safety, we can also query the users table to get real-time role
    // This is useful if role was updated by super_admin
    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("role, hotel_id")
        .eq("id", user.id)
        .single();
        
      if (!error && userData) {
        currentRole = userData.role;
        currentHotelId = userData.hotel_id;
      }
      
      // Also fetch subscription status if we have a hotel_id
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
    } catch (err) {
      console.error("Error fetching user role:", err);
    }

    setRole(currentRole);
    setHotelId(currentHotelId);
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, role, hotelId, subscriptionStatus, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
