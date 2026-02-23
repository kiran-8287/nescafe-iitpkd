import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Get the initial session
        supabase.auth.getSession().then(async ({ data: { session }, error }) => {
            if (!mounted) return;

            if (error) {
                console.error('Initial session fetch error:', error);
                setLoading(false);
                return;
            }

            setSession(session);
            setUser(session?.user ?? null);

            // Resolve loading state immediately after session is found
            setLoading(false);

            if (session?.user) {
                try {
                    const profileData = await ensureUserProfile(session.user);
                    if (mounted) setProfile(profileData);
                } catch (e) {
                    console.error('Initial profile fetch failed:', e);
                }
            }
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                console.log('Auth State Change Event:', event, 'Session:', session);
                setSession(session);
                setUser(session?.user ?? null);

                // Resolve loading state immediately after session is found/changed
                setLoading(false);

                // On sign-in, ensure user profile row exists
                if (session?.user) {
                    try {
                        const profileData = await ensureUserProfile(session.user);
                        if (mounted) setProfile(profileData);
                    } catch (e) {
                        console.error('Auth state change profile fetch failed:', e);
                    }
                } else {
                    setProfile(null);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const ensureUserProfile = async (user) => {
        try {
            console.log('Checking for profile for user:', user.id);
            // Check if row already exists
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('Profile not found, inserting...');
                    // Row doesn't exist, insert from metadata set during signup
                    const meta = user.user_metadata || {};
                    const newUser = {
                        id: user.id,
                        name: meta.name || 'Anonymous',
                        role: meta.role || 'student',
                        hostel: meta.hostel || null,
                    };
                    const { error: insertError } = await supabase.from('users').insert(newUser);
                    if (insertError) {
                        console.error('Error inserting user profile:', insertError);
                    } else {
                        console.log('Profile created successfully');
                    }
                    return newUser;
                }
                console.error('Error checking user profile:', error);
                return null;
            }
            console.log('Profile already exists');
            return data;
        } catch (e) {
            console.error('Caught exception in ensureUserProfile:', e);
            return null;
        }
    };

    const signOut = async () => {
        try {
            // Manually clear state first for immediate UI response
            setSession(null);
            setUser(null);
            setProfile(null);
            await supabase.auth.signOut();
        } catch (e) {
            console.error('Error during sign out:', e);
            // Even if it fails, we want the app to treat the user as logged out locally
            setSession(null);
            setUser(null);
            setProfile(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
