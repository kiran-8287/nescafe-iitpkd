import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get the initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                const profileData = await ensureUserProfile(session.user);
                setProfile(profileData);
            }
            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth State Change Event:', event, 'Session:', session);
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                // On sign-in, ensure user profile row exists in users table and store local metadata
                if (session?.user) {
                    console.log('User signed in, ensuring profile exists...');
                    // Set profile but don't save to localStorage
                    const profileData = await ensureUserProfile(session.user);
                    setProfile(profileData);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const ensureUserProfile = async (user) => {
        try {
            console.log('Checking for profile for user:', user.id);
            // Check if row already exists
            const { data, error } = await supabase
                .from('users')
                .select('id')
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
