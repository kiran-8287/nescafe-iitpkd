import React, { createContext, useContext, useReducer, useEffect } from 'react';

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

        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState, getSavedState);

    // Sync with localStorage
    useEffect(() => {
        localStorage.setItem('nescafe_cart_state', JSON.stringify(state));
    }, [state]);

    const value = {
        cartItems: state.items,
        isCartOpen: state.isCartOpen,
        cartTotal: state.items.reduce((total, item) => total + item.price * item.quantity, 0),
        cartCount: state.items.reduce((count, item) => count + item.quantity, 0),
        addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
        removeItem: (index) => dispatch({ type: 'REMOVE_ITEM', payload: { index } }),
        updateQuantity: (index, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } }),
        clearCart: () => dispatch({ type: 'CLEAR_CART' }),
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
