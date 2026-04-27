import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Coffee, Mail, Lock, User, Building2, BookOpen, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['student', 'staff', 'professor'];

const SignUpPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student', hostel: '', phone: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resending, setResending] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(true); // Always verified now

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleResend = async () => {
        setResending(true);
        const isProd = window.location.hostname !== 'localhost' && !window.location.hostname.includes('192.168');
        const REDIRECT_URL = isProd
            ? 'https://nescafeiitpkd.vercel.app/login'
            : `${window.location.origin}/login`;

        const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: form.email,
            options: {
                emailRedirectTo: REDIRECT_URL
            }
        });
        setResending(false);
        if (resendError) {
            toast.error(resendError.message);
        } else {
            toast.success('Confirmation link sent! Check your inbox (or spam).');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Phone validation (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(form.phone)) {
            setError('Please enter a valid 10-digit phone number.');
            setLoading(false);
            return;
        }



        const emailLower = form.email.toLowerCase();

        // Institutional email validation
        if (form.role === 'student' && !emailLower.endsWith('@smail.iitpkd.ac.in')) {
            setError('Students must use their @smail.iitpkd.ac.in email.');
            setLoading(false);
            return;
        }

        // Removed validation for staff and professors as per user request

        try {
            // console.log('Attempting sign up for:', form.email); // Debug only
            // Automatically resolve redirect URL based on environment
            const isProd = window.location.hostname !== 'localhost' && !window.location.hostname.includes('192.168');
            const REDIRECT_URL = isProd
                ? 'https://nescafeiitpkd.vercel.app/verify'
                : `${window.location.origin}/verify`;

            const { data, error: signUpError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    emailRedirectTo: REDIRECT_URL,
                    data: {
                        name: form.name,
                        role: form.role,
                        hostel: form.hostel,
                        phone: form.phone,
                        phone_verified: true
                    }
                }
            });

            setLoading(false);

            if (signUpError) {
                console.error('Supabase Sign Up Error:', signUpError);
                setError(signUpError.message);
            } else {
                // console.log('Sign Up Success:', data); // Debug only
                setSuccess(true);
            }
        } catch (err) {
            setLoading(false);
            console.error('Caught Exception during Sign Up:', err);
            setError(err.message || 'An unexpected error occurred. Please check your connection.');
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#FFF8E1] flex items-center justify-center p-4 sm:p-6 transition-all duration-500">
                <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 text-center max-w-sm sm:max-w-md w-full border border-[#3E2723]/5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                        <CheckCircle size={32} className="text-green-500 sm:w-10 sm:h-10" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#3E2723] mb-2 tracking-tight">Check Your Email!</h2>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6 px-2">
                        We sent a confirmation link to <span className="font-bold text-[#3E2723] break-all">{form.email}</span>.
                        Confirm it, then sign in.
                    </p>
                    <div className="space-y-3 sm:pt-2">
                        <Link
                            to="/login"
                            className="inline-block w-full bg-[#3E2723] text-white py-3.5 sm:py-4 rounded-2xl font-bold text-center hover:bg-[#5D4037] transition-all shadow-md active:scale-95 text-sm sm:text-base"
                        >
                            Go to Sign In
                        </Link>
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="w-full bg-white text-[#3E2723] border-2 border-[#3E2723] py-3.5 sm:py-4 rounded-2xl font-bold text-center hover:bg-[#FFF8E1] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm"
                        >
                            {resending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={18} />}
                            {resending ? 'Resending...' : 'Resend Email'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF8E1] flex items-center justify-center p-4 sm:p-6 transition-all duration-500">
            <div className="w-full max-w-sm sm:max-w-md">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#3E2723] rounded-2xl mb-4 shadow-lg hover:rotate-3 transition-transform duration-300">
                        <Coffee size={28} className="text-[#D4AF37] sm:w-8 sm:h-8" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#3E2723] tracking-tight">Join the Brew</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1 px-4">Create your Nescafe IITPKD account</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-7 space-y-4 sm:space-y-5 border border-[#3E2723]/5">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium p-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-1.5">Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your full name"
                                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#D4AF37] outline-none text-sm font-medium transition-all"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-1.5">Phone Number</label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 flex items-center gap-1">
                                    <span className="text-xs font-bold text-[#3E2723]/40">+91</span>
                                    <div className="w-px h-4 bg-gray-200 ml-1" />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                    maxLength={10}
                                    placeholder="10-digit number"
                                    className="w-full pl-16 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#D4AF37] outline-none text-sm font-medium transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-1.5">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder={form.role === 'student' ? 'you@smail.iitpkd.ac.in' : 'you@example.com'}
                                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#D4AF37] outline-none text-sm font-medium transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Min. 6 characters"
                                    className="w-full pl-10 pr-12 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#D4AF37] outline-none text-sm font-medium transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="Retype your password"
                                    className="w-full pl-10 pr-12 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#D4AF37] outline-none text-sm font-medium transition-all"
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-1.5">Role</label>
                            <div className="relative">
                                <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#D4AF37] outline-none text-sm font-medium transition-all appearance-none bg-white font-bold"
                                >
                                    {ROLES.map(r => (
                                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Hostel */}
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-1.5">Hostel / Block <span className="text-gray-300 normal-case font-medium">(optional)</span></label>
                            <div className="relative group">
                                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#D4AF37] transition-colors" />
                                <input
                                    type="text"
                                    name="hostel"
                                    value={form.hostel}
                                    onChange={handleChange}
                                    placeholder="e.g. Block A"
                                    className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#D4AF37] outline-none text-sm font-medium transition-all focus:bg-white bg-gray-50/30"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#3E2723] text-white py-4 rounded-2xl font-black text-base hover:bg-[#5D4037] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-90 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <><Loader2 size={20} className="animate-spin" /> Creating account...</>
                            ) : (
                                'Create Account ☕'
                            )}
                        </button>
                    </form>

                    <p className="text-[10px] sm:text-xs text-gray-400 text-center px-2">
                        By creating an account, you agree to our{' '}
                        <Link to="/terms" className="text-[#3E2723] font-bold hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-[#3E2723] font-bold hover:underline">Privacy Policy</Link>.
                    </p>

                    <p className="text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-[#3E2723] hover:text-[#D4AF37] transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
