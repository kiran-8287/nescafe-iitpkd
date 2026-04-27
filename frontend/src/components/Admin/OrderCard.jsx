import React from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingBag,
    Bike,
    Package,
    CheckCircle2,
    CircleDashed,
    Clock,
    XCircle
} from 'lucide-react';

const ElapsedTime = ({ createdAt }) => {
    const [elapsed, setElapsed] = React.useState('');

    React.useEffect(() => {
        const update = () => {
            const diff = Math.floor((Date.now() - new Date(createdAt)) / 60000);
            setElapsed(`${diff}m ago`);
        };
        update();
        const timer = setInterval(update, 60000);
        return () => clearInterval(timer);
    }, [createdAt]);

    const isLate = Math.floor((Date.now() - new Date(createdAt)) / 60000) > 20;

    return (
        <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${isLate ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
            <Clock size={10} /> {elapsed}
        </span>
    );
};

const OrderCard = ({ order, statusConfig, onUpdateStatus }) => {
    const StatusIcon = statusConfig[order.status]?.icon || CircleDashed;

    return (
        <motion.div
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
                        {['preparing', 'ready'].includes(order.status) && (
                            <button
                                onClick={() => onUpdateStatus(order.id, 'cancelled')}
                                className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                                title="Cancel Order"
                            >
                                <XCircle size={14} />
                            </button>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusConfig[order.status]?.color}`}>
                            {order.status}
                        </span>
                    </div>
                    <h3 className="font-black text-[#3E2723] text-lg">{order.users?.name || 'Anonymous'}</h3>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{order.users?.email}</p>
                        <ElapsedTime createdAt={order.created_at} />
                    </div>
                    <p className="text-[10px] text-[#D4AF37] font-bold mt-0.5">{new Date(order.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</p>
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
                        <p className="text-xs font-bold text-[#3E2723]">{order.hostel_block}</p>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 flex gap-2">
                {order.status === 'preparing' && (
                    <button
                        onClick={() => onUpdateStatus(order.id, 'ready')}
                        className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-purple-700 transition-all shadow-md active:scale-95"
                    >
                        Mark Ready <Package size={16} />
                    </button>
                )}
                {order.status === 'ready' && (
                    <button
                        onClick={() => onUpdateStatus(order.id, 'delivered')}
                        className="flex-1 bg-green-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-md active:scale-95"
                    >
                        Mark Delivered <CheckCircle2 size={16} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default OrderCard;
