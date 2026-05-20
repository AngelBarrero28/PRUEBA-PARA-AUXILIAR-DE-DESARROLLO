/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Transaction } from './types';
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS } from './data/initialData';

// Component imports
import Dashboard from './components/Dashboard';
import ProductsModule from './components/ProductsModule';
import IncomingModule from './components/IncomingModule';
import OutgoingModule from './components/OutgoingModule';
import AdjustmentsModule from './components/AdjustmentsModule';
import CostsModule from './components/CostsModule';

// Icon imports
import { 
  LayoutDashboard, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRightLeft, 
  Coins, 
  Droplet,
  Globe,
  Database,
  Printer
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Load from localStorage or seed defaults
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('GOTICAS_PRODUCTS_V2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading products from localStorage', e);
    }
    return INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('GOTICAS_TXS_V2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading transactions from localStorage', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  // Save changes to localStorage on any state modification
  useEffect(() => {
    localStorage.setItem('GOTICAS_PRODUCTS_V2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('GOTICAS_TXS_V2', JSON.stringify(transactions));
  }, [transactions]);

  // Handle adding a new product
  const handleCreateProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
  };

  // Optional: Handle removing a product reference
  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    // Filter transactions associated to maintain data integrity
    setTransactions(prev => prev.filter(t => t.productId !== productId));
  };

  // Handle transactions (entrada, salida, ajuste)
  const handleAddTransaction = (
    txData: Omit<Transaction, 'id'>, 
    updateProductCost?: number
  ) => {
    const rxId = `TX_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const fullTx: Transaction = {
      ...txData,
      id: rxId,
    };

    // Update transactions list
    setTransactions(prev => [fullTx, ...prev]);

    // Update products stock and option cost
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        if (prod.id === txData.productId) {
          // If transaction is incoming, we increment. If outgoing, we decrement.
          // If adjustment, txData.quantity already carries the sign (+ or -)!
          let stockModifier = txData.quantity; // default signed
          if (txData.type === 'ENTRADA') {
            stockModifier = Math.abs(txData.quantity);
          } else if (txData.type === 'SALIDA') {
            stockModifier = -Math.abs(txData.quantity);
          }

          const targetStock = prod.stock + stockModifier;

          return {
            ...prod,
            stock: targetStock < 0 ? 0 : targetStock, // Avoid negative stock levels
            cost: updateProductCost !== undefined ? updateProductCost : prod.cost
          };
        }
        return prod;
      });
    });
  };

  // Custom standard costing editing
  const handleUpdateProductCost = (id: string, newCost: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, cost: newCost };
      }
      return p;
    }));
  };

  // Helper reset routine to restore clean laboratory initial Bogota setup
  const handleResetSystem = () => {
    if (window.confirm('¿Está seguro de reiniciar los inventarios? Se restablecerá el saldo inicial básico y los 4 movimientos obligatorios del planteamiento.')) {
      setProducts(INITIAL_PRODUCTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Layout */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 shadow-lg flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Logo Brand goticas de aceite */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 rounded-xl text-amber-950 flex items-center justify-center shrink-0">
              <Droplet size={20} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider uppercase text-amber-400">Goticas de Aceite</h1>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider block">BOGOTÁ - COLOMBIA</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-amber-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard General
            </button>

            <button
              onClick={() => setActiveTab('productos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'productos'
                  ? 'bg-amber-500 text-amber-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package size={16} />
              Catálogo de Productos
            </button>

            <button
              onClick={() => setActiveTab('entradas')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'entradas'
                  ? 'bg-amber-500 text-amber-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ArrowUpRight size={16} />
              Módulo de Entradas
            </button>

            <button
              onClick={() => setActiveTab('salidas')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'salidas'
                  ? 'bg-amber-500 text-amber-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ArrowDownRight size={16} />
              Módulo de Salidas
            </button>

            <button
              onClick={() => setActiveTab('ajustes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ajustes'
                  ? 'bg-amber-500 text-amber-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ArrowRightLeft size={16} />
              Ajustes de Bodega
            </button>

            <button
              onClick={() => setActiveTab('costos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'costos'
                  ? 'bg-amber-500 text-amber-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Coins size={16} />
              Módulo de Costos
            </button>
          </nav>
        </div>

        {/* System parameters indicator footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-500 space-y-2">
          <div className="flex items-center gap-1.5">
            <Database size={12} />
            <span>Almacén: local (Persistente)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={12} />
            <span>Zona Horaria: Bogotá (COT)</span>
          </div>
          <button
            onClick={handleResetSystem}
            className="w-full mt-2 bg-slate-800 hover:bg-red-950 hover:text-red-300 font-bold text-[10px] py-1.5 rounded text-slate-300 border border-slate-700 hover:border-red-900 transition uppercase"
          >
            Refrescar / Semilla Inicial
          </button>
        </div>
      </aside>

      {/* Main content viewport block */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <Dashboard 
            products={products} 
            transactions={transactions} 
            onNavigate={(tab) => setActiveTab(tab)} 
          />
        )}
        
        {activeTab === 'productos' && (
          <ProductsModule 
            products={products} 
            onCreateProduct={handleCreateProduct} 
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'entradas' && (
          <IncomingModule 
            products={products} 
            transactions={transactions} 
            onAddTransaction={handleAddTransaction} 
          />
        )}

        {activeTab === 'salidas' && (
          <OutgoingModule 
            products={products} 
            transactions={transactions} 
            onAddTransaction={handleAddTransaction} 
          />
        )}

        {activeTab === 'ajustes' && (
          <AdjustmentsModule 
            products={products} 
            transactions={transactions} 
            onAddTransaction={handleAddTransaction} 
          />
        )}

        {activeTab === 'costos' && (
          <CostsModule 
            products={products} 
            onUpdateProductCost={handleUpdateProductCost} 
          />
        )}
      </main>
    </div>
  );
}
