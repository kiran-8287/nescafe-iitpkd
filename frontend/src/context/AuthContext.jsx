import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Fails fast if Supabase is paused or unreachable (free tier pauses after 7 days)
const withTimeout = (promise, ms = 8000) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Supabase timed out after ${ms}ms. Project may be paused.`)), ms)
        )
    ]);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

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
            setLoading(false);

            if (session?.user) {
                try {
                    const [profileData, adminStatus] = await Promise.all([
                        ensureUserProfile(session.user),
                        checkIsAdmin(session.user.id)
                    ]);
                    if (mounted) {
                        setProfile(profileData);
                        setIsAdmin(adminStatus);
                    }
                } catch (e) {
                    console.error('Initial profile/admin fetch failed:', e);
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
                setLoading(false);

                if (session?.user) {
                    try {
                        const [profileData, adminStatus] = await Promise.all([
                            ensureUserProfile(session.user),
                            checkIsAdmin(session.user.id)
                        ]);
                        if (mounted) {
                            setProfile(profileData);
                            setIsAdmin(adminStatus);
                        }
                    } catch (e) {
                        console.error('Auth state change profile/admin fetch failed:', e);
                    }
                } else {
                    setProfile(null);
                    setIsAdmin(false);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Check if the logged-in user exists in the dedicated admins table
    const checkIsAdmin = async (userId) => {
        try {
            const { data, error } = await withTimeout(
                supabase
                    .from('admins')
                    .select('user_id')
                    .eq('user_id', userId)
                    .single()
            );
            if (error) return false; // PGRST116 = not found = not admin
            return !!data;
        } catch (e) {
            console.error('Admin check failed:', e.message);
            return false;
        }
    };

    const ensureUserProfile = async (user) => {
        try {
            console.log('Checking for profile for user:', user.id);
            const { data, error } = await withTimeout(
                supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single()
            );

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('Profile not found, inserting...');
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
            setSession(null);
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
            await supabase.auth.signOut();
        } catch (e) {
            console.error('Error during sign out:', e);
            setSession(null);
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, session, loading, isAdmin, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
