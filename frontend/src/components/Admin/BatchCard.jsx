import React from 'react';
import { motion } from 'framer-motion';
import { Bike } from 'lucide-react';

const BatchCard = ({ block, data, statusConfig, onUpdateBatchStatus }) => {
    return (
        <motion.div
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
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${statusConfig[order.status]?.color}`}>
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
                            onClick={() => onUpdateBatchStatus(block, 'ready')}
                            className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-md"
                        >
                            Ready All
                        </button>
                    )}
                    {data.orders.some(o => o.status === 'ready') && (
                        <button
                            onClick={() => onUpdateBatchStatus(block, 'delivered')}
                            className="flex-1 bg-green-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-md"
                        >
                            Deliver Block
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default BatchCard;
