/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Transaction, ADJUSTMENT_REASONS } from '../types';
import { 
  ArrowRightLeft, 
  Settings, 
  History, 
  HelpCircle, 
  AlertOctagon, 
  PlusCircle, 
  MinusCircle,
  FileText
} from 'lucide-react';

interface AdjustmentsModuleProps {
  products: Product[];
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

export default function AdjustmentsModule({ products, transactions, onAddTransaction }: AdjustmentsModuleProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [reasonValue, setReasonValue] = useState('FALTANTE_INVENTARIO');
  const [quantity, setQuantity] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedReason = ADJUSTMENT_REASONS.find(r => r.value === reasonValue)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!selectedProductId) {
      setErrorMsg('Por favor seleccione un producto para ajustar.');
      return;
    }
    if (quantity <= 0) {
      setErrorMsg('La cantidad de ajuste debe ser un valor entero positivo mayor a cero.');
      return;
    }
    if (!notes.trim() || notes.trim().length < 5) {
      setErrorMsg('Por favor escriba un motivo justificable de ajuste conciso (mínimo 5 caracteres) para el historial contable.');
      return;
    }
    if (!date) {
      setErrorMsg('Por favor suministre la fecha reglamentaria de la conciliación.');
      return;
    }

    const prod = products.find(p => p.id === selectedProductId)!;

    // If negative adjustment, ensure stock doesn't drop below 0
    if (selectedReason.sign === -1 && quantity > prod.stock) {
      setErrorMsg(`Ajuste Rechazado. No se puede deducir un ajuste por merma de ${quantity} ${prod.unit} ya que el stock disponible es solo de ${prod.stock} ${prod.unit}.`);
      return;
    }

    // Adjustments may be positive or negative, but we store the absolute quantity and let the transaction type represent ADJUSTMENT.
    // However, when updating the stock, we will multiply by selectedReason.sign in the main App state. We will specify that clearly.
    // Wait, let's keep txData quantity positive, but we can make sure its notes record the sign.
    const finalQuantity = selectedReason.sign * quantity;

    const txData: Omit<Transaction, 'id'> = {
      productId: prod.id,
      productName: prod.name,
      type: 'AJUSTE',
      quantity: finalQuantity, // Store positive or negative directly based on adjustment direction so App.tsx can just add it! Great design.
      date: date,
      notes: `[Motivo Contable: ${selectedReason.label}] - ${notes.trim()}`,
      costBefore: prod.cost,
      costAfter: prod.cost
    };

    onAddTransaction(txData);

    setSuccessMsg(`¡Ajuste de Auditoría Aplicado! El saldo de ${prod.name} ha sido conciliado por un factor de ${finalQuantity > 0 ? '+' : ''}${finalQuantity} unidades.`);
    
    // Reset forms
    setQuantity(0);
    setNotes('');
  };

  const adjustmentHistory = transactions.filter(t => t.type === 'AJUSTE');

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-slate-800">
      
      {/* Dynamic Adjustment Form */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-xs border border-slate-100 h-fit">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
            <ArrowRightLeft size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Conciliaciones & Ajustes</h3>
            <p className="text-[11px] text-slate-400">Regularizar desfases en el inventario</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-2.5 text-xs font-semibold rounded mb-3">
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
            <label className="block text-xs font-bold text-slate-600 mb-1">Producto a Ajustar *</label>
            <select
              required
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setQuantity(0);
              }}
              className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="">-- Seleccionar de Bodega --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.id}] - Stock Actual: {p.stock}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Motivo o Tipo de Ajuste *</label>
            <select
              value={reasonValue}
              onChange={(e) => setReasonValue(e.target.value)}
              className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
            >
              {ADJUSTMENT_REASONS.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label}
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
                placeholder="Cantidad"
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Fecha Ajuste *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {selectedProduct && (
            <div className="p-3 bg-amber-50/40 border border-amber-200/50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px]">Acción física:</span>
                <span className="font-bold flex items-center gap-1">
                  {selectedReason.sign === 1 ? (
                    <span className="text-emerald-700 flex items-center gap-1"><PlusCircle size={14} /> Incrementar stock</span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1"><MinusCircle size={14} /> Reducir stock</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px]">Stock Proyectado:</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedProduct.stock} {selectedReason.sign === 1 ? '+' : '-'} {quantity} = {selectedProduct.stock + (selectedReason.sign * quantity)} {selectedProduct.unit}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Justificación del Auditor contable (Mínimo 5 letras) *</label>
            <textarea
              rows={3}
              required
              placeholder="Describa el por qué de esta alteración física. Ej: Rotura de balde al descargar camión en andén..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedProductId}
            className="w-full bg-amber-600 text-white font-bold text-xs py-2 rounded-lg hover:bg-amber-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Someter Ajuste Contcontable
          </button>
        </form>
      </div>

      {/* Adjustments audit list history */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-xs border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-50 rounded-lg text-slate-700">
              <History size={18} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Historial de Ajustes de Auditoría</h3>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-500 rounded px-2 py-0.5 font-bold uppercase">{adjustmentHistory.length} Auditorías</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Referencia</th>
                <th className="p-3 text-right">Variación</th>
                <th className="p-3 text-right">Valorización de Impacto</th>
                <th className="p-3">Detalle & Justificaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adjustmentHistory.map(tx => {
                const isPositive = tx.quantity > 0;
                const unitCost = tx.costBefore || 0;
                const impactTotal = Math.abs(tx.quantity * unitCost);

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3 font-mono text-slate-500">{tx.date}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800 break-words">{tx.productName}</span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.productId}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      <span className={isPositive ? 'text-emerald-700' : 'text-red-500'}>
                        {isPositive ? '+' : ''}{tx.quantity.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      <div className={isPositive ? 'text-emerald-700' : 'text-red-500'}>
                        {isPositive ? '+' : '-'}{formatCOP(impactTotal)}
                      </div>
                      <span className="text-[10px] text-slate-400">c/u: {formatCOP(unitCost)}</span>
                    </td>
                    <td className="p-3 text-slate-500 text-xs italic" title={tx.notes}>
                      {tx.notes}
                    </td>
                  </tr>
                );
              })}

              {adjustmentHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    No se han reportado o aplicado conciliaciones manuales de inventario durante el período de vigencia de auditoría.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-2 text-xs">
          <HelpCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-slate-500 leading-relaxed">
            Las conciliaciones de auditoría permiten sanear las brechas lógicas entre la hoja de existencia digital de Goticas de Aceite Bogotá y los conteos de báscula reales de la refinería. Cada ajuste registra un impacto directo en el cálculo contable financiero de activos totales.
          </p>
        </div>
      </div>
    </div>
  );
}
