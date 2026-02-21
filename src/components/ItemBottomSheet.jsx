import React, { useState, useEffect, useMemo } from 'react';
import { X, Minus, Plus, ShoppingCart, Coffee, Star, Clock, Info, ChevronRight, LogIn } from 'lucide-react';
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
            // Block body scroll
            document.body.style.overflow = 'hidden';
        } else {
            // Restore body scroll
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, item]);

    // Recommendation Logic: Pick 3 items that are NOT the current item
    const recommendedItems = useMemo(() => {
        if (!item) return [];
        const isDrink = item.category.toLowerCase().includes('coffee') || item.category.toLowerCase().includes('beverage');
        const targetCategories = isDrink ? ['Snacks', 'Desserts'] : ['Hot Coffee', 'Cold Beverages'];

        return menuItems
            .filter(i => targetCategories.includes(i.category) && i.id !== item.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
    }, [item]);

    if (!item) return null;

    const toggleCustomization = (option) => {
        setSelectedCustomizations(prev =>
            prev.includes(option)
                ? prev.filter(o => o !== option)
                : [...prev, option]
        );
    };

    const calculatePrice = () => {
        let price = item.price;
        if (selectedVariant.includes('(+')) {
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

        const miniCart = document.getElementById('mini-cart-icon');
        const mobileCart = document.getElementById('mobile-cart-icon');
        const desktopCart = document.getElementById('desktop-cart-icon');

        const targetEl = miniCart || mobileCart || desktopCart;

        if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
        }

        setFlyingItems(prev => [...prev, { id, x: startX, y: startY, targetX, targetY, imageUrl }]);
        setTimeout(() => {
            setFlyingItems(prev => prev.filter(item => item.id !== id));
        }, 800);
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
                            onClick={() => {
                                toast.dismiss(t.id);
                                navigate('/login');
                            }}
                            className="flex-1 bg-[#3E2723] text-white py-2 rounded-xl text-xs font-black shadow-md active:scale-95 transition-all"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-2 text-gray-400 text-xs font-bold hover:text-gray-600 transition-colors"
                        >
                            Later
                        </button>
                    </div>
                </div>
            ), {
                duration: 5000,
                position: 'top-center',
                style: { borderRadius: '24px', padding: '16px', border: '1px solid #F5E6D3' }
            });
            return;
        }

        const isFirstItem = cartItems.length === 0;

        if (isUpsell) {
            addItem({
                ...targetItem,
                quantity: 1,
                selectedVariant: targetItem.variants?.[0] || 'Standard',
                customization: [],
                price: targetItem.price
            });
            triggerFlyAnimation(e, targetItem.image);
            if (isFirstItem) {
                toast.success("Great choice. Your future self approves.", {
                    icon: '✨',
                    style: { background: '#3E2723', color: '#fff' },
                });
            } else {
                toast.success(`${targetItem.name} added!`, {
                    icon: '🛒',
                    style: { background: '#3E2723', color: '#fff' },
                });
            }
            return;
        }

        addItem({
            ...item,
            quantity: qty,
            selectedVariant,
            customization: selectedCustomizations,
            specialInstructions: specialRequest,
            price: parseFloat(calculatePrice()) / qty
        });

        triggerFlyAnimation(e, item.image);

        if (isFirstItem) {
            toast.success("Great choice. Your future self approves.", {
                icon: '✨',
                style: { background: '#3E2723', color: '#fff' },
            });
        } else {
            toast.success(`${item.name} added to cart!`, {
                icon: '🛒',
                style: { background: '#3E2723', color: '#fff' },
            });
        }

        setTimeout(onClose, 800);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[40px] h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans"
                    >
                        {/* Header Image Section */}
                        <div className="relative h-64 md:h-72 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2.5 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all z-10"
                            >
                                <X size={20} />
                            </button>

                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                <div className="flex gap-2 mb-2">
                                    {item.isVeg && (
                                        <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/30 flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
                                            <span className="text-sm font-bold tracking-wider uppercase">VEG</span>
                                        </div>
                                    )}
                                    {item.badge && (
                                        <div className="bg-[#D4AF37] text-[#3E2723] px-2.5 py-1 rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
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

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 no-scrollbar bg-gray-50/50">
                            <div className="mb-8">
                                <h3 className="text-base font-bold text-[#3E2723] mb-3">Description</h3>
                                <p className="text-[#5D4037] text-base leading-relaxed">{item.description}</p>
                            </div>

                            {/* Variants / Size */}
                            {item.variants?.length > 1 && (
                                <div className="mb-8">
                                    <h3 className="text-base font-bold text-[#3E2723] mb-4 flex items-center gap-2">
                                        <Coffee size={14} className="text-[#D4AF37]" /> Select Size
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {item.variants.map((v) => (
                                            <button
                                                key={v}
                                                onClick={() => setSelectedVariant(v)}
                                                className={`px-6 py-3 rounded-2xl font-medium text-sm transition-all border-2 ${selectedVariant === v
                                                    ? 'bg-[#3E2723] border-[#3E2723] text-white shadow-xl scale-105'
                                                    : 'bg-white border-transparent text-gray-500 hover:border-[#D4AF37] shadow-sm'
                                                    }`}>
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Customizations */}
                            {item.customizations?.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-base font-bold text-[#3E2723] mb-4 flex items-center gap-2">
                                        <Star size={14} className="text-[#D4AF37]" /> Customizations
                                        <span className="text-xs font-normal text-gray-500 ml-auto">Required</span>
                                    </h3>
                                    <div className="space-y-2.5">
                                        {item.customizations.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => toggleCustomization(opt)}
                                                className={`w-full flex justify-between items-center p-4 rounded-2xl transition-all border-2 ${selectedCustomizations.includes(opt)
                                                    ? 'bg-[#FFF8E1] border-[#D4AF37] text-[#3E2723] shadow-md'
                                                    : 'bg-white border-transparent text-gray-400 shadow-sm'
                                                    }`}
                                            >
                                                <span className="font-medium text-sm">{opt}</span>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedCustomizations.includes(opt) ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-gray-200'}`}>
                                                    {selectedCustomizations.includes(opt) && <Plus size={12} className="text-white" strokeWidth={3} />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Special instructions */}
                            <div className="mb-10">
                                <h3 className="text-base font-bold text-[#3E2723] mb-4">Special Instructions</h3>
                                <textarea
                                    value={specialRequest}
                                    onChange={(e) => setSpecialRequest(e.target.value)}
                                    placeholder="Any preferences? Less sugar, Extra ice..."
                                    className="w-full bg-white border-2 border-transparent focus:border-[#D4AF37] rounded-2xl p-4 text-sm font-medium text-[#3E2723] outline-none focus:outline-none transition-all shadow-sm placeholder:text-gray-300 min-h-[100px] resize-none"
                                />
                            </div>

                            {/* Recommendations Section */}
                            {recommendedItems.length > 0 && (
                                <div className="pt-8 border-t border-gray-100">
                                    <h3 className="text-base font-bold text-[#3E2723] mb-5 flex items-center gap-2">
                                        Complete your meal
                                        <span className="text-xs font-normal text-[#5D4037] ml-auto">Recommended</span>
                                    </h3>
                                    <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 no-scrollbar">
                                        {recommendedItems.map((recItem) => (
                                            <div key={recItem.id} className="flex-shrink-0 w-40 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col group hover:shadow-lg transition-all duration-300">
                                                <div className="h-28 w-full relative overflow-hidden">
                                                    <img src={recItem.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={recItem.name} />
                                                    <button
                                                        onClick={(e) => handleAddToCart(e, recItem, 1, true)}
                                                        className="absolute bottom-2 right-2 bg-white text-[#3E2723] shadow-xl rounded-xl p-2.5 hover:bg-[#3E2723] hover:text-white transition-all transform active:scale-95"
                                                    >
                                                        <Plus size={16} strokeWidth={3} />
                                                    </button>
                                                </div>
                                                <div className="p-3.5 flex flex-col flex-grow">
                                                    <h4 className="font-black text-xs text-[#3E2723] line-clamp-1 mb-1">{recItem.name}</h4>
                                                    <div className="mt-auto flex justify-between items-center">
                                                        <span className="text-xs text-[#D4AF37] font-black">₹{recItem.price}</span>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Add</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sticky Footer Action */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[80]">
                            <div className="flex gap-4 items-center max-w-lg mx-auto">
                                <div className="flex items-center bg-gray-100 rounded-2xl p-1 h-[56px]">
                                    <button
                                        onClick={() => setQty(Math.max(1, qty - 1))}
                                        className="w-12 h-full flex items-center justify-center hover:bg-white rounded-xl transition-all text-[#3E2723]"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="w-10 text-center font-bold text-base text-[#3E2723]">{qty}</span>
                                    <button
                                        onClick={() => setQty(qty + 1)}
                                        className="w-12 h-full flex items-center justify-center hover:bg-white rounded-xl transition-all text-[#3E2723]"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <button
                                    onClick={(e) => handleAddToCart(e, item, qty)}
                                    className="flex-1 bg-[#3E2723] text-white h-[56px] rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all hover:bg-[#5D4037]"
                                >
                                    <ShoppingCart size={20} />
                                    Add to Cart • <span className="font-mono">₹{calculatePrice()}</span>
                                </button>
                            </div>
                        </div>

                        {/* Animation Layer */}
                        <AnimatePresence>
                            {flyingItems.map(item => (
                                <motion.div
                                    key={item.id}
                                    initial={{ x: item.x - 20, y: item.y - 20, scale: 1, opacity: 1 }}
                                    animate={{
                                        x: [item.x - 20, item.x + 50, item.targetX - 24],
                                        y: [item.y - 20, item.y - 100, item.targetY - 24],
                                        scale: [1, 1.2, 0.2],
                                        opacity: [1, 1, 0]
                                    }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className="fixed z-[100] pointer-events-none"
                                >
                                    <img
                                        src={item.imageUrl}
                                        alt="flying"
                                        className="w-12 h-12 rounded-full border-2 border-[#D4AF37] shadow-lg object-cover"
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ItemBottomSheet;
