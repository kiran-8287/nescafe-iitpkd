import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuItems } from '../data/mock';
import { Search, Plus, Minus, Info, Flame, Leaf, Star, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ItemBottomSheet from './ItemBottomSheet';
import MenuSkeleton from './MenuSkeleton';

const FullMenu = ({ onBack }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, addItem, updateQuantity } = useCart();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Hot Coffee');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [flyingItems, setFlyingItems] = useState([]);

    const categoryContainerRef = useRef(null);
    const categories = ['Hot Coffee', 'Cold Beverages', 'Snacks', 'Desserts'];

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 150);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const observerOptions = { root: null, rootMargin: '-100px 0px -70% 0px', threshold: 0 };
        const handleIntersect = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveCategory(entry.target.id);
                    const btn = document.getElementById(`full-btn-${entry.target.id}`);
                    if (btn && categoryContainerRef.current) {
                        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }
                }
            });
        };
        const observer = new IntersectionObserver(handleIntersect, observerOptions);
        categories.forEach(cat => {
            const element = document.getElementById(`full-${cat}`);
            if (element) observer.observe(element);
        });
        return () => observer.disconnect();
    }, [isLoading]);

    const scrollToCategory = (id) => {
        const element = document.getElementById(`full-${id}`);
        if (element) {
            const yOffset = -140;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const getItemQuantity = (id) => {
        return cartItems.filter(i => i.id === id).reduce((sum, i) => sum + i.quantity, 0);
    };

    const triggerFlyAnimation = (e, imageUrl) => {
        const id = Date.now();
        const startX = e.clientX;
        const startY = e.clientY;

        // Find target cart icon
        let targetX = window.innerWidth / 2 + 50; // Default
        let targetY = window.innerHeight - 40; // Default

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
        setTimeout(() => setFlyingItems(prev => prev.filter(item => item.id !== id)), 1000);
    };

    const handleUpdateQty = (e, item, newQty) => {
        e.stopPropagation();

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

        const existingIndex = cartItems.findIndex(i => i.id === item.id);
        if (newQty > getItemQuantity(item.id)) {
            if (existingIndex === -1) {
                const isFirstItem = cartItems.length === 0;
                addItem(item);
                triggerFlyAnimation(e, item.image);
                if (isFirstItem) {
                    toast.success("Great choice. Your future self approves.", {
                        icon: '✨',
                        style: { background: '#3E2723', color: '#fff' }
                    });
                } else {
                    toast.success(`${item.name} added!`, { icon: '☕' });
                }
            } else {
                updateQuantity(existingIndex, newQty);
            }
        } else {
            updateQuantity(existingIndex, newQty);
        }
    };

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const renderBadge = (badge) => {
        switch (badge?.toLowerCase()) {
            case 'bestseller': return <span className="flex items-center bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"><Star size={10} className="mr-1 fill-current" /> Bestseller</span>;
            case 'new': return <span className="flex items-center bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"><Flame size={10} className="mr-1 fill-current" /> New</span>;
            case 'fresh': return <span className="flex items-center bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"><Leaf size={10} className="mr-1 fill-current" /> Fresh</span>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8E1] pt-20 pb-32 relative overflow-hidden">
            {/* Fly-to-Cart Overlay */}
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
                        className="fixed pointer-events-none z-[100] w-12 h-12 rounded-full border-4 border-white shadow-2xl overflow-hidden"
                    >
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    </motion.div>
                ))}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {isLoading ? (
                    <MenuSkeleton />
                ) : (
                    <>
                        <div className="sticky top-20 z-30 bg-[#FFF8E1]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 font-sans">
                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search everything..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border-2 border-transparent focus:border-[#D4AF37] rounded-2xl py-3 pl-12 pr-4 shadow-md transition-all outline-none font-bold"
                                />
                            </div>

                            <div ref={categoryContainerRef} className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        id={`full-btn-${cat}`}
                                        onClick={() => scrollToCategory(cat)}
                                        className={`snap-center px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 border-2 ${activeCategory === cat
                                            ? 'bg-[#3E2723] border-[#3E2723] text-white shadow-lg'
                                            : 'bg-white border-gray-100 text-[#3E2723] hover:border-[#D4AF37]'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-16 mt-8">
                            {categories.map((cat) => {
                                const items = filteredItems.filter(i => i.category === cat);
                                if (items.length === 0) return null;

                                return (
                                    <div key={cat} id={`full-${cat}`} className="scroll-mt-40">
                                        <div className="flex items-center gap-4 mb-6">
                                            <h3 className="text-xl sm:text-2xl font-black text-[#3E2723] uppercase tracking-tighter font-serif">{cat}</h3>
                                            <div className="h-0.5 flex-1 bg-gradient-to-r from-[#D4AF37]/30 to-transparent"></div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {items.map((item) => {
                                                const qty = getItemQuantity(item.id);
                                                return (
                                                    <div key={item.id} onClick={() => { setSelectedItem(item); setIsSheetOpen(true); }} className="bg-white rounded-3xl p-3 sm:p-4 flex gap-4 shadow-sm hover:shadow-xl transition-all border border-gray-50 group relative cursor-pointer active:scale-[0.98] font-sans">
                                                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0">
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                            {item.isVeg && <div className="absolute top-2 left-2 bg-white/90 p-1 rounded-md border border-green-500"><div className="w-2 h-2 rounded-full bg-green-500"></div></div>}
                                                        </div>
                                                        <div className="flex-1 flex flex-col justify-between min-w-0">
                                                            <div>
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <h4 className="font-bold text-[#3E2723] text-base sm:text-lg truncate">{item.name}</h4>
                                                                    {renderBadge(item.badge)}
                                                                </div>
                                                                <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-2">{item.description}</p>
                                                            </div>
                                                            <div className="flex justify-between items-end">
                                                                <span className="text-lg sm:text-xl font-black text-[#3E2723]">₹{item.price}</span>
                                                                {qty === 0 ? (
                                                                    <button onClick={(e) => { if (window.navigator.vibrate) window.navigator.vibrate(15); handleUpdateQty(e, item, 1); }} className="bg-white border-2 border-[#D4AF37] text-[#3E2723] font-bold px-6 py-1.5 rounded-xl hover:bg-[#D4AF37] transition-all shadow-sm active:scale-95">ADD</button>
                                                                ) : (
                                                                    <div className="flex items-center bg-[#3E2723] text-white rounded-xl p-1 shadow-md">
                                                                        <button onClick={(e) => { if (window.navigator.vibrate) window.navigator.vibrate(10); handleUpdateQty(e, item, qty - 1); }} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><Minus size={18} /></button>
                                                                        <span className="w-8 text-center font-bold text-sm">{qty}</span>
                                                                        <button onClick={(e) => { if (window.navigator.vibrate) window.navigator.vibrate(10); handleUpdateQty(e, item, qty + 1); }} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><Plus size={18} /></button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setIsSheetOpen(true); }} className="absolute bottom-4 right-4 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-gray-100 rounded-full text-gray-400 hover:text-[#D4AF37] hover:bg-white shadow-sm sm:static sm:mr-[-8px]"><Info size={16} /></button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredItems.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center">
                                    <Search size={48} className="text-gray-200 mb-4" />
                                    <p className="text-xl font-bold text-[#3E2723]">Nothing here. Like my will to study.</p>
                                    <p className="text-gray-400 text-sm mt-1">Try searching for something else!</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <ItemBottomSheet item={selectedItem} isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />

            <style>
                {`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                `}
            </style>
        </div>
    );
};

export default FullMenu;
