export type SalesChannel = 'Amazon' | 'Flipkart' | 'Meesho' | 'Local' | 'Bulk Order';

export type ProductCategory =
  | 'Balloons'
  | 'Banners'
  | 'Frills'
  | 'D-Light'
  | 'Cork Lights'
  | 'Curtains'
  | 'Candles'
  | 'Props'
  | 'Packaging';

export type StockStatus = 'HEALTHY' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK';

export interface ChannelAllocation {
  amazon: number;
  flipkart: number;
  meesho: number;
  local: number;
  bulk: number;
  unallocated: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string; // e.g. BAL-GOLD-10
  productName: string;
  category: ProductCategory;
  variantName: string; // e.g. "Gold - 10 pcs"
  color: string;
  size: string;
  packQuantity: number;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  currentStock: number; // Physical Stock
  reservedStock: number; // Reserved for bulk orders
  damagedStock: number; // Damaged / Non-sellable
  availableStock: number; // currentStock - reservedStock - damagedStock
  lowStockThreshold: number;
  reorderLevel: number;
  reorderQuantity: number;
  supplier: string;
  storageLocation: string; // e.g. "Aisle 2 - Shelf B"
  status: StockStatus;
  imageUrl?: string;
  channelAllocation: ChannelAllocation;
  lastUpdated: string;
  // Forecasting stats
  avgDailySales: number;
  last7DaysSales: number;
  last30DaysSales: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  baseSkuPrefix: string;
  supplier: string;
  imageUrl: string;
  variants: ProductVariant[];
  createdAt: string;
}

export interface ComboComponent {
  variantId: string;
  variantSku: string;
  variantName: string;
  productName: string;
  category: ProductCategory;
  quantityRequired: number;
  unitCost: number;
}

export type ComboType = 'Fixed' | 'Custom' | 'Seasonal';

