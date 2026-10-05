import {
  Product,
  ProductVariant,
  ComboProduct,
  BulkOrder,
  SalesOrder,
  PurchaseOrder,
  Supplier,
  ReturnItem,
  PackagingItem,
  StockMovement,
} from '../types/partyInventory';
import {
  INITIAL_PRODUCTS,
  INITIAL_VARIANTS,
  INITIAL_COMBOS,
  INITIAL_BULK_ORDERS,
  INITIAL_SALES_ORDERS,
  INITIAL_PURCHASES,
  INITIAL_SUPPLIERS,
  INITIAL_RETURNS,
  INITIAL_PACKAGING,
  INITIAL_MOVEMENTS,
  INITIAL_MARKETPLACE_SETTINGS,
  INITIAL_FEED_LOGS,
} from '../data/mockPartyData';

const STORAGE_PREFIX = 'stockflow_party_';

export interface AppState {
  products: Product[];
  variants: ProductVariant[];
  combos: ComboProduct[];
  bulkOrders: BulkOrder[];
  salesOrders: SalesOrder[];
  purchases: PurchaseOrder[];
  suppliers: Supplier[];
  returns: ReturnItem[];
  packaging: PackagingItem[];
  movements: StockMovement[];
  marketplaces: import('../types/partyInventory').MarketplaceSettings;
  feedLogs: import('../types/partyInventory').ChannelFeedLog[];
}

export function loadInitialAppState(): AppState {
  try {
    const storedVariants = localStorage.getItem(`${STORAGE_PREFIX}variants`);
    const storedProducts = localStorage.getItem(`${STORAGE_PREFIX}products`);
    const storedCombos = localStorage.getItem(`${STORAGE_PREFIX}combos`);
    const storedBulk = localStorage.getItem(`${STORAGE_PREFIX}bulkOrders`);
    const storedOrders = localStorage.getItem(`${STORAGE_PREFIX}salesOrders`);
    const storedPurchases = localStorage.getItem(`${STORAGE_PREFIX}purchases`);
    const storedSuppliers = localStorage.getItem(`${STORAGE_PREFIX}suppliers`);
    const storedReturns = localStorage.getItem(`${STORAGE_PREFIX}returns`);
    const storedPackaging = localStorage.getItem(`${STORAGE_PREFIX}packaging`);
    const storedMovements = localStorage.getItem(`${STORAGE_PREFIX}movements`);
    const storedMarketplaces = localStorage.getItem(`${STORAGE_PREFIX}marketplaces`);
    const storedFeedLogs = localStorage.getItem(`${STORAGE_PREFIX}feedLogs`);

    return {
      variants: storedVariants ? JSON.parse(storedVariants) : INITIAL_VARIANTS,
      products: storedProducts ? JSON.parse(storedProducts) : INITIAL_PRODUCTS,
      combos: storedCombos ? JSON.parse(storedCombos) : INITIAL_COMBOS,
      bulkOrders: storedBulk ? JSON.parse(storedBulk) : INITIAL_BULK_ORDERS,
      salesOrders: storedOrders ? JSON.parse(storedOrders) : INITIAL_SALES_ORDERS,
      purchases: storedPurchases ? JSON.parse(storedPurchases) : INITIAL_PURCHASES,
      suppliers: storedSuppliers ? JSON.parse(storedSuppliers) : INITIAL_SUPPLIERS,
      returns: storedReturns ? JSON.parse(storedReturns) : INITIAL_RETURNS,
      packaging: storedPackaging ? JSON.parse(storedPackaging) : INITIAL_PACKAGING,
      movements: storedMovements ? JSON.parse(storedMovements) : INITIAL_MOVEMENTS,
      marketplaces: storedMarketplaces ? JSON.parse(storedMarketplaces) : INITIAL_MARKETPLACE_SETTINGS,
      feedLogs: storedFeedLogs ? JSON.parse(storedFeedLogs) : INITIAL_FEED_LOGS,
    };
  } catch (err) {
    console.warn('Failed to parse stored state, using defaults:', err);
    return {
      variants: INITIAL_VARIANTS,
      products: INITIAL_PRODUCTS,
      combos: INITIAL_COMBOS,
      bulkOrders: INITIAL_BULK_ORDERS,
      salesOrders: INITIAL_SALES_ORDERS,
      purchases: INITIAL_PURCHASES,
      suppliers: INITIAL_SUPPLIERS,
      returns: INITIAL_RETURNS,
      packaging: INITIAL_PACKAGING,
      movements: INITIAL_MOVEMENTS,
      marketplaces: INITIAL_MARKETPLACE_SETTINGS,
      feedLogs: INITIAL_FEED_LOGS,
    };
  }
}

