import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Coffee, LogOut, User, Building2, Mail, Shield, Lock, ArrowLeft, Phone, BadgeCheck, ChevronRight, Activity, Pencil, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import usePushNotifications from '../hooks/usePushNotifications';

const Dashboard = () => {
    const { user, signOut, isAdmin } = useAuth();
    const navigate = useNavigate();
    const { permission, requestPermission } = usePushNotifications();
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        hostel: '',
        phone: ''
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        if (user) {
            fetchProfile();
        } else {
            setLoadingProfile(false);
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Profile fetch error:', error);
            }

            if (data) {
                setProfile(data);
                setFormData({
                    name: data.name || '',
                    hostel: data.hostel || '',
                    phone: data.phone || ''
                });
            }
        } catch (err) {
            console.error('Unexpected error in fetchProfile:', err);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!formData.name.trim()) {
            toast.error("Name cannot be empty!");
            return;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (formData.phone && formData.phone !== 'Not Provided' && !phoneRegex.test(formData.phone)) {
            toast.error("Please enter a valid 10-digit phone number.");
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    name: formData.name,
                    hostel: formData.hostel,
                    phone: formData.phone
                })
                .eq('id', user.id);

            if (error) throw error;
            toast.success("Profile updated! Looking sharp.");
            setIsEditing(false);
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

    const displayName = profile?.name || user?.user_metadata?.name || 'User';
    const displayRole = profile?.role || user?.user_metadata?.role || 'student';
    const initial = displayName.charAt(0).toUpperCase();

    if (loadingProfile) {
        return (
            <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#3E2723]/10 border-t-[#D4AF37] rounded-full animate-spin"></div>
                    <p className="text-[#3E2723]/60 font-medium animate-pulse">Refining your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] font-sans selection:bg-[#D4AF37]/20 pt-16 md:pt-20">
            {/* Global Navbar is now handled by App.js */}

            {/* Profile Cover Banner */}
            <div className="h-40 md:h-56 w-full bg-gradient-to-br from-[#3E2723] via-[#5D4037] to-[#D4AF37]/30 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute -bottom-1 left-0 w-full h-24 bg-gradient-to-t from-[#FDFCF8] to-transparent" />
            </div>

            <main className="max-w-4xl mx-auto px-6 -mt-16 md:-mt-24 relative z-10 space-y-8 pb-20">
                {/* Profile Identity Section */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8"
                >
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[2.5rem] shadow-2xl shadow-[#3E2723]/20 border-[6px] md:border-[10px] border-white overflow-hidden flex items-center justify-center transform transition-transform group-hover:scale-[1.02] duration-500">
                            <span className="text-5xl md:text-6xl font-black text-[#3E2723] drop-shadow-sm">{initial}</span>
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1 pb-4">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-4xl md:text-5xl font-black text-[#3E2723] tracking-tight drop-shadow-sm">{displayName}</h1>
                            <div className="bg-blue-500 p-1.5 rounded-full shadow-lg shadow-blue-500/20">
                                <BadgeCheck size={20} className="text-white" />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <span className="px-3 py-1 bg-[#3E2723]/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#3E2723]/60 border border-[#3E2723]/5">
                                Verified Member
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="text-gray-400 font-bold text-sm tracking-tight">{user?.email}</span>
                        </div>
                    </div>

                </motion.section>

                <div className="max-w-2xl mx-auto space-y-8">
                    {/* Personal Details Group */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#3E2723]/5"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#FFF8E1] rounded-xl flex items-center justify-center">
                                <User size={20} className="text-[#D4AF37]" />
                            </div>
                            <div>
                                <h3 className="font-black text-[#3E2723] leading-none mb-1">Personal Profile</h3>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Identification & Presence</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#3E2723]/40 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-[#3E2723] focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all"
                                                placeholder="Enter your name"
                                            />
                                        ) : (
                                            <div className="w-full bg-transparent pl-12 py-3.5 text-sm font-bold text-[#3E2723]">
                                                {formData.name || 'Not Provided'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#3E2723]/40 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        {isEditing ? (
                                            <div className="relative w-full">
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    disabled={!!profile?.phone}
                                                    className={`w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-[#3E2723] focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all ${profile?.phone ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                    placeholder="Mobile Number"
                                                    maxLength={10}
                                                />
                                                {profile?.phone && (
                                                    <Lock size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400/50" />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-full bg-transparent pl-12 py-3.5 text-sm font-bold text-[#3E2723]">
                                                {formData.phone || 'Not Provided'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#3E2723]/40 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input
                                        type="text"
                                        value={user?.email}
                                        disabled
                                        className="w-full bg-gray-100/50 border border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-gray-400 cursor-not-allowed"
                                    />
                                    <Lock size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Campus Context Group */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#3E2723]/5"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#FFF8E1] rounded-xl flex items-center justify-center">
                                <Building2 size={20} className="text-[#D4AF37]" />
                            </div>
                            <div>
                                <h3 className="font-black text-[#3E2723] leading-none mb-1">Campus Context</h3>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Localization & Access</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#3E2723]/40 uppercase tracking-[0.2em] ml-1">Hostel / Location</label>
                                <div className="relative group">
                                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.hostel}
                                            onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                                            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-[#3E2723] focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none transition-all"
                                            placeholder="e.g. Block A"
                                        />
                                    ) : (
                                        <div className="w-full bg-transparent pl-12 py-3.5 text-sm font-bold text-[#3E2723]">
                                            {formData.hostel || 'Not Provided'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#3E2723]/40 uppercase tracking-[0.2em] ml-1">Account Role</label>
                                <div className="relative group">
                                    <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input
                                        type="text"
                                        value={displayRole}
                                        disabled
                                        className="w-full bg-gray-100/50 border border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-gray-400 capitalize cursor-not-allowed"
                                    />
                                    <Lock size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
    
                    {/* Notification Settings Group */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#3E2723]/5"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#FFF8E1] rounded-xl flex items-center justify-center">
                                <Bell size={20} className="text-[#D4AF37]" />
                            </div>
                            <div>
                                <h3 className="font-black text-[#3E2723] leading-none mb-1">Notification Settings</h3>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Alerts & Browser Push</p>
                            </div>
                        </div>
    
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-[#3E2723]">Browser Push Notifications</p>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                                        {permission === 'granted' ? 'Enabled on this browser ✅' : 
                                         permission === 'denied' ? 'Blocked by browser ❌' : 
                                         'Not enabled yet 🔔'}
                                    </p>
                                </div>
                                {permission !== 'granted' ? (
                                    <button
                                        onClick={async () => {
                                            const result = await requestPermission();
                                            if (result === 'granted') {
                                                toast.success('Push notifications enabled!');
                                                sendNotification('Nescafe IITPKD 🎉', 'You will now receive alerts for your orders.');
                                            } else if (result === 'denied') {
                                                toast.error('Notifications blocked by browser. Please enable them in your browser settings.');
                                            }
                                        }}
                                        className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#3E2723] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <Bell size={14} />
                                        Enable
                                    </button>
                                ) : (
                                    <div className="bg-green-100 text-green-600 p-2 rounded-xl">
                                        <BadgeCheck size={20} />
                                    </div>
                                )}
                            </div>
    
                            {permission === 'denied' && (
                                <p className="text-[10px] text-red-400 font-medium italic px-2 leading-relaxed">
                                    * To receive alerts, you need to manually unblock notifications in your browser's site settings.
                                </p>
                            )}
                        </div>
                    </motion.div>

                    {/* Unified Actions Area */}
                    <div className="pt-8 pb-12 space-y-4">
                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.div
                                    key="edit-actions"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-3"
                                >
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="w-full bg-[#3E2723] text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-[#3E2723]/20 flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        {isSaving ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : <BadgeCheck size={20} className="text-[#D4AF37]" />}
                                        {isSaving ? 'Updating...' : 'Update Profile'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                name: profile?.name || '',
                                                hostel: profile?.hostel || '',
                                                phone: profile?.phone || ''
                                            });
                                        }}
                                        className="w-full bg-white border border-[#3E2723]/10 text-[#3E2723]/60 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                                    >
                                        Discard Changes
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="view-actions"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full flex items-center justify-center gap-3 p-5 rounded-[2rem] bg-white border border-[#3E2723]/10 shadow-xl shadow-[#3E2723]/5 hover:shadow-2xl hover:border-[#D4AF37] transition-all group active:scale-95"
                                    >
                                        <Pencil className="w-4 h-4 text-[#D4AF37] group-hover:rotate-12 transition-transform" />
                                        <span className="text-sm font-black text-[#3E2723] uppercase tracking-[0.15em]">Edit Profile</span>
                                    </button>

                                    {isAdmin && (
                                        <button
                                            onClick={() => navigate('/admin')}
                                            className="w-full flex items-center justify-center gap-3 p-5 rounded-[2rem] bg-[#D4AF37] text-[#3E2723] font-black text-sm uppercase tracking-[0.15em] shadow-lg shadow-[#D4AF37]/20 hover:bg-[#B8962E] transition-all active:scale-95 group"
                                        >
                                            <Shield size={20} className="group-hover:rotate-12 transition-transform" />
                                            Admin Dashboard
                                        </button>
                                    )}

                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center justify-center gap-3 p-5 rounded-[2rem] bg-red-50 text-red-600 font-black text-sm uppercase tracking-[0.15em] hover:bg-red-100 transition-all active:scale-95"
                                    >
                                        <LogOut size={20} /> Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            <footer className="text-center py-12 text-gray-300">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Built for IIT Palakkad Campus</p>
            </footer>
        </div >
    );
};

export default Dashboard;
