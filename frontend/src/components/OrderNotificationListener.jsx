import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, X, Bell, CheckCircle2 } from 'lucide-react';
import usePushNotifications from '../hooks/usePushNotifications';

const OrderNotificationListener = () => {
    const { user } = useAuth();
    const [readyOrder, setReadyOrder] = useState(null);
    const [deliveredOrder, setDeliveredOrder] = useState(null);
    const { permission, requestPermission, sendNotification } = usePushNotifications();

    // Keep a ref of shown order IDs so we don't re-show on re-renders
    const shownReadyIds = useRef(new Set());
    const shownDeliveredIds = useRef(new Set());

    useEffect(() => {
        if (!user) return;

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

                if (!shownReadyIds.current.has(data.id)) {
                    shownReadyIds.current.add(data.id);
                    setReadyOrder(data);
                    playNotificationSound();
                    sendNotification(
                        '☕ Your order is ready!',
                        `Order #${data.id.slice(0, 4)} is freshly prepped and waiting at the counter.`,
                        '/favicon.ico',
                        `order-ready-${data.id}`
                    );
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
                const { new: newOrder, old: oldOrder } = payload;

                // Order became READY
                if (newOrder.status === 'ready' && oldOrder.status !== 'ready') {
                    if (!shownReadyIds.current.has(newOrder.id)) {
                        shownReadyIds.current.add(newOrder.id);
                        setReadyOrder(newOrder);
                        setDeliveredOrder(null); // clear any prior delivered banner
                        playNotificationSound();
                        sendNotification(
                            '☕ Your order is ready!',
                            `Order #${newOrder.id.slice(0, 4)} is freshly prepped and waiting at the counter.`,
                            '/favicon.ico',
                            `order-ready-${newOrder.id}`
                        );
                    }
                }

                // Order DELIVERED
                if (newOrder.status === 'delivered' && oldOrder.status !== 'delivered') {
                    if (!shownDeliveredIds.current.has(newOrder.id)) {
                        shownDeliveredIds.current.add(newOrder.id);
                        setReadyOrder(null); // dismiss the "ready" banner if still showing
                        setDeliveredOrder(newOrder);
                        playNotificationSound();
                        sendNotification(
                            '✅ Order Delivered!',
                            `Order #${newOrder.id.slice(0, 4)} has been delivered. Enjoy your coffee! ☕`,
                            '/favicon.ico',
                            `order-delivered-${newOrder.id}`
                        );
                        // Auto-dismiss delivered banner after 8 seconds
                        setTimeout(() => setDeliveredOrder(null), 8000);
                    }
                }
            })
            .subscribe();

        // Polling fallback: Every 30 seconds
        const pollInterval = setInterval(checkOrderStatus, 30000);

        return () => {
            supabase.removeChannel(subscription);
            clearInterval(pollInterval);
        };
    }, [user, sendNotification]);

    const playNotificationSound = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
            audio.play().catch(e => console.log('Audio play blocked by browser:', e));
        } catch (err) {
            console.error('Audio playback failed:', err);
        }
    };

    return (
        <>
            {/* Permission Request Banner — shown until user grants/denies */}
            <AnimatePresence>
                {user && permission === 'default' && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 left-0 right-0 z-[100] px-4"
                    >
                        <div className="max-w-md mx-auto bg-[#3E2723] text-white rounded-2xl px-5 py-3 shadow-xl border border-[#D4AF37]/30 flex items-center gap-3">
                            <Bell size={18} className="text-[#D4AF37] flex-shrink-0" />
                            <p className="text-xs font-semibold flex-1 leading-tight">
                                Get notified when your order is ready or delivered
                            </p>
                            <button
                                onClick={async () => {
                                    const result = await requestPermission();
                                    if (result === 'granted') {
                                        setTimeout(() => {
                                            sendNotification('Nescafe IITPKD 🎉', 'Order alerts enabled! We\'ll notify you when your order is ready.');
                                        }, 500);
                                    }
                                }}
                                className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#3E2723] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
                            >
                                Enable Alerts
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Order Ready Banner */}
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
                                    <button
                                        onClick={() => setReadyOrder(null)}
                                        className="w-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all"
                                    >
                                        Got it 👍
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Order Delivered Banner */}
            <AnimatePresence>
                {deliveredOrder && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed bottom-24 right-6 left-6 md:left-auto md:right-8 md:w-96 z-[100]"
                    >
                        <div className="bg-gradient-to-br from-green-800 to-green-900 text-white rounded-[32px] p-6 shadow-2xl border-4 border-green-400 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-400 opacity-10 rounded-full" />

                            <button
                                onClick={() => setDeliveredOrder(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 bg-green-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <CheckCircle2 size={24} className="text-green-900" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-green-300 uppercase tracking-wider mb-1">Delivered! ✅</h3>
                                    <p className="text-sm font-medium text-gray-200 leading-relaxed mb-4">
                                        Your order <span className="text-green-300 font-black">#{deliveredOrder.id.slice(0, 4)}</span> has been successfully delivered. Enjoy your coffee! ☕
                                    </p>
                                    <button
                                        onClick={() => setDeliveredOrder(null)}
                                        className="w-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all"
                                    >
                                        Thank you! 🎉
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default OrderNotificationListener;
