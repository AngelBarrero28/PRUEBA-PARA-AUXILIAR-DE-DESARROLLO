/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Transaction } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  FolderSync, 
  HelpCircle, 
  CheckCircle2, 
  Calculator, 
  Settings,
  Scale,
  DollarSignIcon
} from 'lucide-react';

interface CostsModuleProps {
  products: Product[];
  onUpdateProductCost: (id: string, newCost: number) => void;
}

export default function CostsModule({ products, onUpdateProductCost }: CostsModuleProps) {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [tempCostValue, setTempCostValue] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Bulk cost simulation multiplier
  const [simulationPercent, setSimulationPercent] = useState<number>(0);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleStartEdit = (p: Product) => {
    setEditingProductId(p.id);
    setTempCostValue(p.cost);
    setSuccessMessage('');
  };

  const handleSaveCost = (productId: string) => {
    if (tempCostValue < 0) {
      alert('El costo no puede ser un valor negativo.');
      return;
    }
    onUpdateProductCost(productId, Number(tempCostValue));
    setEditingProductId(null);
    setSuccessMessage(`Se ha editado el costo unitario de la referencia ${productId} a ${formatCOP(tempCostValue)} de manera exitosa.`);
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  // Calculations for current Assets
  const totalAssetsWorth = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
  const totalUnitsInStock = products.reduce((acc, p) => acc + p.stock, 0);
  const averageUnitCostAcrossInventory = totalUnitsInStock > 0 ? (totalAssetsWorth / totalUnitsInStock) : 0;

  // Most valuable reference in asset worth
  const mostValuableProduct = [...products].sort((a,b) => (b.stock*b.cost) - (a.stock*a.cost))[0];

  // Simulation calculations
  const simMultiplier = 1 + (simulationPercent / 100);
  const simulatedAssetsWorth = products.reduce((acc, p) => acc + (p.stock * (p.cost * simMultiplier)), 0);
  const priceDifference = simulatedAssetsWorth - totalAssetsWorth;

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold font-sans tracking-tight text-slate-900">Módulo de Costos & Simulación de Activos</h2>
        <p className="text-slate-500 text-xs">Administre valores unitarios, calcule el valor patrimonial total de bodegas y simule fluctuación de precios de mercado internacional.</p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="text-emerald-600 shrink-0" size={16} />
          {successMessage}
        </div>
      )}

      {/* Grid Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total portfolio wealth */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Valor Patrimon-Inventario</span>
            <DollarSign className="text-amber-600" size={16} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-mono">
            {formatCOP(totalAssetsWorth)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Suma acumulativa de stock * costo unitario activo.</p>
        </div>

        {/* average item cost */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Costo Unitario Promedio</span>
            <Scale className="text-emerald-700" size={16} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-mono">
            {formatCOP(averageUnitCostAcrossInventory)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Costo ponderado de todos los artículos físicos en bodega.</p>
        </div>

        {/* Major SKU item */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase mb-2">
            <span>SKU con Mayor Peso Financiero</span>
            <TrendingUp className="text-sky-600" size={16} />
          </div>
          {mostValuableProduct ? (
            <div>
              <h3 className="text-sm font-bold text-slate-800 truncate" title={mostValuableProduct.name}>
                {mostValuableProduct.name}
              </h3>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                Valor: <strong className="font-mono text-amber-700">{formatCOP(mostValuableProduct.stock * mostValuableProduct.cost)}</strong>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Ningún producto en catálogo</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main interactive product price manager */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Calculator size={16} className="text-amber-600" />
            Control de Costos Unitarios Base (Standard Costing)
          </h3>

          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3">Ref. ID</th>
                  <th className="p-3">Descripción de Producto</th>
                  <th className="p-3 text-right">Existencias</th>
                  <th className="p-3 text-right w-44">Costo Unitario (COP)</th>
                  <th className="p-3 text-right">Valorizado Global</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3 font-mono font-bold text-slate-500">{p.id}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800 block">{p.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{p.category}</span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">{p.stock.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono">
                      {editingProductId === p.id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-[10px] text-slate-400">$</span>
                          <input
                            type="number"
                            min="0"
                            value={tempCostValue || ''}
                            onChange={(e) => setTempCostValue(Number(e.target.value))}
                            className="bg-white border border-slate-200 py-1 px-1.5 rounded text-xs font-mono w-28 text-right focus:border-amber-500 focus:outline-hidden"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-900 font-bold">{formatCOP(p.cost)}</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-700">
                      {formatCOP(p.stock * p.cost)}
                    </td>
                    <td className="p-3 text-center">
                      {editingProductId === p.id ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleSaveCost(p.id)}
                            className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-bold hover:bg-emerald-700 transition"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingProductId(null)}
                            className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold hover:bg-slate-300 transition"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="text-amber-700 h-6 px-2 border border-amber-500/30 hover:bg-amber-50 rounded text-[10px] font-bold transition"
                        >
                          Modificar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost simulator tool side bar */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="text-amber-500" size={18} />
              <h3 className="font-bold text-slate-900 text-sm">Simulador de Impacto / Inflación</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Ajuste el porcentaje para simular el impacto en el valor patrimonial del inventario frente a variaciones de tarifas aduaneras, inflación anual en Colombia de costos o incrementos decretados de insumos.
            </p>

            <div className="space-y-4 my-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Variación Porcentual:</span>
                  <span className={`${simulationPercent > 0 ? 'text-emerald-700 font-bold' : simulationPercent < 0 ? 'text-red-500 font-bold' : 'text-slate-600'}`}>
                    {simulationPercent > 0 ? '+' : ''}{simulationPercent}%
                  </span>
                </div>
                
                <input
                  type="range"
                  min="-30"
                  max="50"
                  value={simulationPercent}
                  onChange={(e) => setSimulationPercent(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Deflación (-30%)</span>
                  <span>Normal (0%)</span>
                  <span>Subida (+50%)</span>
                </div>
              </div>

              {/* Side-by-side graphic bar comparison */}
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg space-y-2.5">
                <div className="text-xs">
                  <span className="text-slate-500 block">Valorización Base Real:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{formatCOP(totalAssetsWorth)}</span>
                </div>
                
                <div className="text-xs">
                  <span className="text-slate-500 block">Valorización Proyectada:</span>
                  <span className="font-mono font-bold text-amber-900 text-sm">{formatCOP(simulatedAssetsWorth)}</span>
                </div>
                
                <div className="pt-2 border-t border-slate-200 text-xs flex justify-between">
                  <span className="text-slate-500">Impacto Neto:</span>
                  <span className={`font-mono font-bold ${priceDifference > 0 ? 'text-emerald-700' : priceDifference < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                    {priceDifference > 0 ? '+' : ''}{formatCOP(priceDifference)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-400">
            <HelpCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
            <span>Este simulador es un modelo presupuestario para cálculos de margen; no altera permanentemente los costos históricos base de la bodega.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
