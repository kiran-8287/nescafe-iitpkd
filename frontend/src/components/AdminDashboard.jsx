import React, { useEffect, useRef, useState } from 'react';
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
    X,
    XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import usePushNotifications from '../hooks/usePushNotifications';
import OrderCard from './Admin/OrderCard';
import BatchCard from './Admin/BatchCard';
import AnalyticsSection from './Admin/AnalyticsSection';
import GalleryModeration from './Admin/GalleryModeration';

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
    { key: 'ready', label: 'Ready', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { key: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
];

const AdminDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'menu', 'analytics', or 'gallery'
    const [menuSearchTerm, setMenuSearchTerm] = useState('');
    const [timeRange, setTimeRange] = useState('today'); // '6h', 'today', '7d', '30d', 'all'
    const [orderSearchQuery, setOrderSearchQuery] = useState('');
    const [cafeOpen, setCafeOpen] = useState(true);
    const { sendNotification } = usePushNotifications();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const notificationsEnabledRef = useRef(false); // ref mirrors state so realtime closure always reads current value
    const [analytics, setAnalytics] = useState({
        revenue: null,
        topItems: [],
        peakHours: []
    });
    const [orderViewMode, setOrderViewMode] = useState('individual'); // 'individual' or 'batches'
    const [rpcErrors, setRpcErrors] = useState(null);
    // Track whether analytics was ever fetched so we don't refetch on every tab switch
    const analyticsLoadedRef = useRef(false);

    const groupedDeliveryBatches = orders.reduce((acc, order) => {
        if (order.order_mode === 'delivery' && order.status !== 'delivered' && order.status !== 'cancelled') {
            const block = order.hostel_block || 'Unknown';
            if (!acc[block]) acc[block] = { orders: [], totalAmount: 0 };
            acc[block].orders.push(order);
            acc[block].totalAmount += order.total_amount;
        }
        return acc;
    }, {});

    // Keep ref in sync with state so realtime listener never reads a stale closure value
    useEffect(() => {
        notificationsEnabledRef.current = notificationsEnabled;
    }, [notificationsEnabled]);

    useEffect(() => {
        // Check for notification permission on mount
        if ('Notification' in window) {
            const granted = Notification.permission === 'granted';
            setNotificationsEnabled(granted);
            notificationsEnabledRef.current = granted;
        }

        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'menu') fetchItems();
        if (activeTab === 'analytics' && !analyticsLoadedRef.current) {
            fetchAnalytics();
            analyticsLoadedRef.current = true;
        }

        // Real-time subscription for orders — incremental updates, no full refetch
        const ordersSubscription = supabase
            .channel('orders-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async (payload) => {

                if (payload.eventType === 'INSERT') {
                    // New order: fetch just this one order with its joins
                    const { data: newOrder } = await supabase
                        .from('orders')
                        .select('*, users!orders_user_id_fkey (name, email), order_items (*)')
                        .eq('id', payload.new.id)
                        .single();

                    if (newOrder) {
                        setOrders(prev => {
                            // Deduplicate: don't add if it already exists from a recent fetch
                            if (prev.some(o => o.id === newOrder.id)) return prev;
                            return [newOrder, ...prev];
                        });
                    }

                    // Notify staff of new order (use ref to avoid stale closure)
                    if (notificationsEnabledRef.current) {
                        sendNotification(
                            '☕ New Order Received!',
                            `Order #${payload.new.id.slice(0, 4)} from ${payload.new.hostel_block || 'Pickup'}`
                        );
                    }
                }

                if (payload.eventType === 'UPDATE') {
                    // Status change: patch only the affected order in local state — no DB call needed
                    setOrders(prev => prev.map(o =>
                        o.id === payload.new.id ? { ...o, ...payload.new } : o
                    ));
                }

                if (payload.eventType === 'DELETE') {
                    setOrders(prev => prev.filter(o => o.id !== payload.old.id));
                }

                // Refresh analytics counts when on analytics tab
                if (activeTab === 'analytics') fetchAnalytics();
            })
            .subscribe();

        // ── Real-time subscription for settings (Café Status) ──
        const settingsSubscription = supabase
            .channel('settings-channel')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (payload) => {
                if (payload.new.key === 'cafe_open') {
                    setCafeOpen(payload.new.value === 'true');
                }
            })
            .subscribe();

        // Fetch initial café status
        const fetchSettings = async () => {
            const { data } = await supabase.from('settings').select('*').eq('key', 'cafe_open').maybeSingle();
            if (data) setCafeOpen(data.value === 'true');
        };
        fetchSettings();

        // Real-time subscription for items
        const itemsSubscription = supabase
            .channel('items-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, (payload) => {
                // console.log('Real-time item change detected:', payload); // Debug only
                fetchItems();
            })
            .subscribe((status) => {
                // console.log('Items subscription status:', status); // Debug only
            });

        // Polling fallback: Every 30 seconds
        const pollInterval = setInterval(() => {
            if (activeTab === 'orders') fetchOrders();
            if (activeTab === 'menu') fetchItems();
        }, 30000);

        return () => {
            supabase.removeChannel(ordersSubscription);
            supabase.removeChannel(itemsSubscription);
            supabase.removeChannel(settingsSubscription);
            clearInterval(pollInterval);
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
        // console.log('Fetching Business Intelligence data via RPC...'); // Debug only
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

            /* console.log('Final Analytics Payload for State:', {
                revenue: revRes.data,
                top: topRes.data,
                peak: peakRes.data
            }); */ // Debug only

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
            notificationsEnabledRef.current = true;
            toast.success('Alerts enabled! You will be notified of new orders.');
            sendNotification('Nescafe IITPKD', 'Notifications enabled successfully!');
        } else {
            setNotificationsEnabled(false);
            notificationsEnabledRef.current = false;
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
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
            // Revert on error by restoring old orders
            setOrders(oldOrders);
        }
    };

    const toggleCafeStatus = async () => {
        const loadingToast = toast.loading(`${cafeOpen ? 'Closing' : 'Opening'} café...`);
        try {
            const newVal = !cafeOpen ? 'true' : 'false';
            const { error } = await supabase
                .from('settings')
                .update({ value: newVal })
                .eq('key', 'cafe_open');

            if (error) throw error;
            setCafeOpen(!cafeOpen);
            toast.success(`Café is now ${!cafeOpen ? 'OPEN' : 'CLOSED'}`, { id: loadingToast });
        } catch (error) {
            console.error('Error toggling café status:', error);
            toast.error('Failed to change café status', { id: loadingToast });
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

    const updateItemPrice = async (itemId, newPrice) => {
        if (newPrice === '' || isNaN(newPrice)) {
            toast.error('Please enter a valid price');
            fetchItems(); // Reset to DB value
            return;
        }

        const price = parseFloat(newPrice);
        if (price < 0) {
            toast.error('Price cannot be negative');
            fetchItems();
            return;
        }

        try {
            const { error } = await supabase
                .from('items')
                .update({ price: price })
                .eq('id', itemId);

            if (error) throw error;
            toast.success('Price updated successfully');
            // No need to fetchItems() as state is already updated locally via onChange
        } catch (error) {
            console.error('Error updating price:', error);
            toast.error('Failed to update price');
            fetchItems(); // Reset to DB value on error
        }
    };


    const filteredOrders = orderSearchQuery
        ? orders // Show all search results regardless of status tab
        : (filterStatus === 'all'
            ? orders
            : orders.filter(o => o.status === filterStatus));

    const getStats = () => ({
        total: orders.length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    });

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
                            <button
                                onClick={() => setActiveTab('gallery')}
                                className={`px-3 md:px-6 py-2 rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'gallery' ? 'bg-[#3E2723] text-white shadow-md' : 'text-gray-400 hover:text-[#3E2723]'}`}
                            >
                                Gallery
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleCafeStatus}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border ${
                                    cafeOpen 
                                    ? 'bg-green-50 border-green-100 text-green-700 hover:bg-green-100' 
                                    : 'bg-red-50 border-red-100 text-red-700 hover:bg-red-100'
                                }`}
                            >
                                <div className={`w-2 h-2 rounded-full ${cafeOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                Café: {cafeOpen ? 'Open' : 'Closed'}
                            </button>

                            <button
                                onClick={requestNotificationPermission}
                                className={`p-2.5 rounded-2xl border flex items-center justify-center transition-all ${notificationsEnabled ? 'border-green-100 bg-green-50 text-green-600' : 'border-gray-100 bg-white text-gray-400 hover:text-[#3E2723]'} shadow-sm flex-shrink-0`}
                                title={notificationsEnabled ? 'Notifications Enabled' : 'Enable New Order Alerts'}
                            >
                                {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                            </button>
                        </div>
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

                            {/* Grouping Status and View Mode to stack vertically */}
                            <div className="flex flex-col gap-2">
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

                                {/* Batch View Toggle - Moved underneath */}
                                <div className="flex bg-gray-100 p-1 rounded-2xl shadow-inner gap-1 self-start">
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
                                    <BatchCard
                                        key={block}
                                        block={block}
                                        data={data}
                                        statusConfig={STATUS_CONFIG}
                                        onUpdateBatchStatus={updateBatchStatus}
                                    />
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
                                    {filteredOrders.map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            statusConfig={STATUS_CONFIG}
                                            onUpdateStatus={updateOrderStatus}
                                        />
                                    ))}
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
                                                            <div className="flex items-center gap-1 group/price relative">
                                                                <span className="font-black text-[#3E2723]">₹</span>
                                                                <input
                                                                    type="number"
                                                                    value={item.price}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, price: val } : m));
                                                                    }}
                                                                    onBlur={(e) => updateItemPrice(item.id, e.target.value)}
                                                                    onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                                                    className="w-16 font-black text-[#3E2723] bg-transparent border-b-2 border-transparent focus:border-[#D4AF37] focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                    title="Click to edit price"
                                                                />
                                                            </div>
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
                ) : activeTab === 'analytics' ? (
                    /* Analytics Tab Content */
                    <AnalyticsSection
                        analytics={analytics}
                        loading={loading}
                        rpcErrors={rpcErrors}
                        onRefresh={fetchAnalytics}
                    />
                ) : (
                    /* Gallery Moderation Tab */
                    <GalleryModeration />
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
