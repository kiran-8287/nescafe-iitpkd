import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Coffee, LogOut, User, BookOpen, Building2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(data);
            setLoadingProfile(false);
        };
        fetchProfile();
    }, [user]);

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success('Signed out successfully. See you soon! ☕');
            navigate('/login', { replace: true });
        } catch (error) {
            toast.error('Sign out failed, but clearing local session.');
            navigate('/login', { replace: true });
        }
    };

    const displayName = profile?.name || user?.user_metadata?.name || 'Coffee Lover';
    const displayRole = profile?.role || user?.user_metadata?.role || 'student';
    const displayHostel = profile?.hostel || user?.user_metadata?.hostel || '—';

    return (
        <div className="min-h-screen bg-[#FFF8E1] flex flex-col items-center justify-center p-6 font-sans">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3E2723] rounded-2xl mb-4 shadow-lg">
                    <Coffee size={32} className="text-[#D4AF37]" />
                </div>
                <h1 className="text-3xl font-black text-[#3E2723]">Your Brew Hub</h1>
                <p className="text-gray-500 text-sm mt-1">Nescafe IITPKD — Member Dashboard</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-xl p-7 w-full max-w-sm space-y-5 mb-5">
                {loadingProfile ? (
                    <div className="text-center text-gray-400 py-4 animate-pulse">Loading your profile...</div>
                ) : (
                    <>
                        {/* Avatar placeholder */}
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#FFF8E1] border-2 border-[#D4AF37]/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl font-black text-[#3E2723]">
                                    {displayName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="font-black text-[#3E2723] text-lg leading-tight">{displayName}</p>
                                <p className="text-xs text-gray-400 font-medium">{user?.email}</p>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100" />

                        {/* Info Rows */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-wider">
                                    <BookOpen size={14} className="text-[#D4AF37]" /> Role
                                </span>
                                <span className="text-sm font-bold text-[#3E2723] capitalize">{displayRole}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-wider">
                                    <Building2 size={14} className="text-[#D4AF37]" /> Hostel/Block
                                </span>
                                <span className="text-sm font-bold text-[#3E2723]">{displayHostel}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Actions */}
            <div className="w-full max-w-sm space-y-3">
                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-[#3E2723] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#5D4037] transition-all shadow-lg active:scale-95"
                >
                    <ShoppingBag size={20} /> Browse Menu
                </button>
                <button
                    onClick={handleSignOut}
                    className="w-full bg-white border-2 border-red-100 text-red-500 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-red-50 transition-all active:scale-95"
                >
                    <LogOut size={20} /> Sign Out
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
