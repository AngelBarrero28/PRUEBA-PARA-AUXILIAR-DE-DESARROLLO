/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Transaction } from '../types';

// Inventario con Saldo Inicial antes de los movimientos requeridos
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'ACE_PAL_NAL_001',
    name: 'Aceite de Palma Balde 5L',
    category: 'Aceites',
    stock: 550, // 500 inicial + 50 ingreso
    cost: 13500,
    unit: 'UND',
    description: 'Aceite de palma de producción nacional en presentación de balde de 5 litros.',
    minStock: 80,
  },
  {
    id: 'MAR_SUA_ESP_001',
    name: 'Caja Margarina Suave Especial 15 KG',
    category: 'Margarinas',
    stock: 1350, // 1200 inicial + 150 ingreso
    cost: 87500,
    unit: 'UND',
    description: 'Margarina suave formulación especial para panadería y repostería en caja de 15 KG.',
    minStock: 150,
  },
  {
    id: 'SEB_NAL_001',
    name: 'Sebo refinado Balde 3 KG',
    category: 'Grasas',
    stock: 780, // 800 inicial - 20 salida
    cost: 27500,
    unit: 'UND',
    description: 'Sebo de origen animal refinado de alta calidad en baldes de 3 kilogramos.',
    minStock: 100,
  },
  {
    id: 'EST_HDR_IMP_001',
    name: 'Estearina Hidrogenada bolsa 1 KG',
    category: 'Estearinas',
    stock: 3000,
    cost: 8500,
    unit: 'UND',
    description: 'Estearina hidrogenada de origen vegetal importada para endurecimiento de grasas y cerería.',
    minStock: 400,
  },
  {
    id: 'OLE_PAL_BID_020',
    name: 'Oleína de Palma Bidón 20 L',
    category: 'Aceites',
    stock: 250, // Llegó el 08/03/2025 como nuevo producto. Le adjudicamos stock inicial de 250 UND
    cost: 115000,
    unit: 'UND',
    description: 'Oleína de palma libre de grasas trans en bidones industriales de 20 litros.',
    minStock: 50,
  }
];

// Movimientos iniciales obligatorios del planteamiento
export const INITIAL_TRANSACTIONS: Transaction[] = [
  // 1: El 01/01/2025 ingresó 50 UND de Aceite de Palma Balde 5L
  {
    id: 'TX_INIT_001',
    productId: 'ACE_PAL_NAL_001',
    productName: 'Aceite de Palma Balde 5L',
    type: 'ENTRADA',
    quantity: 50,
    date: '2025-01-01',
    notes: 'Ingreso inicial por requerimiento histórico del 01/01/2025.',
    costBefore: 13500,
    costAfter: 13500,
  },
  // 2: El 08/01/2025 salió 20 UND de Sebo refinado Balde 3 KG
  {
    id: 'TX_INIT_002',
    productId: 'SEB_NAL_001',
    productName: 'Sebo refinado Balde 3 KG',
    type: 'SALIDA',
    quantity: 20,
    date: '2025-01-08',
    notes: 'Despacho de stock de sebo refinado de 3 KG según reporte de salida.',
    costBefore: 27500,
    costAfter: 27500,
  },
  // 3: EL 13/02/2025 ingresaron 150 UND de Caja Margarina Suave Especial 15 KG
  {
    id: 'TX_INIT_003',
    productId: 'MAR_SUA_ESP_001',
    productName: 'Caja Margarina Suave Especial 15 KG',
    type: 'ENTRADA',
    quantity: 150,
    date: '2025-02-13',
    notes: 'Ingreso masivo para renovación de bodega.',
    costBefore: 87500,
    costAfter: 87500,
  },
  // 4: El 08/03/2025 llegó un producto nuevo llamado “Oleína de Palma Bidón 20 L”
  {
    id: 'TX_INIT_004',
    productId: 'OLE_PAL_BID_020',
    productName: 'Oleína de Palma Bidón 20 L',
    type: 'ENTRADA',
    quantity: 250,
    date: '2025-03-08',
    notes: 'Lanzamiento e ingreso de stock por llegada de nuevo producto "Oleína de Palma Bidón 20 L".',
    costBefore: 115000,
    costAfter: 115000,
  }
];

export const CATEGORIES = [
  'Aceites',
  'Margarinas',
  'Grasas',
  'Estearinas',
  'Oleínas',
  'Otros'
];
