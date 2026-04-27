import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Fails fast if Supabase is paused or unreachable (free tier pauses after 7 days)
// 20s timeout to handle slow mobile connections and cold starts
const withTimeout = (promise, ms = 20000) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Connection timed out. Please check your network.`)), ms)
        )
    ]);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    // Always start false — set only after DB confirms admin status.
    // Do NOT read from localStorage here — that's a privilege escalation vector.
    // The DB check is fast (<500ms) and localStorage still caches for future sessions.
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async (currentSession) => {
            if (!mounted) return;

            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            if (currentSession?.user) {
                try {
                    // Start both checks immediately
                    const profilePromise = ensureUserProfile(currentSession.user);
                    const adminPromise = checkIsAdmin(currentSession.user.id);

                    const [profileData, adminStatus] = await Promise.all([profilePromise, adminPromise]);

                    if (mounted) {
                        setProfile(profileData);
                        setIsAdmin(adminStatus);
                        // Cache the status
                        localStorage.setItem('nescafe_is_admin', adminStatus.toString());
                    }
                } catch (e) {
                    console.error('Auth initialization fetch failed:', e);
                }
            } else {
                if (mounted) {
                    setProfile(null);
                    setIsAdmin(false);
                    localStorage.removeItem('nescafe_is_admin');
                }
            }

            if (mounted) setLoading(false);
        };

        // Get initial session
        supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
            initializeAuth(initialSession);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
                // console.log('Auth State Change Event:', event); // Debug only

                // If it's a sign-out event, clear immediately
                if (event === 'SIGNED_OUT') {
                    if (mounted) {
                        setSession(null);
                        setUser(null);
                        setProfile(null);
                        setIsAdmin(false);
                        localStorage.removeItem('nescafe_is_admin');
                        setLoading(false);
                    }
                    return;
                }

                // For other events (SIGNED_IN, TOKEN_REFRESHED), re-verify
                // But don't flip loading back to true if it was already false during a refresh
                // to avoid jarring UI flickers unless it's a new sign-in
                if (event === 'SIGNED_IN') setLoading(true);

                initializeAuth(currentSession);
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Check if the logged-in user exists in the dedicated admins table
    const checkIsAdmin = async (userId) => {
        if (!userId) return false;
        try {
            const { data, error } = await withTimeout(
                supabase
                    .from('admins')
                    .select('user_id')
                    .eq('user_id', userId)
                    .maybeSingle()
            );

            if (error) {
                // PGRST116 is "No rows found"
                if (error.code === 'PGRST116') return false;
                // For other errors (network, timeout), we fail safe (no admin)
                // We no longer trust localStorage as an authority here!
                console.error('Supabase admin check error:', error.message);
                return false;
            }
            return !!data;
        } catch (e) {
            console.error('Admin check failed:', e.message);
            // Fail safe on timeout/exception
            return false;
        }
    };

    const ensureUserProfile = async (user) => {
        try {
            // console.log('Checking for profile for user:', user.id); // Debug only
            const { data, error } = await withTimeout(
                supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle()
            );

            if (error) {
                if (error.code === 'PGRST116') {
                    // console.log('Profile not found, inserting...'); // Debug only
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
                        // console.log('Profile created successfully'); // Debug only
                    }
                    return newUser;
                }
                console.error('Error checking user profile:', error);
                return null;
            }
            // console.log('Profile already exists'); // Debug only
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
