import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { toUUID } from '../lib/utils';

interface Profile {
  id: string;
  full_name: string;
  role: 'freelancer' | 'recruiter' | null;
  is_onboarded: boolean;
  skills?: string[];
  bio?: string;
  avatar_url?: string;
  header_url?: string;
  company_name?: string;
  industry?: string;
  website?: string;
  location?: string;
  hourly_rate?: number;
  rating?: number;
  earned?: string | number;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);


  const fetchProfile = async (fbUser: FirebaseUser) => {
    try {
      const mappedId = await toUUID(fbUser.uid);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', mappedId)
        .single();
        
      if (data) {
        setProfile(data as Profile);
      } else {
        // Auto-upsert: create profile if Firebase user exists but Supabase profile is missing
        const role = localStorage.getItem('user_role');

        // Always upsert to sync name, avatar, and role intent
        const { data: updatedProfile, error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: mappedId,
            full_name: fbUser.displayName || 'New User',
            avatar_url: fbUser.photoURL || null,
            role: role || 'freelancer', // Priority: localStorage > default
            is_onboarded: false,
          }, { onConflict: 'id' })
          .select()
          .single();

        if (upsertError) {
          console.error('Profile sync error:', upsertError);
        } else {
          setProfile(updatedProfile as Profile);
        }
      }
    } catch (err: any) {
      console.error('Profile fetch error:', err.message);
      setProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setLoading(true);
        setUser(fbUser);
        await fetchProfile(fbUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