export function saveAppState(state: Partial<AppState>) {
  try {
    if (state.variants) localStorage.setItem(`${STORAGE_PREFIX}variants`, JSON.stringify(state.variants));
    if (state.products) localStorage.setItem(`${STORAGE_PREFIX}products`, JSON.stringify(state.products));
    if (state.combos) localStorage.setItem(`${STORAGE_PREFIX}combos`, JSON.stringify(state.combos));
    if (state.bulkOrders) localStorage.setItem(`${STORAGE_PREFIX}bulkOrders`, JSON.stringify(state.bulkOrders));
    if (state.salesOrders) localStorage.setItem(`${STORAGE_PREFIX}salesOrders`, JSON.stringify(state.salesOrders));
    if (state.purchases) localStorage.setItem(`${STORAGE_PREFIX}purchases`, JSON.stringify(state.purchases));
    if (state.suppliers) localStorage.setItem(`${STORAGE_PREFIX}suppliers`, JSON.stringify(state.suppliers));
    if (state.returns) localStorage.setItem(`${STORAGE_PREFIX}returns`, JSON.stringify(state.returns));
    if (state.packaging) localStorage.setItem(`${STORAGE_PREFIX}packaging`, JSON.stringify(state.packaging));
    if (state.movements) localStorage.setItem(`${STORAGE_PREFIX}movements`, JSON.stringify(state.movements));
    if (state.marketplaces) localStorage.setItem(`${STORAGE_PREFIX}marketplaces`, JSON.stringify(state.marketplaces));
    if (state.feedLogs) localStorage.setItem(`${STORAGE_PREFIX}feedLogs`, JSON.stringify(state.feedLogs));
  } catch (err) {
    console.error('Failed to save app state to localStorage:', err);
  }
}

export function resetAppStateToDefaults(): AppState {
  localStorage.removeItem(`${STORAGE_PREFIX}variants`);
  localStorage.removeItem(`${STORAGE_PREFIX}products`);
  localStorage.removeItem(`${STORAGE_PREFIX}combos`);
  localStorage.removeItem(`${STORAGE_PREFIX}bulkOrders`);
  localStorage.removeItem(`${STORAGE_PREFIX}salesOrders`);
  localStorage.removeItem(`${STORAGE_PREFIX}purchases`);
  localStorage.removeItem(`${STORAGE_PREFIX}suppliers`);
  localStorage.removeItem(`${STORAGE_PREFIX}returns`);
  localStorage.removeItem(`${STORAGE_PREFIX}packaging`);
  localStorage.removeItem(`${STORAGE_PREFIX}movements`);
  localStorage.removeItem(`${STORAGE_PREFIX}marketplaces`);
  localStorage.removeItem(`${STORAGE_PREFIX}feedLogs`);

  return {
    variants: INITIAL_VARIANTS,
    products: INITIAL_PRODUCTS,
    combos: INITIAL_COMBOS,
    bulkOrders: INITIAL_BULK_ORDERS,
    salesOrders: INITIAL_SALES_ORDERS,
    purchases: INITIAL_PURCHASES,
    suppliers: INITIAL_SUPPLIERS,
    returns: INITIAL_RETURNS,
    packaging: INITIAL_PACKAGING,
    movements: INITIAL_MOVEMENTS,
    marketplaces: INITIAL_MARKETPLACE_SETTINGS,
    feedLogs: INITIAL_FEED_LOGS,
  };
}
