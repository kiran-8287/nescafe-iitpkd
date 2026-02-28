import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verify = async () => {
            const token_hash = searchParams.get('token_hash');
            const type = searchParams.get('type') || 'signup';

            if (!token_hash) {
                setStatus('error');
                setMessage('Invalid verification link. Token is missing.');
                return;
            }

            try {
                const { error } = await supabase.auth.verifyOtp({
                    token_hash,
                    type,
                });

                if (error) throw error;

                setStatus('success');
                setMessage('Email verified successfully! Redirecting to login...');
                toast.success('Email verified!');

                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (err) {
                console.error('Verification error:', err);
                setStatus('error');
                setMessage(err.message || 'Verification failed. The link might be expired.');
                toast.error('Verification failed');
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-[#FFF8E1] flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-white/50">
                <div className="mb-6 flex justify-center">
                    {status === 'verifying' && (
                        <div className="bg-[#FFF8E1] p-4 rounded-full">
                            <Loader2 className="w-12 h-12 text-[#3E2723] animate-spin" />
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="bg-green-50 p-4 rounded-full">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="bg-red-50 p-4 rounded-full">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-black text-[#3E2723] mb-3">
                    {status === 'verifying' && 'Just a moment...'}
                    {status === 'success' && 'You\'re all set!'}
                    {status === 'error' && 'Verification failed'}
                </h1>

                <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                    {message}
                </p>

                {status === 'error' && (
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-4 bg-[#3E2723] text-white rounded-2xl font-black shadow-lg hover:bg-[#5D4037] transition-all active:scale-95"
                    >
                        Back to Login
                    </button>
                )}

                <div className="mt-8 pt-6 border-t border-gray-50">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        Nescafe Official • IIT Palakkad
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
