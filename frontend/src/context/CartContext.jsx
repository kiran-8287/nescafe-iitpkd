import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const CartContext = createContext();

const initialState = {
    items: [],
    isCartOpen: false,
};

// Retrieve state from localStorage
const getSavedState = () => {
    const saved = localStorage.getItem('nescafe_cart_state');
    return saved ? JSON.parse(saved) : initialState;
};

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItemIndex = state.items.findIndex(
                (item) =>
                    item.id === action.payload.id &&
                    JSON.stringify(item.customization) === JSON.stringify(action.payload.customization || [])
            );

            if (existingItemIndex > -1) {
                const newItems = [...state.items];
                newItems[existingItemIndex].quantity += action.payload.quantity || 1;
                return { ...state, items: newItems };
            }

            return {
                ...state,
                items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1, customization: action.payload.customization || [] }],
            };
        }

        case 'REMOVE_ITEM': {
            const newItems = state.items.filter((item, index) => index !== action.payload.index);
            return { ...state, items: newItems };
        }

        case 'UPDATE_QUANTITY': {
            const newItems = [...state.items];
            const item = { ...newItems[action.payload.index] };
            item.quantity = Math.max(0, action.payload.quantity);

            if (item.quantity === 0) {
                newItems.splice(action.payload.index, 1);
            } else {
                newItems[action.payload.index] = item;
            }

            return { ...state, items: newItems };
        }

        case 'CLEAR_CART':
            return { ...state, items: [] };

        case 'TOGGLE_CART':
            return { ...state, isCartOpen: !state.isCartOpen };

        case 'SET_CART_OPEN':
            return { ...state, isCartOpen: action.payload };

        case 'SYNC_INVENTORY': {
            const { itemId, stock, isAvailable } = action.payload;
            let changed = false;
            const newItems = state.items.map(item => {
                if (item.id === itemId) {
                    if (!isAvailable) {
                        changed = true;
                        return null; // Mark for removal
                    }
                    if (item.quantity > stock) {
                        changed = true;
                        return { ...item, quantity: stock };
                    }
                }
                return item;
            }).filter(Boolean);

            if (changed) {
                return { ...state, items: newItems };
            }
            return state;
        }

        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState, getSavedState);

    const [orderMode, setOrderMode] = React.useState('pickup'); // 'pickup' | 'delivery'
    const [hostelDetails, setHostelDetails] = React.useState({ block: '' });
    const [couponApplied, setCouponApplied] = React.useState(false);

    // Sync with localStorage
    useEffect(() => {
        localStorage.setItem('nescafe_cart_state', JSON.stringify(state));
    }, [state]);

    // Real-time Inventory Sync
    useEffect(() => {
        const syncInventory = async () => {
            if (state.items.length === 0) return;
            try {
                const itemIds = state.items.map(i => i.id);
                const { data, error } = await supabase
                    .from('items')
                    .select('id, name, stock_quantity, is_available')
                    .in('id', itemIds);

                if (error || !data) return;

                data.forEach(updatedItem => {
                    const itemInCart = state.items.find(i => i.id === updatedItem.id);
                    if (itemInCart) {
                        if (!updatedItem.is_available) {
                            toast.error(`${updatedItem.name} just sold out and was removed from your cart.`, { icon: '🚫' });
                            dispatch({ type: 'SYNC_INVENTORY', payload: { itemId: updatedItem.id, isAvailable: false } });
                        } else if (itemInCart.quantity > updatedItem.stock_quantity) {
                            toast.error(`Only ${updatedItem.stock_quantity} units of ${updatedItem.name} are left. Cart updated.`, { icon: '⏳' });
                            dispatch({ type: 'SYNC_INVENTORY', payload: { itemId: updatedItem.id, stock: updatedItem.stock_quantity, isAvailable: true } });
                        }
                    }
                });
            } catch (e) {
                console.error('Inventory sync failed:', e);
            }
        };

        const subscription = supabase
            .channel('cart-inventory-sync')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'items' }, (payload) => {
                const updatedItem = payload.new;
                const itemInCart = state.items.find(i => i.id === updatedItem.id);

                if (itemInCart) {
                    if (!updatedItem.is_available) {
                        toast.error(`${updatedItem.name} just sold out and was removed from your cart.`, { icon: '🚫' });
                        dispatch({ type: 'SYNC_INVENTORY', payload: { itemId: updatedItem.id, isAvailable: false } });
                    } else if (itemInCart.quantity > updatedItem.stock_quantity) {
                        toast.error(`Only ${updatedItem.stock_quantity} units of ${updatedItem.name} are left. Cart updated.`, { icon: '⏳' });
                        dispatch({ type: 'SYNC_INVENTORY', payload: { itemId: updatedItem.id, stock: updatedItem.stock_quantity, isAvailable: true } });
                    }
                }
            })
            .subscribe();

        // Polling fallback: Every 60 seconds
        const pollInterval = setInterval(syncInventory, 60000);

        return () => {
            supabase.removeChannel(subscription);
            clearInterval(pollInterval);
        };
    }, [state.items]);

    // Calculations based on current cart (Memoized for performance)
    const { subtotal, deliveryFee, discount, taxes, finalTotal } = React.useMemo(() => {
        const sub = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
        const dFee = orderMode === 'delivery' ? 10 : 0;
        const disc = couponApplied ? Math.floor(sub * 0.2) : 0;
        const tx = Math.floor((sub - disc) * 0.05);
        const final = sub - disc + tx + dFee;

        return {
            subtotal: sub,
            deliveryFee: dFee,
            discount: disc,
            taxes: tx,
            finalTotal: final
        };
    }, [state.items, orderMode, couponApplied]);

    const value = {
        cartItems: state.items,
        isCartOpen: state.isCartOpen,
        cartTotal: subtotal,
        cartCount: state.items.reduce((count, item) => count + item.quantity, 0),

        // Advanced States
        orderMode,
        setOrderMode,
        hostelDetails,
        setHostelDetails,
        couponApplied,
        setCouponApplied,

        // Calculated Bill Details
        billDetails: {
            subtotal,
            deliveryFee,
            discount,
            taxes,
            finalTotal
        },

        addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
        removeItem: (index) => dispatch({ type: 'REMOVE_ITEM', payload: { index } }),
        updateQuantity: (index, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } }),
        clearCart: () => {
            dispatch({ type: 'CLEAR_CART' });
            setCouponApplied(false);
            setOrderMode('pickup');
            setHostelDetails({ block: '' });
        },
        toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
        setCartOpen: (isOpen) => dispatch({ type: 'SET_CART_OPEN', payload: isOpen }),
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
