import React, { useState, useEffect, useMemo } from 'react';
import { X, Minus, Plus, ShoppingCart, Coffee, Star, Clock, LogIn, Leaf, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { menuItems } from '../data/mock';
import toast from 'react-hot-toast';

const ItemBottomSheet = ({ item, isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addItem, cartItems } = useCart();
    const [qty, setQty] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(item?.variants?.[0] || 'Standard');
    const [selectedCustomizations, setSelectedCustomizations] = useState([]);
    const [specialRequest, setSpecialRequest] = useState('');
    const [flyingItems, setFlyingItems] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setQty(1);
            setSelectedVariant(item?.variants?.[0] || 'Standard');
            setSelectedCustomizations([]);
            setSpecialRequest('');
            setFlyingItems([]);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, item]);

    const recommendedItems = useMemo(() => {
        if (!item) return [];
        const isDrink = item.category.toLowerCase().includes('coffee') || item.category.toLowerCase().includes('beverage');
        const targetCategories = isDrink ? ['Maggie', 'Sandwich'] : ['Tea and Coffee', 'Cold Beverages'];
        return menuItems
            .filter(i => targetCategories.includes(i.category) && i.id !== item.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
    }, [item]);

    if (!item) return null;

    const toggleCustomization = (option) => {
        setSelectedCustomizations(prev =>
            prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
        );
    };

    const calculatePrice = () => {
        let price = item.price;
        if (selectedVariant?.includes('(+')) {
            const match = selectedVariant.match(/\(\+₹?([\d.]+)\)/);
            if (match) price += parseFloat(match[1]);
        }
        selectedCustomizations.forEach(opt => {
            const match = opt.match(/\(\+₹?([\d.]+)\)/);
            if (match) price += parseFloat(match[1]);
        });
        return (price * qty).toFixed(2);
    };

    const triggerFlyAnimation = (e, imageUrl) => {
        const id = Date.now();
        const startX = e.clientX;
        const startY = e.clientY;
        let targetX = window.innerWidth / 2 + 50;
        let targetY = window.innerHeight - 40;
        const targetEl = document.getElementById('mini-cart-icon') ||
            document.getElementById('mobile-cart-icon') ||
            document.getElementById('desktop-cart-icon');
        if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
        }
        setFlyingItems(prev => [...prev, { id, x: startX, y: startY, targetX, targetY, imageUrl }]);
        setTimeout(() => setFlyingItems(prev => prev.filter(fi => fi.id !== id)), 800);
    };

    const handleAddToCart = (e, targetItem, targetQty = 1, isUpsell = false) => {
        if (!user) {
            toast((t) => (
                <div className="flex flex-col gap-3 p-1 font-sans">
                    <div className="flex items-center gap-2">
                        <LogIn size={18} className="text-[#D4AF37]" />
                        <p className="text-sm font-bold text-[#3E2723]">Login required to order</p>
                    </div>
                    <p className="text-xs text-gray-500">Sign in to start building your cart!</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { toast.dismiss(t.id); navigate('/login'); }}
                            className="flex-1 bg-[#3E2723] text-white py-2 rounded-xl text-xs font-black shadow-md active:scale-95 transition-all"
                        >Sign In</button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-2 text-gray-400 text-xs font-bold hover:text-gray-600 transition-colors"
                        >Later</button>
                    </div>
                </div>
            ), { duration: 5000, position: 'top-center', style: { borderRadius: '24px', padding: '16px', border: '1px solid #F5E6D3' } });
            return;
        }

        const isFirstItem = cartItems.length === 0;

        if (isUpsell) {
            addItem({ ...targetItem, quantity: 1, selectedVariant: targetItem.variants?.[0] || 'Standard', customization: [], price: targetItem.price });
            triggerFlyAnimation(e, targetItem.image);
            toast.success(isFirstItem ? 'Great choice. Your future self approves.' : `${targetItem.name} added!`, {
                icon: isFirstItem ? '✨' : '🛒', style: { background: '#3E2723', color: '#fff' }
            });
            return;
        }

        addItem({
            ...item, quantity: qty, selectedVariant,
            customization: selectedCustomizations,
            specialInstructions: specialRequest,
            price: parseFloat(calculatePrice()) / qty
        });
        triggerFlyAnimation(e, item.image);
        toast.success(isFirstItem ? 'Great choice. Your future self approves.' : `${item.name} added to cart!`, {
            icon: isFirstItem ? '✨' : '🛒', style: { background: '#3E2723', color: '#fff' }
        });
        setTimeout(onClose, 800);
    };

    // Shared detail content (used in both mobile & desktop layouts)
    const DetailContent = ({ compact }) => (
        <div className={`space-y-5 ${compact ? '' : 'px-6 py-6 pb-32'}`}>
            {/* Description */}
            <div>
                <h3 className="text-sm font-black text-[#3E2723] uppercase tracking-widest mb-1">About</h3>
                <p className="text-[#5D4037] text-sm leading-relaxed">{item.description}</p>
            </div>

            {/* Variants */}
            {item.variants?.length > 1 && (
                <div>
                    <h3 className="text-sm font-black text-[#3E2723] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Coffee size={13} className="text-[#D4AF37]" /> Size
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {item.variants.map((v) => (
                            <button key={v} onClick={() => setSelectedVariant(v)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${selectedVariant === v
                                    ? 'bg-[#3E2723] border-[#3E2723] text-white shadow-md scale-105'
                                    : 'bg-gray-50 border-gray-800 text-gray-500 hover:border-[#D4AF37]'}`}>
                                {v}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Customizations */}
            {item.customizations?.length > 0 && (
                <div>
                    <h3 className="text-sm font-black text-[#3E2723] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Star size={13} className="text-[#D4AF37]" /> Customise
                    </h3>
                    <div className="space-y-2">
                        {item.customizations.map((opt) => (
                            <button key={opt} onClick={() => toggleCustomization(opt)}
                                className={`w-full flex justify-between items-center p-3 rounded-xl transition-all border-2 text-xs font-medium ${selectedCustomizations.includes(opt)
                                    ? 'bg-[#FFF8E1] border-[#D4AF37] text-[#3E2723]'
                                    : 'bg-gray-50 border-gray-800 text-gray-400'}`}>
                                <span>{opt}</span>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedCustomizations.includes(opt) ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-gray-300'}`}>
                                    {selectedCustomizations.includes(opt) && <Plus size={9} className="text-white" strokeWidth={3} />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Special instructions */}
            <div>
                <h3 className="text-sm font-black text-[#3E2723] uppercase tracking-widest mb-2">Special Instructions</h3>
                <textarea
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="Less sugar, extra ice..."
                    className="w-full bg-gray-50 border-2 border-gray-800 focus:border-[#D4AF37] rounded-xl p-3 text-sm font-medium text-[#3E2723] outline-none transition-all placeholder:text-gray-300 min-h-[72px] resize-none"
                />
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
                    />

                    {/* ── DESKTOP: Centered Card Modal ── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                        className="hidden md:flex fixed inset-0 z-[70] items-center justify-center p-6 pointer-events-none"
                    >
                        <div className="pointer-events-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden flex w-full max-w-2xl max-h-[85vh]">

                            {/* Left: Image */}
                            <div className="relative w-72 flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                                    {item.isVeg && (
                                        <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/30 flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                                            <span className="text-xs font-bold text-white uppercase">Veg</span>
                                        </div>
                                    )}
                                    {item.badge && (
                                        <div className="bg-[#D4AF37] text-[#3E2723] px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Star size={10} className="fill-current" /> {item.badge}
                                        </div>
                                    )}
                                </div>

                                {/* Close */}
                                <button onClick={onClose}
                                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all">
                                    <X size={18} />
                                </button>

                                {/* Name + meta overlay */}
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h2 className="text-xl font-black font-serif mb-1">{item.name}</h2>
                                    <div className="flex items-center gap-3 text-xs font-bold text-white/80">
                                        <span className="flex items-center gap-1"><Clock size={11} /> 10–15 min</span>
                                        <span className="flex items-center gap-1"><Star size={11} className="text-[#D4AF37] fill-current" /> 4.8</span>
                                        {item.isVeg && <span className="flex items-center gap-1"><Leaf size={11} className="text-green-400" /> Pure Veg</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Details */}
                            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                {/* Price header */}
                                <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                                    <span className="text-2xl font-black text-[#3E2723]">₹{item.price}</span>
                                    <div className="flex items-center bg-gray-100 rounded-xl p-0.5">
                                        <button onClick={() => setQty(Math.max(1, qty - 1))}
                                            className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-lg transition-all text-[#3E2723]">
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center font-black text-sm text-[#3E2723]">{qty}</span>
                                        <button onClick={() => setQty(qty + 1)}
                                            className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-lg transition-all text-[#3E2723]">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Scrollable details */}
                                <div className="flex-1 overflow-y-auto px-5 py-3 no-scrollbar">
                                    <DetailContent compact />
                                </div>

                                {/* Add to cart */}
                                <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
                                    <button
                                        onClick={(e) => handleAddToCart(e, item, qty)}
                                        className="w-full bg-[#3E2723] text-white h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-[#5D4037] active:scale-95 transition-all"
                                    >
                                        <ShoppingCart size={17} />
                                        Add to Cart · <span className="font-mono">₹{calculatePrice()}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── MOBILE: Bottom Sheet (unchanged) ── */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[40px] h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans"
                    >
                        {/* Header Image */}
                        <div className="relative h-64 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <button onClick={onClose}
                                className="absolute top-6 right-6 p-2.5 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all z-10">
                                <X size={20} />
                            </button>
                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                <div className="flex gap-2 mb-2">
                                    {item.isVeg && (
                                        <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/30 flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                                            <span className="text-sm font-bold uppercase">VEG</span>
                                        </div>
                                    )}
                                    {item.badge && (
                                        <div className="bg-[#D4AF37] text-[#3E2723] px-2.5 py-1 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Star size={10} className="fill-current" /> {item.badge}
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-3xl font-bold mb-1 font-serif">{item.name}</h2>
                                <div className="flex items-center gap-4 text-sm font-bold text-white/80">
                                    <span className="flex items-center gap-1.5"><Clock size={14} /> 10-15 min</span>
                                    <span className="flex items-center gap-1.5"><Star size={14} className="text-[#D4AF37] fill-current" /> 4.8 (100+)</span>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50/50">
                            <DetailContent />
                        </div>

                        {/* Sticky Footer */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[80]">
                            <div className="flex gap-4 items-center">
                                <div className="flex items-center bg-gray-100 rounded-2xl p-1 h-[52px]">
                                    <button onClick={() => setQty(Math.max(1, qty - 1))}
                                        className="w-11 h-full flex items-center justify-center hover:bg-white rounded-xl transition-all text-[#3E2723]">
                                        <Minus size={18} />
                                    </button>
                                    <span className="w-9 text-center font-bold text-base text-[#3E2723]">{qty}</span>
                                    <button onClick={() => setQty(qty + 1)}
                                        className="w-11 h-full flex items-center justify-center hover:bg-white rounded-xl transition-all text-[#3E2723]">
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <button onClick={(e) => handleAddToCart(e, item, qty)}
                                    className="flex-1 bg-[#3E2723] text-white h-[52px] rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all hover:bg-[#5D4037]">
                                    <ShoppingCart size={20} />
                                    Add to Cart · <span className="font-mono">₹{calculatePrice()}</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Flying animation layer */}
                    <AnimatePresence>
                        {flyingItems.map(fi => (
                            <motion.div
                                key={fi.id}
                                initial={{ x: fi.x - 20, y: fi.y - 20, scale: 1, opacity: 1 }}
                                animate={{
                                    x: [fi.x - 20, fi.x + 50, fi.targetX - 24],
                                    y: [fi.y - 20, fi.y - 100, fi.targetY - 24],
                                    scale: [1, 1.2, 0.2],
                                    opacity: [1, 1, 0]
                                }}
                                transition={{ duration: 0.8, ease: 'easeInOut' }}
                                className="fixed z-[100] pointer-events-none"
                            >
                                <img src={item.image} alt="" className="w-12 h-12 rounded-full border-2 border-[#D4AF37] shadow-lg object-cover" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
};

export default ItemBottomSheet;
