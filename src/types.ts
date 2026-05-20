/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface Product {
  id: string; // SKU code, e.g. 'ACE_PAL_NAL_001'
  name: string;
  category: string;
  stock: number;
  cost: number; // Unit cost in COP (Colombian Peso)
  unit: string; // e.g., 'UND', 'KG', 'L'
  description?: string;
  minStock: number; // Low stock threshold for alerts
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  date: string; // YYYY-MM-DD
  notes: string;
  costBefore?: number;
  costAfter?: number;
}

export interface AdjustmentReason {
  value: string;
  label: string;
  sign: 1 | -1;
}

export const ADJUSTMENT_REASONS: AdjustmentReason[] = [
  { value: 'FALTANTE_INVENTARIO', label: 'Merma / Perdida (-)', sign: -1 },
  { value: 'SOBRANTE_INVENTARIO', label: 'Excedente de Auditoría (+)', sign: 1 },
  { value: 'DANO_TRANSPORTE', label: 'Rotura / Daño (-)', sign: -1 },
  { value: 'VENCIMIENTO', label: 'Vencimiento Terreno (-)', sign: -1 },
  { value: 'RECLASIFICACION', label: 'Ajuste Manual (+)', sign: 1 },
];
