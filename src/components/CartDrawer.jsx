import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import OrderSuccess from './OrderSuccess';

const CartDrawer = () => {
    const { isCartOpen, setCartOpen, cartItems, cartTotal, updateQuantity, removeItem, clearCart } = useCart();
    const [showSuccess, setShowSuccess] = React.useState(false);

    const handleCheckout = () => {
        if (cartItems.length === 0) return;

        const phoneNumber = "919000000000"; // Placeholder for Cafe's WhatsApp
        let message = `*☕ New Order from Nescafe IITPKD*%0A%0A`;

        cartItems.forEach((item, index) => {
            message += `${index + 1}. *${item.name}* x ${item.quantity}%0A`;
            message += `   Size: ${item.selectedVariant || 'Standard'}%0A`;
            if (Array.isArray(item.customization) && item.customization.length > 0) {
                message += `   Extras: ${item.customization.join(', ')}%0A`;
            }
            message += `   Price: $${(item.price * item.quantity).toFixed(2)}%0A%0A`;
        });

        message += `*Total Amount: $${cartTotal.toFixed(2)}*%0A%0A`;
        message += `_Sent via Nescafe Ordering System_`;

        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');

        // Trigger success state
        setCartOpen(false);
        setShowSuccess(true);
    };

    const handleCloseSuccess = () => {
        setShowSuccess(false);
        clearCart();
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setCartOpen(false)}
                        className="fixed inset-0 bg-black/60 z-[80] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FFF8E1] z-[90] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#3E2723] p-2.5 rounded-2xl text-white">
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[#3E2723]">My Cart</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cartItems.length} categories</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setCartOpen(false)}
                                className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#3E2723] transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cartItems.length > 0 ? (
                                <>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-black text-[#3E2723] uppercase tracking-wider">Order Items</h3>
                                        <button
                                            onClick={clearCart}
                                            className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                                        >
                                            <Trash2 size={14} /> Clear All
                                        </button>
                                    </div>

                                    {cartItems.map((item, index) => (
                                        <motion.div
                                            key={`${item.id}-${index}`}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-3xl p-4 shadow-sm border border-white flex gap-4"
                                        >
                                            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover" />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-[#3E2723] truncate">{item.name}</h4>
                                                    <button
                                                        onClick={() => removeItem(index)}
                                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">
                                                    {item.selectedVariant || 'Standard'} • {Array.isArray(item.customization) ? item.customization.join(', ') : 'No extras'}
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="font-black text-[#D4AF37]">${(item.price * item.quantity).toFixed(2)}</span>

                                                    <div className="flex items-center bg-gray-50 rounded-xl p-1 shadow-inner">
                                                        <button
                                                            onClick={() => {
                                                                if (window.navigator.vibrate) window.navigator.vibrate(10);
                                                                updateQuantity(index, item.quantity - 1);
                                                            }}
                                                            className="p-1 hover:bg-white rounded-lg transition-all text-[#3E2723]"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-8 text-center font-bold text-sm text-[#3E2723]">{item.quantity}</span>
                                                        <button
                                                            onClick={() => {
                                                                if (window.navigator.vibrate) window.navigator.vibrate(10);
                                                                updateQuantity(index, item.quantity + 1);
                                                            }}
                                                            className="p-1 hover:bg-white rounded-lg transition-all text-[#3E2723]"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
                                        <ShoppingBag size={48} className="text-gray-100" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[#3E2723]">Your cart is empty</h3>
                                        <p className="text-gray-400 text-sm">Add some delicious caffeine to get started!</p>
                                    </div>
                                    <button
                                        onClick={() => setCartOpen(false)}
                                        className="bg-[#3E2723] text-white px-8 py-3 rounded-2xl font-bold shadow-xl active:scale-95 transition-transform"
                                    >
                                        Go to Menu
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer / Summary */}
                        {cartItems.length > 0 && (
                            <div className="p-6 bg-white border-t border-gray-100 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-gray-500 text-sm font-bold">
                                        <span>Subtotal</span>
                                        <span>${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 text-sm font-bold">
                                        <span>Delivery/Fee</span>
                                        <span className="text-green-500 uppercase tracking-widest text-[10px] mt-1">Free</span>
                                    </div>
                                    <div className="pt-2 flex justify-between items-center">
                                        <span className="text-lg font-black text-[#3E2723]">Total Amount</span>
                                        <span className="text-2xl font-black text-[#D4AF37]">${cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (window.navigator.vibrate) window.navigator.vibrate(10);
                                        handleCheckout();
                                    }}
                                    className="w-full bg-[#3E2723] text-white py-4 rounded-2xl font-black text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-[#5D4037]"
                                >
                                    Checkout Now
                                    <ArrowRight size={20} />
                                </button>

                                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                                    Secure Checkout powered by WhatsApp
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
            <OrderSuccess
                isOpen={showSuccess}
                onClose={handleCloseSuccess}
            />
        </AnimatePresence>
    );
};

export default CartDrawer;
