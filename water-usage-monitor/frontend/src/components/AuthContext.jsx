import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const AuthContext = createContext(null);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          await fetchProfile(data.session);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (session) => {
    try {
      const token = session.access_token;
      const res = await axios.get(`${API}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (e) {
      console.error('Failed to load profile', e);
    }
  };

  const value = {
    user,
    profile,
    loading,
    supabase
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

