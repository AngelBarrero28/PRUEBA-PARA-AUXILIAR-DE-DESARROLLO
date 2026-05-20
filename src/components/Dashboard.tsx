/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Transaction } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Package, 
  DollarSign, 
  Layers, 
  Calendar,
  Search,
  Filter,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  CheckCircle,
  AlertOctagon
} from 'lucide-react';

interface DashboardProps {
  products: Product[];
  transactions: Transaction[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ products, transactions, onNavigate }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('TODOS');
  const [productFilter, setProductFilter] = useState<string>('TODOS');

  // Core metrics
  const totalProducts = products.length;
  
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  
  const totalValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Totals of movements
  const totalEntradas = transactions
    .filter(t => t.type === 'ENTRADA')
    .reduce((acc, t) => acc + t.quantity, 0);

  const totalSalidas = transactions
    .filter(t => t.type === 'SALIDA')
    .reduce((acc, t) => acc + t.quantity, 0);

  const totalAjustes = transactions
    .filter(t => t.type === 'AJUSTE')
    .length;

  // Formatting utility
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Group by category for chart
  const categoryValues: { [key: string]: { value: number; stock: number; count: number } } = {};
  products.forEach(p => {
    const cat = p.category || 'Otros';
    if (!categoryValues[cat]) {
      categoryValues[cat] = { value: 0, stock: 0, count: 0 };
    }
    categoryValues[cat].value += p.stock * p.cost;
    categoryValues[cat].stock += p.stock;
    categoryValues[cat].count += 1;
  });

  const categoryList = Object.entries(categoryValues).map(([name, data]) => ({
    name,
    ...data,
    percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0
  })).sort((a, b) => b.value - a.value);

