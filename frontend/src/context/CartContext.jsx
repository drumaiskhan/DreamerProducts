import { createContext, useContext, useEffect, useReducer } from 'react';

const CartContext = createContext();

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const idx = state.findIndex(i => i.product.id === action.product.id);
      if (idx > -1) {
        return state.map((i, n) => n === idx ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...state, { product: action.product, quantity: 1 }];
    }
    case 'REMOVE':
      return state.filter(i => i.product.id !== action.id);
    case 'SET_QTY':
      return state.map(i => i.product.id === action.id
        ? { ...i, quantity: Math.max(1, action.qty) } : i);
    case 'CLEAR':
      return [];
    case 'REPLACE':
      return action.items;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], () => {
    try { return JSON.parse(localStorage.getItem('dp_cart') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('dp_cart', JSON.stringify(items));
  }, [items]);

  // Sync cart badge if popup window changes cart
  useEffect(() => {
    function onStorage(e) {
      if (e.key !== 'dp_cart') return;
      try {
        const updated = JSON.parse(e.newValue || '[]');
        dispatch({ type: 'REPLACE', items: updated });
      } catch {}
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, count, total,
      addToCart: (p) => dispatch({ type: 'ADD', product: p }),
      removeFromCart: (id) => dispatch({ type: 'REMOVE', id }),
      setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
