import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, Coffee, Star, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ItemBottomSheet = ({ item, isOpen, onClose }) => {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(item?.variants?.[0] || 'Standard');
    const [selectedCustomizations, setSelectedCustomizations] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            setSelectedVariant(item?.variants?.[0] || 'Standard');
            setSelectedCustomizations([]);
        }
    }, [isOpen, item]);

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
        // Simple variant price parsing if present in string like "(+0.50)"
        if (selectedVariant.includes('(+')) {
            const match = selectedVariant.match(/\(\+([\d.]+)\)/);
            if (match) price += parseFloat(match[1]);
        }
        // Customization prices if present
        selectedCustomizations.forEach(opt => {
            const match = opt.match(/\(\+([\d.]+)\)/);
            if (match) price += parseFloat(match[1]);
        });
        return (price * quantity).toFixed(2);
    };

    const handleAddToCart = () => {
        addItem({
            ...item,
            quantity,
            selectedVariant,
            customization: selectedCustomizations,
            // Store the calculated single item price for the cart logic
            price: parseFloat(calculatePrice()) / quantity
        });
        toast.success(`${item.name} added to cart!`, {
            icon: '🛒',
            style: {
                borderRadius: '10px',
                background: '#3E2723',
                color: '#fff',
            },
        });
        onClose();
    };

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

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[70] max-h-[90vh] overflow-y-auto shadow-2xl pb-safe"
                        id="item-details"
                    >
                        {/* Grab handle */}
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-[#3E2723] transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="px-6 py-4">
                            {/* Image & Header */}
                            <div className="relative w-full h-64 rounded-3xl overflow-hidden mb-6 shadow-lg">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    {item.isVeg && (
                                        <div className="bg-white/90 p-1.5 rounded-lg border border-green-500 shadow-sm flex items-center gap-1">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                            <span className="text-[10px] font-bold text-green-700">VEG</span>
                                        </div>
                                    )}
                                    {item.badge && (
                                        <div className="bg-[#D4AF37] text-[#3E2723] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                                            <Star size={10} className="fill-current" /> {item.badge}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-2xl font-black text-[#3E2723]">{item.name}</h2>
                                    <span className="text-2xl font-black text-[#D4AF37]">₹{item.price}</span>
                                </div>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                            </div>

                            {/* Variants / Size */}
                            {item.variants?.length > 1 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-black text-[#3E2723] uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Coffee size={14} className="text-[#D4AF37]" /> Select Size
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {item.variants.map((v) => (
                                            <button
                                                key={v}
                                                onClick={() => setSelectedVariant(v)}
                                                className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${selectedVariant === v
                                                    ? 'bg-[#3E2723] border-[#3E2723] text-white shadow-md'
                                                    : 'bg-white border-gray-100 text-gray-500 hover:border-[#D4AF37]'
                                                    }`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Customizations */}
                            {item.customizations?.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-black text-[#3E2723] uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Star size={14} className="text-[#D4AF37]" /> Customizations
                                    </h3>
                                    <div className="space-y-3">
                                        {item.customizations.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => toggleCustomization(opt)}
                                                className={`w-full flex justify-between items-center p-4 rounded-2xl transition-all border-2 ${selectedCustomizations.includes(opt)
                                                    ? 'bg-[#FFF8E1] border-[#D4AF37] text-[#3E2723]'
                                                    : 'bg-gray-50 border-transparent text-gray-500'
                                                    }`}
                                            >
                                                <span className="font-bold text-sm">{opt}</span>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedCustomizations.includes(opt) ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-gray-300'
                                                    }`}>
                                                    {selectedCustomizations.includes(opt) && <Plus size={12} className="text-white" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="flex gap-4 items-center mt-4">
                                <div className="flex items-center bg-gray-100 rounded-2xl p-1 shadow-inner h-[56px]">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all text-[#3E2723]"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="w-10 text-center font-black text-lg text-[#3E2723]">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all text-[#3E2723]"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-[#3E2723] text-white h-[56px] rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all hover:bg-[#5D4037]"
                                >
                                    <ShoppingBag size={20} />
                                    Add to Cart • ₹{calculatePrice()}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ItemBottomSheet;
