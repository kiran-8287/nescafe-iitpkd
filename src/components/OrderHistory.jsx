import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    ChevronDown,
    ChevronUp,
    Clock,
    CheckCircle2,
    Package,
    AlertCircle,
    ArrowLeft,
    RotateCcw,
    Receipt,
    Calendar,
    ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    pending: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
    preparing: { color: 'bg-blue-100 text-blue-700', icon: Package, label: 'Preparing' },
    ready: { color: 'bg-purple-100 text-purple-700', icon: Package, label: 'Ready' },
    delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Cancelled' }
};

const OrderHistory = () => {
    const { user } = useAuth();
    const { addItem, toggleCart } = useCart();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, ongoing, completed
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (*)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error("Couldn't fetch your history. Like our internet.");
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = (order) => {
        if (!order.order_items || order.order_items.length === 0) return;

        order.order_items.forEach(item => {
            addItem({
                id: item.item_id,
                name: item.name,
                price: item.price,
                selectedVariant: item.variant,
                customization: item.customization || [],
                quantity: item.quantity
            });
        });

        toast.success("Past favorites added to cart!");
        toggleCart();
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'ongoing') {
            return ['pending', 'preparing', 'ready'].includes(order.status);
        }
        if (filter === 'completed') {
            return ['delivered', 'cancelled'].includes(order.status);
        }
        return true;
    });

    const formatDate = (dateString) => {
        const options = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-4 border-[#3E2723] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#3E2723] font-black uppercase tracking-widest text-xs">Reliving memories...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Header */}
            <div className="bg-white px-6 pt-12 pb-6 shadow-sm sticky top-0 z-30 border-b border-gray-100">
                <div className="max-w-2xl mx-auto flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-[#3E2723]" />
                    </button>
                    <h1 className="text-2xl font-black text-[#3E2723]">Your Brew History</h1>
                </div>

                {/* Filter Tabs */}
                <div className="max-w-2xl mx-auto flex gap-2 p-1 bg-gray-100 rounded-2xl">
                    {['all', 'ongoing', 'completed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filter === tab
                                    ? 'bg-white text-[#3E2723] shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-4 mt-4 space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                        const isExpanded = expandedOrder === order.id;
                        const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock;

                        return (
                            <motion.div
                                layout
                                key={order.id}
                                className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden"
                            >
                                {/* Main Card Content */}
                                <div className="p-5 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-2xl ${STATUS_CONFIG[order.status]?.color} bg-opacity-10`}>
                                                <StatusIcon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-[#3E2723]">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    <Calendar size={12} /> {formatDate(order.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-[#3E2723]">₹{order.total_amount}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${STATUS_CONFIG[order.status]?.color}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                            className="flex-1 py-3 px-4 bg-gray-50 text-[#3E2723] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all border border-gray-100"
                                        >
                                            {isExpanded ? 'Hide Details' : 'View Details'}
                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                        <button
                                            onClick={() => handleReorder(order)}
                                            className="py-3 px-6 bg-[#3E2723] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#5D4037] transition-all shadow-md active:scale-95"
                                        >
                                            Reorder <RotateCcw size={14} />
                                        </button>
                                    </div>

                                    {/* Expandable Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-4 mt-4 border-t border-dashed border-gray-100 space-y-3">
                                                    {order.order_items?.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-sm">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-[#3E2723]">{item.quantity}x {item.name}</span>
                                                                <span className="text-[10px] text-gray-400 font-medium">{item.variant}</span>
                                                            </div>
                                                            <span className="font-bold text-gray-500">₹{item.price * item.quantity}</span>
                                                        </div>
                                                    ))}
                                                    <div className="pt-2 flex justify-between items-center border-t border-gray-50">
                                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Total Bill</span>
                                                        <span className="font-black text-[#D4AF37]">₹{order.total_amount}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 px-6"
                    >
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={40} className="text-gray-200" />
                        </div>
                        <h3 className="text-xl font-black text-[#3E2723] mb-2">No history yet?</h3>
                        <p className="text-gray-400 text-sm font-medium mb-8">
                            Your coffee stories start here. Go ahead, order your first brew!
                        </p>
                        <button
                            onClick={() => navigate('/menu')}
                            className="bg-[#3E2723] text-white py-4 px-8 rounded-2xl font-black shadow-lg hover:bg-[#5D4037] transition-all flex items-center justify-center gap-2 mx-auto active:scale-95"
                        >
                            Explore Menu <ArrowRight size={20} />
                        </button>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default OrderHistory;
