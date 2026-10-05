export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface UserProfile {
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
}

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface InventoryItem {
  id: string; // Unique UUID / Item ID
  sku: string; // Stock Keeping Unit
  name: string;
  category: string;
  quantity: number;
  minThreshold: number;
  unitPrice: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  status: StockStatus;
  rowIndex?: number; // 1-based row index in Google Sheet for direct updates
}

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  timestamp: string;
  itemId: string;
  sku: string;
  itemName: string;
  type: MovementType;
  quantityChanged: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  performedBy: string;
}

export interface LowStockAlert {
  itemId: string;
  sku: string;
  name: string;
  category: string;
  currentQuantity: number;
  minThreshold: number;
  severity: 'CRITICAL' | 'WARNING';
}

export interface SheetConfig {
  spreadsheetId: string;
  spreadsheetTitle: string;
  inventorySheetId?: number;
  movementsSheetId?: number;
}
