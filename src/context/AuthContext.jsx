import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get the initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                // On sign-in, ensure user profile row exists in users table and store local metadata
                if (session?.user) {
                    const profile = await ensureUserProfile(session.user);
                    // Save minimal info for returning user view
                    localStorage.setItem('nescafe_user_metadata', JSON.stringify({
                        name: profile?.name || session.user.user_metadata?.name || 'User',
                        email: session.user.email,
                        lastLogin: Date.now()
                    }));
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const ensureUserProfile = async (user) => {
        try {
            // Check if row already exists
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .eq('id', user.id)
                .single();

            if (error && error.code === 'PGRST116') {
                // Row doesn't exist, insert from metadata set during signup
                const meta = user.user_metadata || {};
                const newUser = {
                    id: user.id,
                    name: meta.name || 'Anonymous',
                    role: meta.role || 'student',
                    hostel: meta.hostel || null,
                };
                await supabase.from('users').insert(newUser);
                return newUser;
            }
            return data;
        } catch (e) {
            console.error('Error ensuring user profile:', e);
            return null;
        }
    };

    const signOut = async () => {
        try {
            // Manually clear state first for immediate UI response
            setSession(null);
            setUser(null);
            await supabase.auth.signOut();
        } catch (e) {
            console.error('Error during sign out:', e);
            // Even if it fails, we want the app to treat the user as logged out locally
            setSession(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
