// Global auth + profile state — wraps the whole app so any screen can read or update the profile.
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Discipline, Stage } from '@/data/creators';

export type UserProfile = {
  id?: string;          // DB row ID — set when fetched from or saved to Supabase
  name: string;
  disciplines: Discipline[];
  stage: Stage;
  location: string;
  workImageUrl: string;
  workCaption: string;
  currentProject: string;
  give: string[];
  get: string[];
  tastes: string[];
};

type UserProfileContextValue = {
  session: Session | null;
  isLoadingSession: boolean;
  profile: UserProfile | null;
  isLoadingProfile: boolean;
  draft: Partial<UserProfile>;
  updateDraft: (fields: Partial<UserProfile>) => void;
  createProfile: (p: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
  hasProfile: boolean;
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [draft, setDraft] = useState<Partial<UserProfile>>({});

  // Restore any saved session on startup, then listen for auth changes.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // When session changes, fetch (or clear) the user's profile from Supabase.
  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    fetchProfile(session.user.id);
  }, [session?.user.id]);

  async function fetchProfile(userId: string) {
    setIsLoadingProfile(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      setProfile({
        id:             data.id,
        name:           data.name,
        disciplines:    data.disciplines,
        stage:          data.stage,
        location:       data.location,
        workImageUrl:   data.work_image_url,
        workCaption:    data.work_caption,
        currentProject: data.current_project,
        give:           data.give,
        get:            data.get,
        tastes:         data.tastes,
      });
    }
    setIsLoadingProfile(false);
  }

  function updateDraft(fields: Partial<UserProfile>) {
    setDraft((prev) => ({ ...prev, ...fields }));
  }

  async function createProfile(p: UserProfile) {
    if (!session) throw new Error('Must be logged in to create a profile');

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id:         session.user.id,
        name:            p.name,
        disciplines:     p.disciplines,
        stage:           p.stage,
        location:        p.location,
        work_image_url:  p.workImageUrl,
        work_caption:    p.workCaption,
        current_project: p.currentProject,
        give:            p.give,
        get:             p.get,
        tastes:          p.tastes,
      }, { onConflict: 'user_id' })
      .select('id')
      .single();

    if (error) throw error;

    setProfile({ ...p, id: data.id });
    setDraft({});
    router.replace('/(tabs)');
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setDraft({});
  }

  return (
    <UserProfileContext.Provider
      value={{
        session,
        isLoadingSession,
        profile,
        isLoadingProfile,
        draft,
        updateDraft,
        createProfile,
        signOut,
        hasProfile: profile !== null,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile(): UserProfileContextValue {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used inside <UserProfileProvider>');
  return ctx;
}
