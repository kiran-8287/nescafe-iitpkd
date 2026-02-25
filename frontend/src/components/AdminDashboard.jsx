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
    TrendingUp,
    Users,
    Activity,
    BarChart3,
    Bell,
    BellOff,
    ExternalLink,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    pending: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
    preparing: { color: 'bg-blue-100 text-blue-700', icon: ChefHat, label: 'Preparing' },
    ready: { color: 'bg-purple-100 text-purple-700', icon: Package, label: 'Ready' },
    delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Cancelled' }
};

const STATS_CARDS = [
    { key: 'total', label: 'Total Orders', icon: ShoppingBag, color: 'text-gray-600', bg: 'bg-gray-100' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, color: 'text-blue-600', bg: 'bg-blue-50' },
    { key: 'ready', label: 'Ready', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' }
];

const AdminDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'menu', or 'analytics'
    const [menuSearchTerm, setMenuSearchTerm] = useState('');
    const [timeRange, setTimeRange] = useState('today'); // '6h', 'today', '7d', '30d', 'all'
    const [orderSearchQuery, setOrderSearchQuery] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [analytics, setAnalytics] = useState({
        revenue: null,
        topItems: [],
        peakHours: []
    });
    const [orderViewMode, setOrderViewMode] = useState('individual'); // 'individual' or 'batches'
    const [rpcErrors, setRpcErrors] = useState(null);

    const groupedDeliveryBatches = orders.reduce((acc, order) => {
        if (order.order_mode === 'delivery' && order.status !== 'delivered' && order.status !== 'cancelled') {
            const block = order.hostel_block || 'Unknown';
            if (!acc[block]) acc[block] = { orders: [], totalAmount: 0 };
            acc[block].orders.push(order);
            acc[block].totalAmount += order.total_amount;
        }
        return acc;
    }, {});

    useEffect(() => {
        // Check for notification permission on mount
        if ('Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
        }

        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'menu') fetchItems();
        if (activeTab === 'analytics') fetchAnalytics();

        // Real-time subscription for orders
        const ordersSubscription = supabase
            .channel('orders-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                console.log('Real-time order change detected:', payload);

                // Trigger browser notification for NEW orders
                if (payload.eventType === 'INSERT' && notificationsEnabled) {
                    new Notification('☕ New Order Received!', {
                        body: `Order #${payload.new.id.slice(0, 4)} from ${payload.new.hostel_block || 'Pickup'}`,
                        icon: '/favicon.ico'
                    });
                }

                // Only re-fetch if we are in "today" or "6h" mode to keep live updates fresh
                if (timeRange === 'today' || timeRange === '6h') {
                    fetchOrders();
                }
                if (activeTab === 'analytics') fetchAnalytics();
            })
            .subscribe((status) => {
                console.log('Orders subscription status:', status);
            });

        // Real-time subscription for items
        const itemsSubscription = supabase
            .channel('items-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, (payload) => {
                console.log('Real-time item change detected:', payload);
                fetchItems();
            })
            .subscribe((status) => {
                console.log('Items subscription status:', status);
            });

        return () => {
            supabase.removeChannel(ordersSubscription);
            supabase.removeChannel(itemsSubscription);
        };
    }, [timeRange, activeTab]); // Refresh when time range or tab changes

    // Live search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'orders') fetchOrders();
        }, 400);
        return () => clearTimeout(timer);
    }, [orderSearchQuery]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('orders')
                .select(`
                    *,
                    users!orders_user_id_fkey (name, email),
                    order_items (*)
                `)
                .order('created_at', { ascending: false });

            // If searching, we fetch a broader set of recent orders to allow client-side filtering 
            // across names, IDs, and hostels without server-side type errors or join complexity.
            if (activeTab === 'orders' && orderSearchQuery) {
                // Fetch last 100 orders globally for the search to work across states/time
                query = supabase
                    .from('orders')
                    .select('*, users!orders_user_id_fkey (name, email), order_items (*)')
                    .order('created_at', { ascending: false })
                    .limit(100);
            } else {
                // Apply time range filter
                const now = new Date();
                let filterDate = new Date();

                if (timeRange === '6h') filterDate.setHours(now.getHours() - 6);
                else if (timeRange === 'today') filterDate.setHours(0, 0, 0, 0);
                else if (timeRange === '7d') filterDate.setDate(now.getDate() - 7);
                else if (timeRange === '30d') filterDate.setDate(now.getDate() - 30);

                if (timeRange !== 'all') {
                    query = query.gte('created_at', filterDate.toISOString());
                }
            }

            const { data, error } = await query;
            if (error) throw error;

            // Client-side filtering for Name and Email (unsupported joined or-filter)
            let finalData = data;
            if (orderSearchQuery) {
                const q = orderSearchQuery.toLowerCase();
                finalData = data.filter(order =>
                    order.id.toLowerCase().includes(q) ||
                    (order.hostel_block && order.hostel_block.toLowerCase().includes(q)) ||
                    (order.users?.name && order.users.name.toLowerCase().includes(q)) ||
                    (order.users?.email && order.users.email.toLowerCase().includes(q))
                );
            }

            setOrders(finalData || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            // If the OR filter failed (common with UUIDs if query is too short), 
            // fallback to a broader search or no search
            if (orderSearchQuery) {
                try {
                    const { data: retryData } = await supabase
                        .from('orders')
                        .select('*, users!orders_user_id_fkey (name, email), order_items (*)')
                        .or(`hostel_block.ilike.%${orderSearchQuery}%`)
                        .order('created_at', { ascending: false })
                        .limit(50);
                    setOrders(retryData || []);
                    return;
                } catch (e) {
                    console.error('Retry failed:', e);
                }
            }
            toast.error('Search results could not be loaded');
        } finally {
            setLoading(false);
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

    const fetchAnalytics = async () => {
        setLoading(true);
        setRpcErrors(null);
        console.log('Fetching Business Intelligence data via RPC...');
        try {
            const [revRes, topRes, peakRes] = await Promise.all([
                supabase.rpc('get_revenue_stats'),
                supabase.rpc('get_top_items'),
                supabase.rpc('get_peak_hours')
            ]);

            const errors = [];
            if (revRes.error) errors.push(`Revenue: ${revRes.error.message}`);
            if (topRes.error) errors.push(`Top Items: ${topRes.error.message}`);
            if (peakRes.error) errors.push(`Heatmap: ${peakRes.error.message}`);

            if (errors.length > 0) {
                setRpcErrors(errors);
                console.error('Analytics RPC Errors:', errors);
            }

            console.log('Final Analytics Payload for State:', {
                revenue: revRes.data,
                top: topRes.data,
                peak: peakRes.data
            });

            setAnalytics({
                revenue: revRes.data || { today: 0, yesterday: 0, week: 0 },
                topItems: topRes.data || [],
                peakHours: peakRes.data || []
            });
        } catch (error) {
            console.error('Unexpected error in fetchAnalytics:', error);
            setRpcErrors([error.message]);
        } finally {
            setLoading(false);
        }
    };

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            toast.error('This browser does not support notifications.');
            return;
        }
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            setNotificationsEnabled(true);
            toast.success('Alerts enabled! You will notified of new orders.');
            new Notification('Nescafe IITPKD', { body: 'Notifications enabled successfully!' });
        } else {
            setNotificationsEnabled(false);
            toast.error('Notification permission denied.');
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        // Optimistic UI Update: Update the local state immediately
        const oldOrders = [...orders];
        setOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            toast.success(`Order marked as ${newStatus}`);

            // Refresh analytics to reflect the change (especially if marked Delivered/Cancelled)
            fetchAnalytics();

            // WhatsApp Trigger for 'Ready' status
            if (newStatus === 'ready') {
                const order = orders.find(o => o.id === orderId);
                if (order) {
                    const studentName = order.users?.name || 'Customer';
                    const message = `Hey ${studentName}! ☕ Your Nescafe order (#${orderId.slice(0, 4)}) is READY for collection. Please come pick it up!`;
                    navigator.clipboard.writeText(message);
                    toast('WhatsApp message copied to clipboard!', { icon: '💬' });
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
            // Revert on error by restoring old orders
            setOrders(oldOrders);
        }
    };

    const updateBatchStatus = async (hostelBlock, newStatus) => {
        const batchOrders = orders.filter(o =>
            o.hostel_block === hostelBlock &&
            o.order_mode === 'delivery' &&
            o.status !== 'delivered' &&
            o.status !== 'cancelled'
        );

        if (batchOrders.length === 0) return;

        const orderIds = batchOrders.map(o => o.id);
        const oldOrders = [...orders];

        // Optimistic Update
        setOrders(prev => prev.map(o =>
            orderIds.includes(o.id) ? { ...o, status: newStatus } : o
        ));

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .in('id', orderIds);

            if (error) throw error;
            toast.success(`Batch for ${hostelBlock} marked as ${newStatus}`);
            fetchAnalytics();
        } catch (error) {
            console.error('Error updating batch status:', error);
            toast.error('Failed to update batch');
            setOrders(oldOrders);
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


    const filteredOrders = orderSearchQuery
        ? orders // Show all search results regardless of status tab
        : (filterStatus === 'all'
            ? orders
            : orders.filter(o => o.status === filterStatus));

    const getStats = () => {
        return {
            total: orders.length,
            preparing: orders.filter(o => o.status === 'preparing').length,
            ready: orders.filter(o => o.status === 'ready').length
        };
    };

    const stats = getStats();

    const groupedMenuItems = menuItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        if (item.name.toLowerCase().includes(menuSearchTerm.toLowerCase())) {
            acc[item.category].push(item);
        }
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-24 md:pt-28 font-sans">
            <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#3E2723]">Nescafe Command Center</h1>
                    <div className="flex items-center gap-1.5 md:gap-4 overflow-x-auto py-1 scrollbar-hide">
                        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 gap-1 flex-shrink-0">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`px-3 md:px-6 py-2 rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-[#3E2723] text-white shadow-md' : 'text-gray-400 hover:text-[#3E2723]'}`}
                            >
                                Orders List
                            </button>
                            <button
                                onClick={() => setActiveTab('menu')}
                                className={`px-3 md:px-6 py-2 rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'menu' ? 'bg-[#3E2723] text-white shadow-md' : 'text-gray-400 hover:text-[#3E2723]'}`}
                            >
                                Menu Items
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`px-3 md:px-6 py-2 rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-[#3E2723] text-white shadow-md' : 'text-gray-400 hover:text-[#3E2723]'}`}
                            >
                                Analytics
                            </button>
                        </div>

                        <button
                            onClick={requestNotificationPermission}
                            className={`p-2.5 rounded-2xl border flex items-center justify-center transition-all ${notificationsEnabled ? 'border-green-100 bg-green-50 text-green-600' : 'border-gray-100 bg-white text-gray-400 hover:text-[#3E2723]'} shadow-sm flex-shrink-0`}
                            title={notificationsEnabled ? 'Notifications Enabled' : 'Enable New Order Alerts'}
                        >
                            {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    {activeTab === 'orders' ? (
                        <>
                            {/* Search Bar */}
                            <div className="flex items-center gap-1 group">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search ID, Name, Hostel..."
                                        value={orderSearchQuery}
                                        onChange={(e) => {
                                            setOrderSearchQuery(e.target.value);
                                            // Auto-fetch if cleared
                                            if (e.target.value === '') fetchOrders();
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
                                        className="pl-9 pr-10 py-2.5 w-full md:w-64 rounded-xl border border-gray-100 shadow-sm text-xs font-bold text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all placeholder:text-gray-300"
                                    />
                                    {orderSearchQuery && (
                                        <button
                                            onClick={() => { setOrderSearchQuery(''); fetchOrders(); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={fetchOrders}
                                    title="Search Orders"
                                    className="p-2.5 bg-[#D4AF37] text-[#3E2723] rounded-xl hover:bg-[#B8962E] transition-all shadow-sm active:scale-95 flex items-center justify-center"
                                >
                                    <Search size={14} className="font-bold" />
                                </button>
                            </div>

                            {/* Time Filter */}
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="bg-white px-3 py-2 rounded-xl text-xs font-bold text-[#3E2723] border border-gray-100 shadow-sm outline-none cursor-pointer hover:border-[#D4AF37] transition-all"
                            >
                                <option value="6h">Last 6 Hours</option>
                                <option value="today">Today</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="all">All Time</option>
                            </select>

                            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto gap-1">
                                {['all', 'preparing', 'ready', 'delivered'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filterStatus === status ? 'bg-[#3E2723] text-white shadow-md' : 'text-gray-400 hover:text-[#3E2723]'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            {/* Batch View Toggle */}
                            <div className="flex bg-gray-100 p-1 rounded-2xl shadow-inner gap-1">
                                <button
                                    onClick={() => setOrderViewMode('individual')}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderViewMode === 'individual' ? 'bg-white text-[#3E2723] shadow-sm' : 'text-gray-400'}`}
                                >
                                    Individuals
                                </button>
                                <button
                                    onClick={() => setOrderViewMode('batches')}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderViewMode === 'batches' ? 'bg-white text-[#3E2723] shadow-sm' : 'text-gray-400'}`}
                                >
                                    Batches
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search menu..."
                                value={menuSearchTerm}
                                onChange={(e) => setMenuSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-xl border border-gray-100 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                            />
                        </div>
                    )}
                </div>
            </header>

            {/* Stats Overview Bar */}
            {activeTab === 'orders' && (
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {STATS_CARDS.map((card) => (
                        <div key={card.key} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                                <card.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
                                <p className="text-xl font-black text-[#3E2723]">{stats[card.key]}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <main className="max-w-6xl mx-auto">
                {activeTab === 'orders' ? (
                    orderViewMode === 'batches' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(groupedDeliveryBatches).length > 0 ? (
                                Object.entries(groupedDeliveryBatches).map(([block, data]) => (
                                    <motion.div
                                        key={block}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow p-6"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-black text-[#3E2723]">{block}</h3>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{data.orders.length} ACTIVE DELIVERIES</p>
                                            </div>
                                            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
                                                <Bike size={24} />
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-3 mb-6">
                                            {data.orders.map(order => (
                                                <div key={order.id} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                                    <div>
                                                        <span className="font-mono text-[10px] text-gray-300 block">#{order.id.slice(0, 4)}</span>
                                                        <span className="font-bold text-[#3E2723]">{order.users?.name || 'Anonymous'}</span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${STATUS_CONFIG[order.status]?.color}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-dashed border-gray-100 flex flex-col gap-2">
                                            <div className="flex justify-between items-center mb-2 px-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase">Batch Total</span>
                                                <span className="text-lg font-black text-[#3E2723]">₹{data.totalAmount}</span>
                                            </div>

                                            <div className="flex gap-2">
                                                {data.orders.some(o => o.status === 'preparing') && (
                                                    <button
                                                        onClick={() => updateBatchStatus(block, 'ready')}
                                                        className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-md"
                                                    >
                                                        Ready All
                                                    </button>
                                                )}
                                                {data.orders.some(o => o.status === 'ready') && (
                                                    <button
                                                        onClick={() => updateBatchStatus(block, 'delivered')}
                                                        className="flex-1 bg-green-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-md"
                                                    >
                                                        Deliver Block
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-300 gap-4 opacity-50">
                                    <Bike size={48} strokeWidth={1} />
                                    <p className="text-sm font-black uppercase tracking-widest italic">No pending delivery batches</p>
                                </div>
                            )}
                        </div>
                    ) : (
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
                                                        <div className="mt-2 flex gap-2">
                                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {order.payment_status || 'unpaid'}
                                                            </span>
                                                        </div>
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
                                                            Mark Delivered <CheckCircle2 size={16} />
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
                    )
                ) : activeTab === 'menu' ? (
                    <div className="space-y-12">
                        {Object.keys(groupedMenuItems).length > 0 ? (
                            Object.entries(groupedMenuItems).map(([category, items]) => (
                                items.length > 0 && (
                                    <div key={category} className="space-y-4">
                                        <h2 className="text-sm font-black text-[#D4AF37] uppercase tracking-[0.2em] px-2">{category}</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {items.map((item) => (
                                                <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4 items-center hover:shadow-md transition-shadow">
                                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">ID: {item.id.slice(0, 4)}</p>
                                                            <div className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        </div>
                                                        <h3 className="font-black text-[#3E2723] text-sm truncate mb-2">{item.name}</h3>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="font-black text-[#3E2723]">₹{item.price}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[10px] font-black uppercase tracking-wider ${item.is_available ? 'text-green-600' : 'text-red-400'}`}>
                                                                    {item.is_available ? 'ON' : 'OFF'}
                                                                </span>
                                                                <button
                                                                    onClick={() => toggleItemAvailability(item.id, item.is_available)}
                                                                    className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${item.is_available ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-gray-300'}`}
                                                                >
                                                                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${item.is_available ? 'left-6' : 'left-0.5'}`} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))
                        ) : (
                            <div className="col-span-full py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 text-center">
                                <Search size={48} className="text-gray-100 mx-auto mb-4" />
                                <h2 className="text-2xl font-black text-[#3E2723]">No items match your search</h2>
                                <p className="text-gray-400 font-medium">Try searching for something else</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Analytics Tab Content */
                    <div className="space-y-8 pb-12">
                        {rpcErrors && (
                            <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[32px] mb-8">
                                <div className="flex items-center gap-3 text-red-600 mb-2">
                                    <AlertCircle size={20} />
                                    <h3 className="font-black uppercase tracking-widest text-xs">Analytics Sync Error</h3>
                                </div>
                                <p className="text-xs text-red-500 font-bold mb-4">The following database functions might be missing or broken. Please run the SQL setup script in Supabase.</p>
                                <ul className="space-y-1">
                                    {rpcErrors.map((err, i) => (
                                        <li key={i} className="text-[10px] font-mono bg-white/50 px-2 py-1 rounded-lg text-red-400">{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-black text-[#D4AF37] uppercase tracking-[0.2em] px-2">Business Insights</h2>
                            <button
                                onClick={fetchAnalytics}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#3E2723] hover:border-[#D4AF37] transition-all shadow-sm active:scale-95"
                            >
                                <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Stats
                            </button>
                        </div>

                        {/* Revenue Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#3E2723] p-6 rounded-[40px] text-white overflow-hidden relative shadow-xl">
                                <TrendingUp size={120} className="absolute -bottom-8 -right-8 opacity-10" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-2">Today's Revenue</h3>
                                <p className="text-5xl font-black">₹{analytics.revenue?.today || 0}</p>
                                <div className="mt-4 flex items-center gap-2 text-xs font-bold">
                                    <span className={Number(analytics.revenue?.today) >= Number(analytics.revenue?.yesterday) ? 'text-green-400' : 'text-red-400'}>
                                        {Number(analytics.revenue?.yesterday) > 0
                                            ? `${(((Number(analytics.revenue?.today) - Number(analytics.revenue?.yesterday)) / Number(analytics.revenue?.yesterday)) * 100).toFixed(1)}%`
                                            : 'First sales'}
                                    </span>
                                    <span className="opacity-50 uppercase tracking-widest text-[9px]">vs Yesterday</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Yesterday</h3>
                                    <p className="text-3xl font-black text-[#3E2723]">₹{analytics.revenue?.yesterday || 0}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-50 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <BarChart3 size={18} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stable Growth</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">This Week</h3>
                                    <p className="text-3xl font-black text-[#3E2723]">₹{analytics.revenue?.week || 0}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-50 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Activity size={18} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Weekly Target</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Peak Hours Heatmap */}
                            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-black text-[#3E2723] uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <Clock size={18} className="text-[#D4AF37]" /> Peak Hour Traffic
                                </h3>
                                <div className="h-48 flex items-end gap-2 px-2">
                                    {analytics.peakHours.length > 0 ? (
                                        [...Array(24)].map((_, i) => {
                                            const hourData = analytics.peakHours.find(h => h.hour_of_day === i);
                                            const maxOrders = Math.max(...analytics.peakHours.map(h => h.order_count), 1);
                                            const height = hourData ? (hourData.order_count / maxOrders) * 100 : 5;
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                                    <div
                                                        className={`w-full rounded-t-lg transition-all duration-500 ${hourData ? 'bg-[#D4AF37] opacity-80 group-hover:opacity-100' : 'bg-gray-50'}`}
                                                        style={{ height: `${height}%` }}
                                                    >
                                                        {hourData && (
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#3E2723] text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity">
                                                                {hourData.order_count} orders
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">
                                                        {i === 0 ? '12a' : i === 12 ? '12p' : i > 12 ? `${i - 12}p` : `${i}a`}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold italic">
                                            Not enough data for heatmap yet
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Top Items Table */}
                            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-black text-[#3E2723] uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <ShoppingBag size={18} className="text-[#D4AF37]" /> Best Sellers
                                </h3>
                                <div className="space-y-4">
                                    {analytics.topItems.length > 0 ? (
                                        analytics.topItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-amber-50/50 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-[#3E2723] text-[#D4AF37] flex items-center justify-center font-black text-xs shadow-md">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-[#3E2723]">{item.name}</p>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.total_quantity} sold</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-[#3E2723]">₹{item.total_revenue}</p>
                                                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Growth 📈</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center text-gray-300 gap-2">
                                            <BarChart3 size={32} />
                                            <p className="text-xs font-bold italic">No sales data recorded yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
