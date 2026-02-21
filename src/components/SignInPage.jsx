import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Coffee, Mail, Lock, Loader2 } from 'lucide-react';

const SignInPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (user) navigate('/dashboard', { replace: true });
    }, [user, navigate]);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
        });

        setLoading(false);

        if (signInError) {
            if (signInError.message.includes('Email not confirmed')) {
                setError('Please check your inbox and confirm your email first.');
            } else if (signInError.message.includes('Invalid login credentials')) {
                setError('Wrong email or password. Try again.');
            } else {
                setError(signInError.message);
            }
        }
        // On success, auth state change listener will redirect via useEffect
    };

    return (
        <div className="min-h-screen bg-[#FFF8E1] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3E2723] rounded-2xl mb-4 shadow-lg">
                        <Coffee size={32} className="text-[#D4AF37]" />
                    </div>
                    <h1 className="text-3xl font-black text-[#3E2723]">Welcome Back</h1>
                    <p className="text-gray-500 text-sm mt-1">Sign in to your Nescafe IITPKD account</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl p-7 space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium p-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                    placeholder="you@iitpkd.ac.in"
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
                                    placeholder="Your password"
                                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#D4AF37] outline-none text-sm font-medium transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#3E2723] text-white py-4 rounded-2xl font-black text-base hover:bg-[#5D4037] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <><Loader2 size={20} className="animate-spin" /> Signing in...</>
                            ) : (
                                'Sign In ☕'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-400">
                        No account yet?{' '}
                        <Link to="/signup" className="font-bold text-[#3E2723] hover:text-[#D4AF37] transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
