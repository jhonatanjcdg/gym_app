import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  CreditCard,
  Wallet,
  AlertCircle,
  Package,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { Product, CartItem, PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const PosView: React.FC = () => {
  const { products, sellProducts, members } = useGym();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia / Nequi / Daviplata');
  const [customerName, setCustomerName] = useState<string>('');
  const [cashGiven, setCashGiven] = useState<number>(0);

  const categories = ['Todos', 'Suplementos', 'Bebidas', 'Snacks', 'Accesorios'];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Cannot exceed stock
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCashGiven(0);
    setCustomerName('');
  };

  // Totals
  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const changeDue = Math.max(0, cashGiven - totalAmount);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;

    sellProducts(cart, paymentMethod, customerName.trim() || undefined);
    clearCart();
  };

  // Low stock products warning
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-neon-cyan">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Punto de Venta & Tienda (Mini-POS)
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {products.length} productos
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Venta rápida de suplementos, hidratación y accesorios con sincronización inmediata a la caja diaria.
            </p>
          </div>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{lowStockProducts.length} productos con stock bajo</span>
          </div>
        )}
      </div>

      {/* Main Grid: Products (7 cols) + Cart Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Products Showcase (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filters & Search */}
          <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por producto, marca o código SKU..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-dark-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-dark-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.map(product => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock <= product.minStock;

              return (
                <div
                  key={product.id}
                  className={`bg-dark-900 border rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 ${
                    isOutOfStock
                      ? 'border-slate-800 opacity-60'
                      : 'border-slate-800/80 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&q=80&w=200'}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0 bg-dark-950"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                          {product.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{product.sku}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-0.5 leading-snug line-clamp-2">
                        {product.name}
                      </h4>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isOutOfStock
                              ? 'bg-rose-500/20 text-rose-400'
                              : isLowStock
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {isOutOfStock ? 'Agotado' : `${product.stock} disponibles`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-sm font-black text-white font-mono">
                      {formatCurrency(product.price)}
                    </span>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                        isOutOfStock
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-dark-950'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Shopping Cart & Checkout (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between sticky top-20">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Ticket de Venta POS</h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vaciar</span>
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {cart.length > 0 ? (
                  cart.map(item => (
                    <div
                      key={item.product.id}
                      className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-white block truncate">{item.product.name}</span>
                        <span className="text-[11px] font-mono text-cyan-400">
                          {formatCurrency(item.product.price)} c/u
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-dark-900 border border-slate-700 rounded-lg">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono font-bold text-white text-xs">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-mono font-bold text-white min-w-[70px] text-right">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                    <Package className="w-8 h-8 text-slate-700" />
                    <span>El carrito está vacío. Agrega productos de la tienda.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Checkout Form */}
            {cart.length > 0 && (
              <form onSubmit={handleCheckout} className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                {/* Total Display */}
                <div className="p-3 rounded-xl bg-dark-950 border border-cyan-500/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total a Pagar:</span>
                  <span className="text-xl font-black text-cyan-400 font-mono">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                {/* Customer name (optional) */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Cliente / Socio (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Carlos Mendoza"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                    Método de Pago
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'Efectivo', label: 'Efectivo', icon: <DollarSign className="w-3.5 h-3.5" /> },
                      { id: 'Transferencia / Nequi / Daviplata', label: 'Nequi / Transf', icon: <Wallet className="w-3.5 h-3.5" /> },
                      { id: 'Tarjeta', label: 'Tarjeta', icon: <CreditCard className="w-3.5 h-3.5" /> },
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center transition-all ${
                          paymentMethod === m.id
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                            : 'border-slate-800 bg-dark-950 text-slate-400'
                        }`}
                      >
                        {m.icon}
                        <span className="mt-1 truncate max-w-full">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Change Calculator */}
                {paymentMethod === 'Efectivo' && (
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-dark-950 border border-slate-800">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Paga con:</label>
                      <input
                        type="number"
                        step="1000"
                        value={cashGiven || ''}
                        onChange={e => setCashGiven(Number(e.target.value))}
                        placeholder="$0"
                        className="w-full bg-dark-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 mb-0.5">Cambio:</span>
                      <span className="font-mono font-bold text-emerald-400 text-xs block py-1">
                        {formatCurrency(changeDue)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-dark-950 font-extrabold text-xs shadow-neon-cyan hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Cobrar Venta & Imprimir Recibo</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
