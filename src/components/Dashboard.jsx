import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Coffee, LogOut, User, Building2, Mail, Shield, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmSignOut, setConfirmSignOut] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        hostel: ''
    });

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        if (data) {
            setProfile(data);
            setFormData({
                name: data.name || '',
                hostel: data.hostel || ''
            });
        }
        setLoadingProfile(false);
    };

    const handleSaveProfile = async () => {
        if (!formData.name.trim()) {
            toast.error("Name cannot be empty!");
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    name: formData.name,
                    hostel: formData.hostel
                })
                .eq('id', user.id);

            if (error) throw error;
            toast.success("Profile updated! Looking sharp.");
            fetchProfile();
        } catch (error) {
            console.error('Update error:', error);
            toast.error("Failed to update. Maybe the caffeine hasn't kicked in.");
        } finally {
            setIsSaving(false);
        }
    };

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

    return (
        <div className="min-h-screen bg-[#FFF8E1] flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-sm mb-2">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[#3E2723] text-xs font-black uppercase tracking-widest hover:text-[#D4AF37] transition-colors"
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </div>

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
                        {/* Avatar + Name */}
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

                        {/* Form Fields */}
                        <div className="space-y-4 pt-1">

                            {/* Editable Name */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <User size={12} className="text-[#D4AF37]" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Your Name"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-[#3E2723] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                                />
                            </div>

                            {/* Editable Hostel / Block */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <Building2 size={12} className="text-[#D4AF37]" /> Hostel / Block
                                </label>
                                <input
                                    type="text"
                                    value={formData.hostel}
                                    onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                                    placeholder="e.g. Block A, Room 101"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-[#3E2723] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                                />
                            </div>

                            {/* Locked Email */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <Mail size={12} className="text-gray-400" /> Email Address
                                    <span className="ml-auto flex items-center gap-1 text-gray-300"><Lock size={10} /> Locked</span>
                                </label>
                                <div className="w-full bg-gray-100 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 cursor-not-allowed select-none">
                                    {user?.email}
                                </div>
                            </div>

                            {/* Locked Role */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <Shield size={12} className="text-gray-400" /> Role
                                    <span className="ml-auto flex items-center gap-1 text-gray-300"><Lock size={10} /> Locked</span>
                                </label>
                                <div className="w-full bg-gray-100 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 capitalize cursor-not-allowed select-none">
                                    {displayRole}
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-2 border-t border-gray-50">
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="w-full bg-[#3E2723] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#5D4037] transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Sign Out */}
            <div className="w-full max-w-sm">
                {!confirmSignOut ? (
                    <button
                        onClick={() => setConfirmSignOut(true)}
                        className="w-full bg-white border-2 border-red-100 text-red-500 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-red-50 transition-all active:scale-95 shadow-sm"
                    >
                        <LogOut size={20} /> Sign Out
                    </button>
                ) : (
                    <div className="bg-white border-2 border-red-100 rounded-2xl p-4 space-y-3 shadow-sm">
                        <p className="text-center text-sm font-black text-[#3E2723]">Sure you want to leave? ☕</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmSignOut(false)}
                                className="flex-1 py-3 rounded-xl border-2 border-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <LogOut size={14} /> Yes, Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
