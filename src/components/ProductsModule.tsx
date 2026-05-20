/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Transaction } from '../types';
import { CATEGORIES } from '../data/initialData';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  Tags,
  BadgeAlert,
  Info
} from 'lucide-react';

interface ProductsModuleProps {
  products: Product[];
  onCreateProduct: (newProduct: Product) => void;
  onDeleteProduct?: (id: string) => void;
}

export default function ProductsModule({ products, onCreateProduct, onDeleteProduct }: ProductsModuleProps) {
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Aceites');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [stock, setStock] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [unit, setUnit] = useState('UND');
  const [minStock, setMinStock] = useState<number>(50);
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');

  // Colombian Peso format helper
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Submit product creation
  const hSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!sku.trim() || !name.trim()) {
      setErrorMsg('Por favor complete la referencia SKU y el nombre descriptivo.');
      return;
    }

    // Check duplicate ID
    if (products.some(p => p.id.toUpperCase() === sku.trim().toUpperCase())) {
      setErrorMsg(`La referencia SKU "${sku.trim().toUpperCase()}" ya se encuentra registrada en el inventario.`);
      return;
    }

    const finalCategory = isCustomCategory ? (customCategory.trim() || 'Otros') : category;

    const newProduct: Product = {
      id: sku.trim().toUpperCase(),
      name: name.trim(),
      category: finalCategory,
      stock: Number(stock) || 0,
      cost: Number(cost) || 0,
      unit: unit,
      minStock: Number(minStock) || 0,
      description: description.trim() || 'Sin descripción detallada registrada.'
    };

    onCreateProduct(newProduct);
    
    // Reset Form
    setSku('');
    setName('');
    setCategory('Aceites');
    setCustomCategory('');
    setIsCustomCategory(false);
    setStock(0);
    setCost(0);
    setUnit('UND');
    setMinStock(50);
    setDescription('');
    setShowForm(false);
  };

  // Filtered lists
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'TODAS' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-tight text-slate-900">Catálogo de Productos & Referencias</h2>
          <p className="text-slate-500 text-xs">Cree nuevos insumos oleoresinosos, gestione stocks mínimos de seguridad y consulte fichas estandarizadas.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm hover:from-amber-700 hover:to-amber-800 transition"
        >
          <Plus size={16} />
          {showForm ? 'Cerrar Registro' : 'Registar Nuevo Producto'}
        </button>
      </div>

      {/* Creation form smoothly displayed */}
      {showForm && (
        <div className="bg-amber-50/50 border border-amber-200/60 p-6 rounded-xl shadow-xs transition-all animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-md">
              <Package size={18} />
            </div>
            <h3 className="font-bold text-amber-950 text-sm">Formulario de Alta de Producto - Goticas de Aceite</h3>
          </div>

          <form onSubmit={hSubmit} className="space-y-4">
            {errorMsg && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-xs font-semibold rounded">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Referencia Codigo / SKU *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: OLE_PAL_BID_020"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-mono uppercase"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Código único de inventario.</span>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Descriptivo del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Oleína de Palma Bidón 20 L"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Ejemplo detallado incluyendo volumen o peso.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
                {isCustomCategory ? (
                  <input
                    type="text"
                    placeholder="Escriba categoría"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                ) : (
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === 'NUEVA') {
                        setIsCustomCategory(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {CATEGORIES.filter(c => c !== 'Otros').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="NUEVA">+ Nueva Categoría...</option>
                  </select>
                )}
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-slate-400">Grupo contable</span>
                  {isCustomCategory && (
                    <button 
                      type="button" 
                      onClick={() => setIsCustomCategory(false)}
                      className="text-[10px] text-amber-700 underline font-semibold"
                    >
                      Volver a lista
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unidad de Medida</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="UND">Unidades (UND)</option>
                  <option value="KG">Kilogramos (KG)</option>
                  <option value="L">Litros (L)</option>
                  <option value="GL">Galones (GL)</option>
                  <option value="BOLS">Bolsas (BOLS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Costo Unitario Standard (COP) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="13500"
                    value={cost || ''}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 py-2 pl-6 pr-3 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Costo base por unidad.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Saldo o Stock Inicial *</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="100"
                  value={stock || ''}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Unidades físicas iniciales.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stock Mínimo (Alerta)</label>
                <input
                  type="number"
                  min="0"
                  value={minStock || ''}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Mínimo para alerta de bodega.</span>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción corta o aplicaciones</label>
                <input
                  type="text"
                  placeholder="Detalles sobre bodega, proveedor, control de temperatura..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg hover:bg-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-amber-600 text-white font-bold text-xs px-5 py-2 rounded-lg hover:bg-amber-700 transition"
              >
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog view with search and table */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100">
        
        {/* Search controls row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 py-1.5 px-3 rounded-lg w-full sm:max-w-sm">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Filtrar por SKU o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-0 text-xs w-full focus:outline-none placeholder:text-slate-400 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <Filter size={14} className="text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-200 py-1.5 px-3 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden w-full sm:w-48"
            >
              <option value="TODAS">Todas las Categorías</option>
              {Array.from(new Set(products.map(p => p.category))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product grid table */}
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4 w-28">Ref. SKU</th>
                <th className="p-4">Descripción Genérica</th>
                <th className="p-4">Categoría</th>
                <th className="p-4 text-right">Existencias</th>
                <th className="p-4 text-right">Costo Unitario</th>
                <th className="p-4 text-right">Valor Total</th>
                <th className="p-4 text-center">Estado</th>
                {onDeleteProduct && <th className="p-4 text-center w-12"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => {
                const isUnderStock = p.stock <= p.minStock;
                const finalValueOfStock = p.stock * p.cost;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-mono font-bold text-slate-900 bg-slate-50/30">
                      {p.id}
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-800 text-sm block">{p.name}</span>
                        <span className="text-[11px] text-slate-400 mt-0.5 block truncate max-w-sm">{p.description}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-100">
                        <Tags size={10} />
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold font-mono text-slate-950">
                      <div>{p.stock.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{p.unit}</span></div>
                      <span className="text-[10px] text-slate-400 font-normal">Mín. {p.minStock}</span>
                    </td>
                    <td className="p-4 text-right font-mono text-slate-600">
                      {formatCOP(p.cost)}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-slate-800">
                      {formatCOP(finalValueOfStock)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                        isUnderStock 
                          ? 'bg-red-50 text-red-600 border border-red-200' 
                          : p.stock === 0 
                            ? 'bg-slate-100 text-slate-500 border border-slate-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isUnderStock ? 'bg-red-600 animation-pulse' : p.stock === 0 ? 'bg-slate-400' : 'bg-emerald-600'}`} />
                        {isUnderStock ? 'STOCK CRÍTICO' : p.stock === 0 ? 'SIN EXISTENCIAS' : 'STOCK SEGURO'}
                      </span>
                    </td>
                    {onDeleteProduct && (
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            if(window.confirm(`¿Está seguro de eliminar la referencia ${p.id}? Se purgará todo registro de existencias.`)){
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-slate-100 transition"
                          title="Eliminar del catálogo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={onDeleteProduct ? 8 : 7} className="p-12 text-center text-slate-400">
                    Ninguna referencia coincide con los filtros aplicados en el catálogo. No duden en ingresar nuevos productos arriba.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
