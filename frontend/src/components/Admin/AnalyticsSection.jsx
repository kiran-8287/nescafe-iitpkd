import React from 'react';
import {
    TrendingUp,
    BarChart3,
    Activity,
    Clock,
    ShoppingBag,
    RefreshCcw,
    AlertCircle
} from 'lucide-react';

const AnalyticsSection = ({ analytics, loading, rpcErrors, onRefresh }) => {
    return (
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
                    onClick={onRefresh}
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

                {/* Best Sellers Table */}
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
    );
};

export default AnalyticsSection;
