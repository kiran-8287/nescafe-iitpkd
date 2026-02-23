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
    CircleDashed
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
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'

    useEffect(() => {
        fetchOrders();
        fetchItems();

        // Real-time subscription for orders
        const ordersSubscription = supabase
            .channel('orders-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders();
            })
            .subscribe();

        // Real-time subscription for items
        const itemsSubscription = supabase
            .channel('items-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
                fetchItems();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ordersSubscription);
            supabase.removeChannel(itemsSubscription);
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
            if (activeTab === 'orders') setLoading(false);
        }
    };

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .order('category', { ascending: true })
                .order('name', { ascending: true });

            if (error) throw error;
            setMenuItems(data);
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('Failed to load menu items');
        } finally {
            if (activeTab === 'menu') setLoading(false);
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

    const toggleItemAvailability = async (itemId, currentStatus) => {
        // Optimistic UI update — flip the value instantly in local state
        setMenuItems(prev =>
            prev.map(item => item.id === itemId ? { ...item, is_available: !currentStatus } : item)
        );
        try {
            const { error } = await supabase
                .from('items')
                .update({ is_available: !currentStatus })
                .eq('id', itemId);

            if (error) throw error;
            toast.success(!currentStatus ? '✅ Item is now AVAILABLE on the menu' : '🚫 Item hidden from the menu');
        } catch (error) {
            // Revert optimistic update on failure
            setMenuItems(prev =>
                prev.map(item => item.id === itemId ? { ...item, is_available: currentStatus } : item)
            );
            console.error('Error toggling availability:', error);
            toast.error('Failed to update availability');
        }
    };


    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-24 md:pt-28 font-sans">
            <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#3E2723]">Nescafe Command Center</h1>
                    <div className="flex items-center gap-4 mt-1">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-gray-400 hover:text-[#3E2723]'}`}
                        >
                            Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('menu')}
                            className={`text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'menu' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-gray-400 hover:text-[#3E2723]'}`}
                        >
                            Menu Management
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {activeTab === 'orders' ? (
                        <>
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
                        </>
                    ) : (
                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                            {menuItems.length} Items listed
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                {activeTab === 'orders' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{order.users?.email}</p>
                                                    <p className="text-[10px] text-[#D4AF37] font-bold mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
                                                </div>
                                                <div className={`p-3 rounded-2xl ${order.order_mode === 'delivery' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                                                    {order.order_mode === 'delivery' ? <Bike size={24} /> : <ShoppingBag size={24} />}
                                                </div>
                                            </div>

                                            <div className="p-5 flex-1 space-y-4">
                                                <div className="space-y-2">
                                                    {order.order_items?.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-sm">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-[#3E2723]"><span className="text-[#D4AF37]">{item.quantity}x</span> {item.name}</span>
                                                                {item.variant && item.variant !== 'Standard' && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{item.variant}</span>}
                                                            </div>
                                                            <span className="text-sm font-black text-[#3E2723]">₹{item.price}</span>
                                                        </div>
                                                    ))}
                                                    <div className="pt-2 mt-2 border-t border-dashed border-gray-100 flex justify-between items-center">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                                                        <span className="text-lg font-black text-[#3E2723]">₹{order.total_amount}</span>
                                                    </div>
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
                                <p className="text-gray-400 font-medium">It's a bit too quiet here...</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading && menuItems.length === 0 ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white h-40 rounded-3xl animate-pulse shadow-sm" />
                            ))
                        ) : (
                            menuItems.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4 items-center">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest truncate">{item.category}</p>
                                            <div className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                                        </div>
                                        <h3 className="font-black text-[#3E2723] text-sm truncate mb-2">{item.name}</h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black text-[#3E2723]">₹{item.price}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${item.is_available ? 'text-green-600' : 'text-red-400'}`}>
                                                    {item.is_available ? 'ON' : 'OFF'}
                                                </span>
                                                <button
                                                    onClick={() => toggleItemAvailability(item.id, item.is_available)}
                                                    className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${item.is_available ? 'bg-green-500' : 'bg-gray-300'}`}
                                                >
                                                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${item.is_available ? 'left-6' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
