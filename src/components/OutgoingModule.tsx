/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Transaction } from '../types';
import { 
  ArrowDownRight, 
  Calendar, 
  History, 
  FileSpreadsheet,
  AlertOctagon,
  TrendingDown,
  TrendingUp,
  Receipt
} from 'lucide-react';

interface OutgoingModuleProps {
  products: Product[];
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

export default function OutgoingModule({ products, transactions, onAddTransaction }: OutgoingModuleProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  // Selected product details
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Monitor stock limit live
  const handleQuantityChange = (val: number) => {
    setQuantity(val);
    setWarningMsg('');
    
    if (selectedProduct && val > selectedProduct.stock) {
      setWarningMsg(`Alerta: La cantidad ingresada (${val}) supera las existencias físicas actuales (${selectedProduct.stock} ${selectedProduct.unit}). Esta operación causaría un saldo negativo en bodega de Bogotá.`);
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
      setErrorMsg('La cantidad a despachar debe ser un valor entero positivo mayor a cero.');
      return;
    }
    if (!date) {
      setErrorMsg('Por favor suministre la fecha reglamentaria de salida.');
      return;
    }

    const prod = products.find(p => p.id === selectedProductId)!;

    // Strict validation
    if (quantity > prod.stock) {
      setErrorMsg(`Salida Rechazada. No es posible dar de baja ${quantity} ${prod.unit} porque excede el stock actual de ${prod.stock} ${prod.unit} en bodega.`);
      return;
    }

    // Build outbound transaction
    const txData: Omit<Transaction, 'id'> = {
      productId: prod.id,
      productName: prod.name,
      type: 'SALIDA',
      quantity: Number(quantity),
      date: date,
      notes: notes.trim() || 'Salida de mercadería autorizada por despacho de Goticas de Aceite.',
      costBefore: prod.cost,
      costAfter: prod.cost // Departures make no cost adjustments implicitly
    };

    onAddTransaction(txData);

    setSuccessMsg(`¡Despacho Exitoso! Se retiraron con éxito ${quantity} unidades de la referencia: ${prod.name}.`);
    
    // Reset form states
    setQuantity(0);
    setNotes('');
    setWarningMsg('');
  };

  const outgoingHistory = transactions.filter(t => t.type === 'SALIDA');

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-slate-800">
      
      {/* Depatures Creator Form */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-xs border border-slate-100 h-fit">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <ArrowDownRight size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Registrar Salida / Despacho</h3>
            <p className="text-[11px] text-slate-400">Descontar existencias de bodega</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-2.5 text-xs font-semibold rounded mb-3">
            {errorMsg}
          </div>
        )}

        {warningMsg && (
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-2.5 text-[11px] leading-relaxed font-medium rounded mb-3">
            {warningMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-2.5 text-xs font-semibold rounded mb-3">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Producto a Despachar *</label>
            <select
              required
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setQuantity(0);
                setWarningMsg('');
              }}
              className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs focus:ring-1 focus:ring-red-500 focus:outline-hidden"
            >
              <option value="">-- Seleccionar de Bodega --</option>
              {products.map(p => (
                <option key={p.id} value={p.id} disabled={p.stock === 0}>
                  {p.name} [{p.id}] - Stock: {p.stock} {p.stock === 0 ? '(AGOTADO)' : ''}
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
                disabled={!selectedProductId}
                placeholder={selectedProduct ? `Disp: ${selectedProduct.stock}` : "Seleccione"}
                value={quantity || ''}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs focus:ring-1 focus:ring-red-500 focus:outline-hidden font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Fecha de Salida *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs focus:ring-1 focus:ring-red-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {selectedProduct && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-500 text-[11px]">Existencias de referencia:</span>
                <span className="font-mono font-bold text-slate-800">{selectedProduct.stock} {selectedProduct.unit}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-500 text-[11px]">Valor estimado de salida:</span>
                <span className="font-mono font-bold text-red-600">{formatCOP(quantity * selectedProduct.cost)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Cliente / Destinatario / Detalle</label>
            <textarea
              rows={3}
              placeholder="Ej: Despacho a Repostería Don Tulio SAS, orden de entrega #OE-4809..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs placeholder:text-slate-400 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedProductId || (selectedProduct !== undefined && selectedProduct.stock === 0)}
            className="w-full bg-red-600 text-white font-bold text-xs py-2 rounded-lg hover:bg-red-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Confirmar Despacho
          </button>
        </form>
      </div>

      {/* Outbound Logs History list */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-50 rounded-lg text-slate-700">
                <History size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Historial de Salidas (Despachos)</h3>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-500 rounded px-2 py-0.5 font-bold uppercase">{outgoingHistory.length} Registros</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Referencia</th>
                  <th className="p-3 text-right">Cantidad Saliente</th>
                  <th className="p-3 text-right">Valorización del Costo</th>
                  <th className="p-3">Destinatario / Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {outgoingHistory.map(tx => {
                  const unitCost = tx.costBefore || tx.costAfter || 0;
                  const totalDepartureVal = tx.quantity * unitCost;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-mono text-slate-500">{tx.date}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-800 break-words">{tx.productName}</span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.productId}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-red-500">
                        -{tx.quantity.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        <div>{formatCOP(totalDepartureVal)}</div>
                        <span className="text-[10px] text-slate-400">c/u: {formatCOP(unitCost)}</span>
                      </td>
                      <td className="p-3 text-slate-500 text-xs italic truncate max-w-xs" title={tx.notes}>
                        {tx.notes}
                      </td>
                    </tr>
                  );
                })}

                {outgoingHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400">
                      No se han registrado despachos adicionales de mercadería en este periodo. Suministre las salidas autorizadas en el asistente lateral.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 bg-red-50/30 p-3.5 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="text-red-700" size={18} />
            <span className="text-[11px] font-bold text-red-950">Gran Total Costos de Mercancía Despachada (Salidas):</span>
          </div>
          <span className="font-mono font-bold text-sm text-red-900">
            {formatCOP(outgoingHistory.reduce((acc, t) => acc + (t.quantity * (t.costBefore || 0)), 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
