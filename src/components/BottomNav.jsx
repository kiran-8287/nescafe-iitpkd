import React from 'react';
import { Home, UtensilsCrossed, ShoppingCart, Ghost } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BottomNav = ({ activeSection, onNavigate }) => {
    const { cartCount, toggleCart } = useCart();

    const navItems = [
        { id: 'hero', label: 'Home', icon: Home },
        { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
        { id: 'cart', label: 'Cart', icon: ShoppingCart, isCart: true },
        { id: 'contact', label: 'Contact', icon: Ghost },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-4 py-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.isCart) {
                                    toggleCart();
                                } else {
                                    onNavigate(item.id);
                                }
                            }}
                            className="flex flex-col items-center justify-center min-w-[64px] transition-colors relative"
                        >
                            <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#3E2723] text-white scale-110 shadow-lg' : 'text-gray-400'
                                }`}>
                                <Icon size={24} />
                                {item.isCart && cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#3E2723] text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce-subtle">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] mt-1 font-bold tracking-tight transition-colors ${isActive ? 'text-[#3E2723]' : 'text-gray-400'
                                }`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default BottomNav;
