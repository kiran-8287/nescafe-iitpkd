import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Minus, Plus, ShoppingCart, ArrowRight, MapPin, Footprints, Bike, Building, Check, TicketPercent, ChevronRight, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const HOSTELS = ["Block A (Boys)", "Block B (Girls)", "Block C (Mixed)", "Faculty Quarters", "Library Reading Room"];

const CartDrawer = () => {
    const navigate = useNavigate();
    const {
        isCartOpen,
        setCartOpen,
        cartItems,
        updateQuantity,
        removeItem,
        clearCart,
        orderMode,
        setOrderMode,
        hostelDetails,
        setHostelDetails,
        couponApplied,
        setCouponApplied,
        billDetails
    } = useCart();

    const handleApplyCoupon = () => {
        if (couponApplied) {
            setCouponApplied(false);
            toast("Coupon removed", { icon: '🏷️' });
        } else {
            setCouponApplied(true);
            toast.success("CAMPUS20 Applied!", {
                icon: '🎉',
                style: { background: '#3E2723', color: '#fff' }
            });
        }
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        if (orderMode === 'delivery' && (!hostelDetails.block || !hostelDetails.room)) {
            toast.error("Please enter delivery details");
            return;
        }

        if (!user) {
            toast.error("Please login to place an order");
            navigate('/login');
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Processing your caffeine...");

        try {
            // 1. Create Order record
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total_amount: billDetails.finalTotal,
                    order_mode: orderMode,
                    hostel_block: orderMode === 'delivery' ? hostelDetails.block : null,
                    room_number: orderMode === 'delivery' ? hostelDetails.room : null,
                    status: 'preparing',
                    payment_status: 'pending'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const itemsToInsert = cartItems.map(item => ({
                order_id: orderData.id,
                item_id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                variant: item.selectedVariant || 'Standard',
                customization: item.customization || []
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            // Success!
            toast.success("Order received! Start your timer.", { id: loadingToast });

            // Clear cart and Navigate
            setCartOpen(false);
            navigate('/order-confirmed', {
                state: {
                    orderId: orderData.id,
                    orderMode,
                    hostelDetails,
                    finalTotal: billDetails.finalTotal
                }
            });

        } catch (error) {
            console.error('Checkout error:', error);
            toast.error("Order failed. Like our internet.", { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setCartOpen(false)}
                        className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FFF8E1] z-[110] shadow-2xl flex flex-col font-sans"
                    >
                        {/* Header */}
                        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#3E2723] p-2.5 rounded-2xl text-white">
                                    <ShoppingCart size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[#3E2723]">My Order</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cartItems.length} items</p>
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
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                            {cartItems.length > 0 ? (
                                <>
                                    <div className="flex justify-between items-center px-2">
                                        <h3 className="text-xs font-black text-[#3E2723] uppercase tracking-wider">Order Items</h3>
                                        <button
                                            onClick={clearCart}
                                            className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                                        >
                                            <Trash2 size={14} /> Clear All
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {cartItems.map((item, index) => (
                                            <motion.div
                                                key={`${item.id}-${index}`}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white rounded-2xl p-3 shadow-sm border border-white/50 flex gap-3"
                                            >
                                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-[#3E2723] text-sm truncate">{item.name}</h4>
                                                        <button
                                                            onClick={() => removeItem(index)}
                                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>

                                                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                                                        {item.selectedVariant || 'Standard'} {Array.isArray(item.customization) && item.customization.length > 0 && `• ${item.customization.join(', ')}`}
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <span className="font-black text-[#D4AF37] text-sm">₹{(item.price * item.quantity).toFixed(2)}</span>

                                                        <div className="flex items-center bg-gray-50 rounded-lg p-0.5 shadow-inner">
                                                            <button
                                                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                                                className="p-1 hover:bg-white rounded-md transition-all text-[#3E2723]"
                                                            >
                                                                <Minus size={12} />
                                                            </button>
                                                            <span className="w-6 text-center font-bold text-xs text-[#3E2723]">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                                                className="p-1 hover:bg-white rounded-md transition-all text-[#3E2723]"
                                                            >
                                                                <Plus size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Delivery Mode Toggle */}
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-white/50 space-y-4">
                                        <h3 className="text-xs font-black text-[#3E2723] uppercase tracking-wider flex items-center gap-2">
                                            <MapPin size={14} className="text-[#D4AF37]" /> Delivery Option
                                        </h3>

                                        <div className="flex p-1 bg-[#FFF8E1] rounded-xl relative">
                                            <motion.div
                                                className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm z-0"
                                                initial={false}
                                                animate={{
                                                    left: orderMode === 'pickup' ? '4px' : '50%',
                                                    width: 'calc(50% - 4px)'
                                                }}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />

                                            <button
                                                onClick={() => setOrderMode('pickup')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg z-10 text-xs font-bold transition-colors ${orderMode === 'pickup' ? 'text-[#3E2723]' : 'text-gray-400'}`}
                                            >
                                                <Footprints size={16} /> Self Pickup
                                            </button>
                                            <button
                                                onClick={() => setOrderMode('delivery')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg z-10 text-xs font-bold transition-colors ${orderMode === 'delivery' ? 'text-[#3E2723]' : 'text-gray-400'}`}
                                            >
                                                <Bike size={16} /> Campus Delivery
                                            </button>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {orderMode === 'delivery' ? (
                                                <motion.div
                                                    key="delivery-form"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-3 pt-1"
                                                >
                                                    <div>
                                                        <label className="text-[10px] font-black text-gray-400 ml-1 mb-1 block uppercase">Hostel / Block</label>
                                                        <div className="relative">
                                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={14} />
                                                            <select
                                                                value={hostelDetails.block}
                                                                onChange={(e) => setHostelDetails({ ...hostelDetails, block: e.target.value })}
                                                                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-transparent focus:border-[#D4AF37] rounded-xl text-xs font-bold text-[#3E2723] outline-none transition-all appearance-none"
                                                            >
                                                                <option value="">Select Block</option>
                                                                {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-gray-400 ml-1 mb-1 block uppercase">Room / Spot</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Ex: 304 or 'Main Entrance'"
                                                            value={hostelDetails.room}
                                                            onChange={(e) => setHostelDetails({ ...hostelDetails, room: e.target.value })}
                                                            className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-[#D4AF37] rounded-xl text-xs font-bold text-[#3E2723] outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#D4AF37] bg-white p-2 rounded-lg border border-[#D4AF37]/20">
                                                        <Bike size={12} />
                                                        <span>₹10 Delivery fee applies to help our students</span>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="pickup-info"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="text-[10px] font-black text-[#3E2723] bg-white p-3 rounded-xl flex items-center gap-2 border border-white/50"
                                                >
                                                    <Check size={14} className="text-green-500" />
                                                    <span>Order ready in ~15 mins at Counter. No fees.</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Coupon Section */}
                                    <button
                                        onClick={handleApplyCoupon}
                                        className={`w-full bg-white p-4 rounded-2xl shadow-sm border-2 border-dashed flex items-center justify-between transition-all ${couponApplied ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-[#D4AF37]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${couponApplied ? 'bg-green-500 text-white' : 'bg-[#FFF8E1] text-[#D4AF37]'}`}>
                                                {couponApplied ? <Check size={18} /> : <TicketPercent size={18} />}
                                            </div>
                                            <div className="text-left">
                                                <h4 className={`font-black text-xs ${couponApplied ? 'text-green-600' : 'text-[#3E2723]'}`}>
                                                    {couponApplied ? "CAMPUS20 Applied" : "Apply Coupon"}
                                                </h4>
                                                <p className="text-[10px] font-bold text-gray-400">
                                                    {couponApplied ? `Saved ₹${billDetails.discount}` : "Save 20% on your caffeine"}
                                                </p>
                                            </div>
                                        </div>
                                        {!couponApplied && <ChevronRight size={16} className="text-gray-300" />}
                                    </button>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
                                        <ShoppingCart size={48} className="text-gray-100" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[#3E2723]">Your cart is as empty as my sleep schedule.</h3>
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

                        {/* Bill Summary Footer */}
                        {cartItems.length > 0 && (
                            <div className="p-6 bg-white border-t border-gray-100 space-y-4 relative">
                                {/* Bill Zigzag */}
                                <div className="absolute -top-1.5 left-0 right-0 h-2 flex gap-1 overflow-hidden pointer-events-none">
                                    {[...Array(20)].map((_, i) => (
                                        <div key={i} className="w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45 flex-shrink-0" />
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-gray-400 text-xs font-black uppercase">
                                        <span>Subtotal</span>
                                        <span>₹{billDetails.subtotal.toFixed(2)}</span>
                                    </div>

                                    {couponApplied && (
                                        <div className="flex justify-between text-green-500 text-xs font-black uppercase">
                                            <span className="flex items-center gap-1"><TicketPercent size={12} /> Coupon Savings</span>
                                            <span>-₹{billDetails.discount.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-gray-400 text-xs font-black uppercase">
                                        <span>Taxes (GST 5%)</span>
                                        <span>₹{billDetails.taxes.toFixed(2)}</span>
                                    </div>

                                    <AnimatePresence>
                                        {orderMode === 'delivery' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex justify-between text-gray-400 text-xs font-black uppercase"
                                            >
                                                <span className="flex items-center gap-1"><Bike size={12} /> Delivery Fee</span>
                                                <span>₹{billDetails.deliveryFee.toFixed(2)}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="pt-2 flex justify-between items-center">
                                        <div>
                                            <span className="text-xs font-black text-gray-400 uppercase block leading-none mb-1">Total Payable</span>
                                            <span className="text-3xl font-black text-[#3E2723]">₹{billDetails.finalTotal.toFixed(2)}</span>
                                        </div>
                                        <button
                                            onClick={handleCheckout}
                                            className="bg-[#3E2723] text-white h-14 px-8 rounded-2xl font-black text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-[#5D4037]"
                                        >
                                            {orderMode === 'delivery' ? 'Order Now' : 'Checkout'}
                                            <ArrowRight size={20} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-[8px] text-center text-gray-300 font-black uppercase tracking-[0.2em]">
                                    Nescafe Official Ordering System • IITPKD
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
            {/* Scrollbar hide utility */}
            <style>
                {`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                `}
            </style>
        </AnimatePresence>
    );
};

export default CartDrawer;