  // Search and Filter Transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'TODOS' || t.type === typeFilter;
    const matchesProduct = productFilter === 'TODOS' || t.productId === productFilter;
    return matchesSearch && matchesType && matchesProduct;
  });

  // Export to CSV simulation
  const handleExportCSV = () => {
    const headers = 'ID,Producto ID,Producto,Tipo,Cantidad,Fecha,Notas\r\n';
    const rows = filteredTransactions.map(t => 
      `"${t.id}","${t.productId}","${t.productName}","${t.type}",${t.quantity},"${t.date}","${t.notes.replace(/"/g, '""')}"`
    ).join('\r\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `movimientos_inventario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section with Hero */}
      <div className="bg-gradient-to-r from-amber-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
          <Package size={320} />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-amber-500/20 text-amber-300 font-medium text-xs px-3 py-1 rounded-full border border-amber-500/30">
              Bogotá, D.C.
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 font-medium text-xs px-3 py-1 rounded-full border border-emerald-500/30">
              Goticas de Aceite S.A.
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight mb-2">
            Control de Inventario General
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Consulte en tiempo real el stock, valor comercialization y movimientos de entradas, salidas y ajustes de materias primas e insumos oleoquímicos.
          </p>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost card */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium text-xs tracking-wider uppercase">Costo del Inventario</span>
            <div className="p-2.5 bg-amber-50 rounded-lg text-amber-700">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              {formatCOP(totalValue)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">Activo Financiero</span>
              <span>valorizado en bodega</span>
            </div>
          </div>
        </div>

        {/* Total Units card */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium text-xs tracking-wider uppercase">Total de Unidades</span>
            <div className="p-2.5 bg-sky-50 rounded-lg text-sky-700">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              {totalStock.toLocaleString()}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span className="text-slate-700 font-semibold">{totalProducts} referencias</span>
              <span>activas registradas</span>
            </div>
          </div>
        </div>

        {/* Low stock alerts */}
        <div className={`p-6 rounded-xl shadow-xs border flex flex-col justify-between transition ${
          lowStockProducts.length > 0 
            ? 'bg-red-50/70 border-red-200 text-red-900 hover:bg-red-50' 
            : 'bg-white border-slate-100 hover:shadow-md'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`font-medium text-xs tracking-wider uppercase ${lowStockProducts.length > 0 ? 'text-red-700' : 'text-slate-500'}`}>
              Alertas de Stock Bajo
            </span>
            <div className={`p-2.5 rounded-lg ${lowStockProducts.length > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-50 text-slate-600'}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl md:text-3xl font-bold tracking-tight ${lowStockProducts.length > 0 ? 'text-red-700' : 'text-slate-800'}`}>
              {lowStockProducts.length}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              {lowStockProducts.length > 0 ? (
                <>
                  <span className="font-semibold text-red-700">Acción Requerida:</span>
                  <button onClick={() => onNavigate('productos')} className="underline font-medium hover:text-red-800 transition">Ver críticos</button>
                </>
              ) : (
                <span className="text-slate-500">Todas las referencias estables</span>
              )}
            </div>
          </div>
        </div>

        {/* Global movements ratio */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium text-xs tracking-wider uppercase">Relación Entradas / Salidas</span>
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-700">
              <ArrowRightLeft size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-600">+{totalEntradas}</span>
              <span className="text-slate-300">/</span>
              <span className="text-xl font-bold text-red-500">-{totalSalidas}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Historial acumulado de transferencias
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category breakdown visual design */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-sans text-slate-800 flex items-center gap-2">
                <Layers size={18} className="text-amber-500" />
                Valor por Categoría
              </h2>
              <span className="text-xs font-mono text-slate-400">Distribución %</span>
            </div>
            
            <div className="space-y-4 my-2">
              {categoryList.map((cat, idx) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        idx === 0 ? 'bg-amber-500' :
                        idx === 1 ? 'bg-emerald-600' :
                        idx === 2 ? 'bg-sky-500' :
                        idx === 3 ? 'bg-purple-500' : 'bg-slate-400'
                      }`} />
                      {cat.name}
                    </span>
                    <span className="font-mono text-slate-600 font-medium">
                      {formatCOP(cat.value)} <span className="text-[10px] text-slate-400">({cat.percentage.toFixed(1)}%)</span>
                    </span>
                  </div>
                  
                  {/* custom SVG horizontal stacked bar as single indicator progress */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-amber-500' :
                        idx === 1 ? 'bg-emerald-600' :
                        idx === 2 ? 'bg-sky-500' :
                        idx === 3 ? 'bg-purple-500' : 'bg-slate-400'
                      }`} 
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 px-1">
                    <span>{cat.count} Ref.</span>
                    <span>{cat.stock.toLocaleString()} unidades</span>
                  </div>
                </div>
              ))}

              {categoryList.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No hay categorías registradas en bodega.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Goticas de Aceite Bogotá</span>
            <span>Refinería Central</span>
          </div>
        </div>

        {/* Big Movements Feed / Detailed Table */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 rounded-lg text-amber-700">
                <ArrowRightLeft size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold font-sans text-slate-800">Historial de Operaciones</h2>
                <p className="text-xs text-slate-500">Auditoría detallada de flujos físicos y financieros</p>
              </div>
            </div>
            
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition self-start"
            >
              <Download size={14} />
              Exportar CSV
            </button>
          </div>

          {/* Search/Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por ID, nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-1 hidden sm:inline">Tipo:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 py-1.5 px-2 rounded-md text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="TODOS">Todos los Flujos</option>
                <option value="ENTRADA">Entradas (+)</option>
                <option value="SALIDA">Salidas (-)</option>
                <option value="AJUSTE">Ajustes (±)</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-1 hidden sm:inline">Producto:</span>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 py-1.5 px-2 rounded-md text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="TODOS">Todas Referencias</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name.substring(0, 20)}...</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto rounded-lg border border-slate-100 max-h-[340px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3 text-center">Operación</th>
                  <th className="p-3 text-right">Cantidad</th>
                  <th className="p-3 hidden md:table-cell">Comentarios / Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-500 font-mono whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      <div>{tx.productName}</div>
                      <span className="text-[10px] bg-slate-100 text-slate-500 rounded-sm px-1.5 py-0.5 font-mono">{tx.productId}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        tx.type === 'ENTRADA' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        tx.type === 'SALIDA' ? 'bg-red-50 text-red-600 border border-red-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {tx.type === 'ENTRADA' && <ArrowUpRight size={12} />}
                        {tx.type === 'SALIDA' && <ArrowDownRight size={12} />}
                        {tx.type === 'AJUSTE' && <ArrowRightLeft size={12} />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold font-mono">
                      <span className={tx.type === 'ENTRADA' ? 'text-emerald-600' : tx.type === 'SALIDA' ? 'text-red-500' : 'text-amber-600'}>
                        {tx.type === 'ENTRADA' ? '+' : tx.type === 'SALIDA' ? '-' : '±'}
                        {tx.quantity} <span className="text-[10px] font-normal text-slate-400">UND</span>
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 max-w-xs truncate hidden md:table-cell">
                      {tx.notes}
                    </td>
                  </tr>
                ))}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Ninguna transferencia coincide con la búsqueda o filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Critical Stock Notification Box */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <AlertOctagon size={24} />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-sm">Alerta de Abastecimiento Crítico</h4>
              <p className="text-xs text-amber-700 mt-1">
                Hay {lowStockProducts.length} producto(s) en bodega cuyo stock disponible es inferior o igual a la cantidad de reserva mínima. Recomendamos programar un ingreso pronto.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockProducts.map(p => (
                  <span key={p.id} className="text-[10px] bg-amber-100 text-amber-950 font-medium px-2 py-0.5 rounded border border-amber-300">
                    {p.name}: {p.stock} / {p.minStock} {p.unit}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('entradas')}
            className="text-xs font-bold leading-none bg-amber-800 text-white px-4 py-2.5 rounded-lg hover:bg-amber-900 transition whitespace-nowrap"
          >
            Surtir Bodega
          </button>
        </div>
      )}
    </div>
  );
}
