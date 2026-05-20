/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Transaction } from '../types';
import { 
  ArrowUpRight, 
  Calendar, 
  FileText, 
  Plus, 
  Layers, 
  Package, 
  Activity,
  History,
  TrendingUp,
  Coins
} from 'lucide-react';

interface IncomingModuleProps {
  products: Product[];
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>, updateProductCost?: number) => void;
}

export default function IncomingModule({ products, transactions, onAddTransaction }: IncomingModuleProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  // Cost tracking options
  const [adjustCost, setAdjustCost] = useState(false);
  const [newCost, setNewCost] = useState<number>(0);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected product details helper
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Initialize selected product cost matching
  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setNewCost(prod.cost);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!selectedProductId) {
      setErrorMsg('Por favor seleccione un producto del catálogo.');
      return;
    }
    if (quantity <= 0) {
      setErrorMsg('La cantidad a ingresar debe ser un valor entero mayor a cero.');
      return;
    }
    if (!date) {
      setErrorMsg('Por favor suministre la fecha reglamentaria de la operación.');
      return;
    }

    const prod = products.find(p => p.id === selectedProductId)!;

    // Build incoming transaction
    const txData: Omit<Transaction, 'id'> = {
      productId: prod.id,
      productName: prod.name,
      type: 'ENTRADA',
      quantity: Number(quantity),
      date: date,
      notes: notes.trim() || 'Ingreso manual registrado al almacén central.',
      costBefore: prod.cost,
      costAfter: adjustCost ? Number(newCost) : prod.cost
    };

    onAddTransaction(txData, adjustCost ? Number(newCost) : undefined);

    setSuccessMsg(`¡Registro completado! Se han incorporado con éxito ${quantity} unidades a la referencia: ${prod.name}.`);
    
    // Reset inputs
    setQuantity(0);
    setNotes('');
    setAdjustCost(false);
  };

  const incomingHistory = transactions.filter(t => t.type === 'ENTRADA');

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-slate-800">
      
      {/* Inputs Form */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-xs border border-slate-100 h-fit">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
            <ArrowUpRight size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Registrar Entrada (Física)</h3>
            <p className="text-[11px] text-slate-400">Sumar stock a referencias activas</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-2 text-xs font-semibold rounded mb-3">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-2.5 text-xs font-semibold rounded mb-3">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Producto a Ingresar *</label>
            <select
              required
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="">-- Seleccionar de Bodega --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.id}] - Stock: {p.stock}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Cantidad *</label>
              <input
                type="number"
                min="1"
                required
                placeholder="Cantidad"
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Fecha Operación *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Cost Adjustment during Entry */}
          {selectedProduct && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">¿Re-evaluar costo de adquisición?</span>
                <input
                  type="checkbox"
                  checked={adjustCost}
                  onChange={(e) => {
                    setAdjustCost(e.target.checked);
                    if (selectedProduct) setNewCost(selectedProduct.cost);
                  }}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
              </div>

              {adjustCost ? (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Costo Actual:</span>
                    <span className="font-mono">{formatCOP(selectedProduct.cost)}</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700">Nuevo Costo Unitario (COP)</label>
                    <div className="relative mt-1">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs">$</span>
                      <input
                        type="number"
                        min="0"
                        value={newCost || ''}
                        onChange={(e) => setNewCost(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 py-1 px-2 pl-5 rounded text-xs focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-1.5 text-[10px] text-slate-500">
                  Se conservará el costo estándar actual: <strong className="font-mono text-slate-700">{formatCOP(selectedProduct.cost)}</strong> por unidad.
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Observaciones / Soporte (Opcional)</label>
            <textarea
              rows={3}
              placeholder="Ej: Factura Nº F-784 del distribuidor central, lote de verificación A-42..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold text-xs py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Confirmar e Ingresar
          </button>
        </form>
      </div>

      {/* Inputs History Log */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-50 rounded-lg text-slate-700">
                <History size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Historial de Entradas (Ingresos)</h3>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-500 rounded px-2 py-0.5 font-bold uppercase">{incomingHistory.length} Registros</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Referencia</th>
                  <th className="p-3 text-right">Cantidad de Ingreso</th>
                  <th className="p-3 text-right">Valorización de Compra</th>
                  <th className="p-3">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomingHistory.map(tx => {
                  const unitCost = tx.costAfter || tx.costBefore || 0;
                  const purchaseTotal = tx.quantity * unitCost;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-mono text-slate-500">{tx.date}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-800 break-words">{tx.productName}</span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.productId}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">
                        +{tx.quantity.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        <div>{formatCOP(purchaseTotal)}</div>
                        <span className="text-[10px] text-slate-400">c/u: {formatCOP(unitCost)}</span>
                      </td>
                      <td className="p-3 text-slate-500 text-xs italic truncate max-w-xs" title={tx.notes}>
                        {tx.notes}
                      </td>
                    </tr>
                  );
                })}

                {incomingHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400">
                      No se han registrado entradas adicionales de mercadería en este período. Use el panel lateral para dar ingresos de stock.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 bg-emerald-50/30 p-3.5 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="text-emerald-700" size={18} />
            <span className="text-[11px] font-bold text-emerald-950">Gran Total Inversión en Entradas:</span>
          </div>
          <span className="font-mono font-bold text-sm text-emerald-900">
            {formatCOP(incomingHistory.reduce((acc, t) => acc + (t.quantity * (t.costAfter || t.costBefore || 0)), 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
