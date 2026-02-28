import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, X, Bell, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderNotificationListener = () => {
    const { user } = useAuth();
    const [readyOrder, setReadyOrder] = useState(null);

    useEffect(() => {
        if (!user) return;

        console.log('Starting global order listener for user:', user.id);

        const checkOrderStatus = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'ready')
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error || !data) return;

                // If we found a ready order that we haven't shown yet
                if (data.status === 'ready' && (!readyOrder || readyOrder.id !== data.id)) {
                    setReadyOrder(data);
                    playNotificationSound();
                }
            } catch (e) {
                console.error('Order status poll failed:', e);
            }
        };

        const subscription = supabase
            .channel(`user-orders-${user.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                console.log('Order update received:', payload);
                if (payload.new.status === 'ready' && payload.old.status !== 'ready') {
                    setReadyOrder(payload.new);
                    playNotificationSound();
                }
            })
            .subscribe();

        // Polling fallback: Every 30 seconds
        const pollInterval = setInterval(checkOrderStatus, 30000);

        return () => {
            supabase.removeChannel(subscription);
            clearInterval(pollInterval);
        };
    }, [user, readyOrder]);

    const playNotificationSound = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
            audio.play().catch(e => console.log('Audio play blocked by browser:', e));
        } catch (err) {
            console.error('Audio playback failed:', err);
        }
    };

    return (
        <AnimatePresence>
            {readyOrder && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 50 }}
                    className="fixed bottom-24 right-6 left-6 md:left-auto md:right-8 md:w-96 z-[100]"
                >
                    <div className="bg-[#3E2723] text-white rounded-[32px] p-6 shadow-2xl border-4 border-[#D4AF37] relative overflow-hidden">
                        {/* Decorative background circle */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D4AF37] opacity-10 rounded-full" />

                        <button
                            onClick={() => setReadyOrder(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 bg-[#D4AF37] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg animate-bounce">
                                <Coffee size={24} className="text-[#3E2723]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-black text-[#D4AF37] uppercase tracking-wider mb-1">It's Ready! ☕</h3>
                                <p className="text-sm font-medium text-gray-200 leading-relaxed mb-4">
                                    Your order <span className="text-[#D4AF37] font-black">#{readyOrder.id.slice(0, 4)}</span> is freshly prepped and waiting at the counter.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setReadyOrder(null)}
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all"
                                    >
                                        Got it
                                    </button>
                                    <a
                                        href={`https://wa.me/91XXXXXXXXXX`} // Replace with Cafe's WhatsApp if needed
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#3E2723] px-3 rounded-xl flex items-center justify-center transition-all"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OrderNotificationListener;
