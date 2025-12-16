import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  username: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  username: null,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const name = session.user.user_metadata?.username ||
                       session.user.user_metadata?.full_name ||
                       session.user.user_metadata?.name ||
                       session.user.email?.split('@')[0] || null;
          setUsername(name);
        } else {
          setUsername(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const name = session.user.user_metadata?.username ||
                     session.user.user_metadata?.full_name ||
                     session.user.user_metadata?.name ||
                     session.user.email?.split('@')[0] || null;
        setUsername(name);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, username, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
