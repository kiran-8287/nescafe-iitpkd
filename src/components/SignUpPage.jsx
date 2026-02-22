import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Coffee, Mail, Lock, User, Building2, BookOpen, Loader2, CheckCircle } from 'lucide-react';

const ROLES = ['student', 'staff', 'professor'];

const SignUpPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', hostel: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const [resending, setResending] = useState(false);

    const handleResend = async () => {
        setResending(true);
        const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: form.email,
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

        const emailLower = form.email.toLowerCase();

        // Institutional email validation
        if (form.role === 'student' && !emailLower.endsWith('@smail.iitpkd.ac.in')) {
            setError('Students must use their @smail.iitpkd.ac.in email.');
            setLoading(false);
            return;
        }

        // Removed validation for staff and professors as per user request

        const { error: signUpError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: {
                    name: form.name,
                    role: form.role,
                    hostel: form.hostel,
                }
            }
        });

        setLoading(false);

        if (signUpError) {
            setError(signUpError.message);
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#FFF8E1] flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-sm w-full">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black text-[#3E2723] mb-2">Check Your Email!</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        We sent a confirmation link to <span className="font-bold text-[#3E2723]">{form.email}</span>.
                        Confirm it, then sign in.
                    </p>
                    <div className="space-y-3">
                        <Link
                            to="/login"
                            className="inline-block w-full bg-[#3E2723] text-white py-3.5 rounded-2xl font-bold text-center hover:bg-[#5D4037] transition-all shadow-md active:scale-95"
                        >
                            Go to Sign In
                        </Link>
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="w-full bg-white text-[#3E2723] border-2 border-[#3E2723] py-3.5 rounded-2xl font-bold text-center hover:bg-[#FFF8E1] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {resending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                            {resending ? 'Resending...' : 'Resend Email'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF8E1] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3E2723] rounded-2xl mb-4 shadow-lg">
                        <Coffee size={32} className="text-[#D4AF37]" />
                    </div>
                    <h1 className="text-3xl font-black text-[#3E2723]">Join the Brew</h1>
                    <p className="text-gray-500 text-sm mt-1">Create your Nescafe IITPKD account</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl p-7 space-y-5">
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
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Min. 6 characters"
                                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#D4AF37] outline-none text-sm font-medium transition-all"
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
                            <div className="relative">
                                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="text"
                                    name="hostel"
                                    value={form.hostel}
                                    onChange={handleChange}
                                    placeholder="e.g. Block A"
                                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#D4AF37] outline-none text-sm font-medium transition-all"
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
