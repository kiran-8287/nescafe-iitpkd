import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    Clock,
    CheckCircle2,
    AlertCircle,
    Bike,
    Package,
    Search,
    RefreshCcw,
    ChefHat,
    ChevronRight,
    CircleDashed,
    Trash
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    pending: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
    preparing: { color: 'bg-blue-100 text-blue-700', icon: ChefHat, label: 'Preparing' },
    ready: { color: 'bg-purple-100 text-purple-700', icon: Package, label: 'Ready' },
    delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Cancelled' }
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchOrders();

        // Real-time subscription
        const subscription = supabase
            .channel('orders-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    users!orders_user_id_fkey (name, email),
                    order_items (*)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            toast.success(`Order marked as ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleSystemReset = async () => {
        if (!window.confirm("⚠️ DANGER: This will delete ALL user profiles, ALL orders, and ALL order items. You must still manually delete users from the Supabase Auth tab. Proceed?")) return;

        try {
            setLoading(true);

            // Delete in correct order to satisfy foreign keys
            const { error: itemsError } = await supabase.from('order_items').delete().neq('id', '00000000-0000-4000-a000-000000000000');
            if (itemsError) throw itemsError;

            const { error: ordersError } = await supabase.from('orders').delete().neq('id', '00000000-0000-4000-a000-000000000000');
            if (ordersError) throw ordersError;

            const { error: usersError } = await supabase.from('users').delete().neq('id', '00000000-0000-4000-a000-000000000000');
            if (usersError) throw usersError;

            toast.success('System Reset Complete!');
            fetchOrders();
        } catch (error) {
            console.error('Reset error:', error);
            toast.error('Failed to reset system');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#3E2723]">Nescafe Command Center</h1>
                    <p className="text-gray-500 font-medium">Manage incoming orders and live status.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSystemReset}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-100 transition-all border border-red-100"
                    >
                        <Trash size={14} /> System Reset
                    </button>
                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                        {['all', 'preparing', 'ready', 'delivered'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${filterStatus === status ? 'bg-[#3E2723] text-white' : 'text-gray-400 hover:text-[#3E2723]'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white h-64 rounded-3xl animate-pulse shadow-sm" />
                    ))
                ) : filteredOrders.length > 0 ? (
                    <AnimatePresence>
                        {filteredOrders.map((order) => {
                            const StatusIcon = STATUS_CONFIG[order.status]?.icon || CircleDashed;
                            return (
                                <motion.div
                                    key={order.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                                >
                                    <div className="p-5 border-b border-gray-50 flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-black text-gray-300 font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_CONFIG[order.status]?.color}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-[#3E2723] text-lg">{order.users?.name || 'Anonymous'}</h3>
                                            <p className="text-xs text-gray-400 font-medium">{new Date(order.created_at).toLocaleTimeString()}</p>
                                        </div>
                                        <div className={`p-3 rounded-2xl ${order.order_mode === 'delivery' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                                            {order.order_mode === 'delivery' ? <Bike size={24} /> : <ShoppingBag size={24} />}
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 space-y-4">
                                        <div className="space-y-2">
                                            {order.order_items?.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-[#3E2723]"><span className="text-[#D4AF37]">{item.quantity}x</span> {item.name}</span>
                                                    <span className="text-xs text-gray-400 font-medium">{item.variant}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {order.order_mode === 'delivery' && (
                                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Delivery Address</p>
                                                <p className="text-xs font-bold text-[#3E2723]">{order.hostel_block}, Room {order.room_number}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-gray-50 flex gap-2">
                                        {order.status === 'preparing' && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                                className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-purple-700 transition-all shadow-md active:scale-95"
                                            >
                                                Mark Ready <Package size={16} />
                                            </button>
                                        )}
                                        {order.status === 'ready' && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                className="flex-1 bg-green-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-md active:scale-95"
                                            >
                                                Complete <CheckCircle2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                ) : (
                    <div className="col-span-full py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 text-center">
                        <ShoppingBag size={48} className="text-gray-100 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-[#3E2723]">No orders found</h2>
                        <p className="text-gray-400 font-medium">It's a bit too quiet here... did the internet die?</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