export interface ComboProduct {
  id: string;
  sku: string; // e.g. COM-BDAY-001
  name: string;
  description: string;
  theme: string; // Birthday, Anniversary, Baby Shower, Wedding, etc.
  type: ComboType;
  components: ComboComponent[];
  sellingPrice: number;
  mrp: number;
  packagingCost: number;
  totalCost: number; // sum(components * cost) + packagingCost
  profit: number; // sellingPrice - totalCost
  profitMargin: number; // (profit / sellingPrice) * 100
  imageUrl: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export type BulkOrderStatus =
  | 'Draft'
  | 'Quotation'
  | 'Confirmed'
  | 'Stock Reserved'
  | 'Processing'
  | 'Ready'
  | 'Delivered'
  | 'Cancelled';

export interface BulkOrderItem {
  variantId?: string;
  comboId?: string;
  sku: string;
  name: string;
  isCombo: boolean;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BulkOrder {
  id: string; // e.g. BLK-2026-001
  customerName: string;
  customerPhone: string;
  customerCompany?: string;
  eventDate: string;
  orderDate: string;
  status: BulkOrderStatus;
  items: BulkOrderItem[];
  subtotal: number;
  discount: number;
  advancePaid: number;
  totalAmount: number;
  notes?: string;
  stockReserved: boolean;
}

export type OrderChannel = 'Amazon' | 'Flipkart' | 'Meesho' | 'Local' | 'Bulk';

export interface SalesOrderItem {
  variantId?: string;
  comboId?: string;
  sku: string;
  name: string;
  isCombo: boolean;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesOrder {
  id: string;
  channel: OrderChannel;
  customerName: string;
  orderDate: string;
  items: SalesOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentStatus: 'Paid' | 'Pending' | 'COD' | 'Partial';
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export type TransactionType =
  | 'PURCHASE'
  | 'SALE'
  | 'COMBO_SALE'
  | 'STOCK_ADJUSTMENT'
  | 'DAMAGED'
  | 'LOST'
  | 'RETURN'
  | 'CHANNEL_TRANSFER'
  | 'BULK_ORDER_RESERVATION'
  | 'BULK_ORDER_RELEASE'
  | 'MANUAL_CORRECTION';

export interface StockMovement {
  id: string;
  timestamp: string;
  variantId: string;
  sku: string;
  productName: string;
  type: TransactionType;
  quantityChanged: number; // positive or negative
  previousQuantity: number;
  newQuantity: number;
  channel?: SalesChannel | 'Warehouse';
  referenceId?: string; // Order ID, Purchase ID, Bulk Order ID
  reason: string;
  performedBy: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  invoiceNumber: string;
  purchaseDate: string;
  variantSku: string;
  variantName: string;
  quantity: number;
  purchasePrice: number;
  totalCost: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  notes?: string;
  receivedDate?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  categoriesSupplied: ProductCategory[];
  leadTimeDays: number;
  rating: number;
  address: string;
}

export interface ReturnItem {
  id: string;
  orderId: string;
  channel: SalesChannel;
  customerName: string;
  sku: string;
  productName: string;
  quantity: number;
  reason: 'Customer Return' | 'Damaged' | 'Wrong Product' | 'Wrong Variant' | 'Marketplace Return';
  condition: 'Sellable' | 'Damaged' | 'Inspection Required';
  returnDate: string;
  actionTaken?: string;
  notes?: string;
}

export interface PackagingItem {
  id: string;
  sku: string;
  name: string;
  type: 'Box' | 'Poly Bag' | 'Tape' | 'Sticker' | 'Bubble Wrap' | 'Courier Bag' | 'Thank You Card';
  currentStock: number;
  minThreshold: number;
  unitCost: number;
  supplier: string;
  location: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface UserProfile {
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
}

export type MarketplacePlatform = 'Amazon' | 'Flipkart' | 'Meesho' | 'Local';

export type IntegrationStatus = 'CONNECTED' | 'DISCONNECTED' | 'TESTING' | 'ERROR' | 'CONFIG_REQUIRED';

export interface AmazonSpApiConfig {
  enabled: boolean;
  region: 'EU_INDIA' | 'NA' | 'EU' | 'FE';
  sellerId: string;
  marketplaceId: string;
  lwaClientId: string;
  lwaClientSecret: string;
  refreshToken: string;
  iamRoleArn?: string;
  awsAccessKeyId?: string;
  awsSecretKey?: string;
  syncFrequencyMinutes: number;
  autoSyncInventory: boolean;
  safetyBufferUnits: number;
  lastSyncTime?: string;
  status: IntegrationStatus;
  statusMessage?: string;
}

export interface FlipkartApiConfig {
  enabled: boolean;
  sellerId: string;
  appId: string;
  appSecret: string;
  locationId?: string;
  environment: 'PRODUCTION' | 'SANDBOX';
  syncFrequencyMinutes: number;
  autoSyncInventory: boolean;
  safetyBufferUnits: number;
  lastSyncTime?: string;
  status: IntegrationStatus;
  statusMessage?: string;
}

export interface MeeshoApiConfig {
  enabled: boolean;
  supplierId: string;
  apiKey: string;
  webhookSecret?: string;
  csvBatchFallbackEnabled: boolean;
  autoSyncInventory: boolean;
  safetyBufferUnits: number;
  lastSyncTime?: string;
  status: IntegrationStatus;
  statusMessage?: string;
}

export interface MarketplaceSettings {
  amazon: AmazonSpApiConfig;
  flipkart: FlipkartApiConfig;
  meesho: MeeshoApiConfig;
  globalSafetyBuffer: number;
  antiOversellMode: 'STRICT_BUFFER' | 'SHARED_POOL_DYNAMIC' | 'FIXED_QUOTA';
}

export interface ChannelFeedLog {
  id: string;
  timestamp: string;
  channel: SalesChannel;
  sku: string;
  productName: string;
  broadcastQuantity: number;
  previousQuantity: number;
  status: 'SUCCESS' | 'QUEUED' | 'IN_TRANSIT' | 'FAILED';
  apiLatencyMs: number;
  responseSummary: string;
  feedSubmissionId?: string;
}
