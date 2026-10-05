import React, { useState, useEffect, useCallback } from 'react';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/firebaseAuth';
import {
  loadInitialAppState,
  saveAppState,
  resetAppStateToDefaults,
  AppState,
} from './services/partyStorageService';
import {
  deductComboComponents,
  handleBulkOrderStatusChange,
  transferChannelAllocation,
  recalculateStatus,
  processMarketplaceOrder,
} from './services/partyInventoryEngine';
import {
  Product,
  ProductVariant,
  ComboProduct,
  BulkOrder,
  BulkOrderStatus,
  SalesOrder,
  PurchaseOrder,
  Supplier,
  ReturnItem,
  PackagingItem,
  StockMovement,
  UserProfile,
  UserRole,
  ChannelAllocation,
  TransactionType,
  MarketplaceSettings,
  ChannelFeedLog,
  SalesChannel,
} from './types/partyInventory';
import { Sidebar, NavScreen } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/views/DashboardView';
import { ProductsView } from './components/views/ProductsView';
import { CombosView } from './components/views/CombosView';
import { InventoryOverviewView } from './components/views/InventoryOverviewView';
import { ChannelStockView } from './components/views/ChannelStockView';
import { MarketplaceIntegrationsView } from './components/views/MarketplaceIntegrationsView';
import { SalesOrdersView } from './components/views/SalesOrdersView';
import { BulkOrdersView } from './components/views/BulkOrdersView';
import { PurchasesView } from './components/views/PurchasesView';
import { ReturnsView } from './components/views/ReturnsView';
import { PackagingView } from './components/views/PackagingView';
import { PartyMovementsView } from './components/views/PartyMovementsView';
import { ForecastView } from './components/views/ForecastView';
import { ReportsView } from './components/views/ReportsView';
import { PartySettingsView } from './components/views/PartySettingsView';

// Modals
import { QuickStockAdjustmentModal } from './components/modals/QuickStockAdjustmentModal';
import { ChannelTransferModal } from './components/modals/ChannelTransferModal';
import { CreateComboModal } from './components/modals/CreateComboModal';
import { BulkOrderModal } from './components/modals/BulkOrderModal';
import { ProductModal } from './components/modals/ProductModal';
import { VariantDetailModal } from './components/modals/VariantDetailModal';
import { CreateSalesOrderModal } from './components/modals/CreateSalesOrderModal';
import { CreatePurchaseModal } from './components/modals/CreatePurchaseModal';
import { CreateReturnModal } from './components/modals/CreateReturnModal';
import { OrderDetailsModal } from './components/modals/OrderDetailsModal';
import { PartyNotificationModal } from './components/modals/PartyNotificationModal';
import { SpreadsheetSelector } from './components/SpreadsheetSelector';
import { ConfirmationModal } from './components/ConfirmationModal';

const STORAGE_KEY_SPREADSHEET_ID = 'stockflow_party_spreadsheet_id';
const STORAGE_KEY_USER_ROLE = 'stockflow_party_user_role';

export default function App() {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<NavScreen>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Core App State
  const [appState, setAppState] = useState<AppState>(() => loadInitialAppState());
  const {
    products,
    variants,
    combos,
    bulkOrders,
    salesOrders,
    purchases,
    suppliers,
    returns,
    packaging,
    movements,
    marketplaces,
    feedLogs,
  } = appState;

  // Authentication & Role
  const [user, setUser] = useState<UserProfile | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_SPREADSHEET_ID);
  });
  const [spreadsheetTitle, setSpreadsheetTitle] = useState('Party Decor Inventory Master');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(new Date());

  // Modals state
  const [isQuickAdjustOpen, setIsQuickAdjustOpen] = useState(false);
  const [adjustingVariant, setAdjustingVariant] = useState<ProductVariant | null>(null);

  const [isChannelTransferOpen, setIsChannelTransferOpen] = useState(false);
  const [transferVariant, setTransferVariant] = useState<ProductVariant | null>(null);

  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [comboToEdit, setComboToEdit] = useState<ComboProduct | null>(null);

  const [isBulkOrderModalOpen, setIsBulkOrderModalOpen] = useState(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isVariantDetailOpen, setIsVariantDetailOpen] = useState(false);
  const [detailVariant, setDetailVariant] = useState<ProductVariant | null>(null);

  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<SalesOrder | null>(null);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseVariant, setPurchaseVariant] = useState<ProductVariant | null>(null);
  const [purchaseSuggestedQty, setPurchaseSuggestedQty] = useState<number>(200);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  // Destructive Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Save to persistence whenever state updates
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (firebaseUser) => {
        const savedRole = (localStorage.getItem(STORAGE_KEY_USER_ROLE) as UserRole) || 'ADMIN';
        setUser({
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Party Warehouse Lead',
          photoURL: firebaseUser.photoURL || undefined,
          role: savedRole,
        });
      },
      () => {
        setUser({
          email: 'clashnotail@gmail.com',
          displayName: 'Warehouse Admin',
          role: 'ADMIN',
        });
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser({
          email: result.user.email || '',
          displayName: result.user.displayName || 'Warehouse User',
          photoURL: result.user.photoURL || undefined,
          role: 'ADMIN',
        });
      }
    } catch (err) {
      console.warn('Google Sign in bypassed or failed:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const handleChangeRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
      localStorage.setItem(STORAGE_KEY_USER_ROLE, role);
    }
  };

  // Quick Stock Adjustment Handler
  const handleQuickStockAdjustment = (
    variant: ProductVariant,
    delta: number,
    reason: string,
    type: TransactionType
  ) => {
    const prev = variant.currentStock;
    const newStock = Math.max(0, prev + delta);
    const newAvail = Math.max(0, newStock - variant.reservedStock - variant.damagedStock);
    const now = new Date().toISOString();

    const updatedVariant: ProductVariant = {
      ...variant,
      currentStock: newStock,
      availableStock: newAvail,
      status: recalculateStatus({ ...variant, currentStock: newStock, availableStock: newAvail }),
      lastUpdated: now,
    };

    const newMovement: StockMovement = {
      id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: now,
      variantId: variant.id,
      sku: variant.sku,
      productName: variant.productName,
      type,
      quantityChanged: delta,
      previousQuantity: prev,
      newQuantity: newStock,
      channel: 'Warehouse',
      reason,
      performedBy: user?.displayName || 'Admin',
    };

    setAppState((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => (v.id === variant.id ? updatedVariant : v)),
      movements: [newMovement, ...prev.movements],
    }));
  };

  // Channel Stock Transfer Handler
  const handleChannelTransfer = (
    variant: ProductVariant,
    fromChannel: keyof ChannelAllocation,
    toChannel: keyof ChannelAllocation,
    quantity: number
  ) => {
    const { updatedVariant, movement } = transferChannelAllocation(
      variant,
      fromChannel,
      toChannel,
      quantity,
      user?.displayName || 'Admin'
    );

    setAppState((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => (v.id === variant.id ? updatedVariant : v)),
      movements: [movement, ...prev.movements],
    }));
  };

  // Combo Management Handlers
  const handleSaveCombo = (combo: ComboProduct) => {
    setAppState((prev) => {
      const exists = prev.combos.some((c) => c.id === combo.id);
      return {
        ...prev,
        combos: exists
          ? prev.combos.map((c) => (c.id === combo.id ? combo : c))
          : [combo, ...prev.combos],
      };
    });
  };

  const handleDuplicateCombo = (combo: ComboProduct) => {
    const duplicated: ComboProduct = {
      ...combo,
      id: `COMBO-${Date.now()}`,
      sku: `${combo.sku}-DUP`,
      name: `${combo.name} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    handleSaveCombo(duplicated);
  };

  const handleDeleteCombo = (comboId: string) => {
    const combo = combos.find((c) => c.id === comboId);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Combo Bundle',
      message: `Are you sure you want to delete "${combo?.name || comboId}"? (Note: underlying components remain untouched in physical inventory).`,
      onConfirm: () => {
        setAppState((prev) => ({
          ...prev,
          combos: prev.combos.filter((c) => c.id !== comboId),
        }));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Simulate Sale of a Combo (Atomic Component Deduction!)
  const handleSimulateComboSale = (combo: ComboProduct) => {
    const orderId = `ORD-SIM-${Math.floor(1000 + Math.random() * 9000)}`;
    const { updatedVariants, movements: newMovements } = deductComboComponents(
      combo,
      1,
      'Amazon',
      orderId,
      user?.displayName || 'System Sale',
      variants
    );

    const newOrder: SalesOrder = {
      id: orderId,
      channel: 'Amazon',
      customerName: 'Quick Sale Customer',
      orderDate: new Date().toISOString(),
      items: [
        {
          comboId: combo.id,
          sku: combo.sku,
          name: combo.name,
          isCombo: true,
          quantity: 1,
          unitPrice: combo.sellingPrice,
          totalPrice: combo.sellingPrice,
        },
      ],
      subtotal: combo.sellingPrice,
      discount: 0,
      shipping: 0,
      tax: Math.round(combo.sellingPrice * 0.05),
      total: Math.round(combo.sellingPrice * 1.05),
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
    };

    setAppState((prev) => ({
      ...prev,
      variants: updatedVariants,
      movements: [...newMovements, ...prev.movements],
      salesOrders: [newOrder, ...prev.salesOrders],
    }));
  };

  // Bulk Order Status Transition (Handles stock reservation, delivery, cancellation)
  const handleBulkOrderStatusChangeAction = (order: BulkOrder, newStatus: BulkOrderStatus) => {
    const { updatedOrder, updatedVariants, movements: newMovements } = handleBulkOrderStatusChange(
      order,
      newStatus,
      variants,
      combos,
      user?.displayName || 'Admin'
    );

    setAppState((prev) => ({
      ...prev,
      bulkOrders: prev.bulkOrders.map((b) => (b.id === order.id ? updatedOrder : b)),
      variants: updatedVariants,
      movements: [...newMovements, ...prev.movements],
    }));
  };

  const handleCreateBulkOrder = (newOrder: BulkOrder) => {
    // If order was created in Confirmed status, reserve stock immediately
    if (newOrder.status === 'Confirmed' || newOrder.status === 'Stock Reserved') {
      const { updatedOrder, updatedVariants, movements: newMovements } =
        handleBulkOrderStatusChange(
          { ...newOrder, stockReserved: false },
          newOrder.status,
          variants,
          combos,
          user?.displayName || 'Admin'
        );

      setAppState((prev) => ({
        ...prev,
        bulkOrders: [updatedOrder, ...prev.bulkOrders],
        variants: updatedVariants,
        movements: [...newMovements, ...prev.movements],
      }));
    } else {
      setAppState((prev) => ({
        ...prev,
        bulkOrders: [newOrder, ...prev.bulkOrders],
      }));
    }
  };

  // Sales Order Creation (Supports both Single Variants and Combos)
  const handleCreateSalesOrder = (newOrder: SalesOrder) => {
    let currentVars = [...variants];
    let newMovements: StockMovement[] = [];

    newOrder.items.forEach((item) => {
      if (item.isCombo && item.comboId) {
        const combo = combos.find((c) => c.id === item.comboId || c.sku === item.sku);
        if (combo) {
          const res = deductComboComponents(
            combo,
            item.quantity,
            newOrder.channel === 'Bulk' ? 'Bulk Order' : (newOrder.channel as any),
            newOrder.id,
            user?.displayName || 'Sales Counter',
            currentVars
          );
          currentVars = res.updatedVariants;
          newMovements = [...newMovements, ...res.movements];
        }
      } else {
        const vIndex = currentVars.findIndex(
          (v) => v.id === item.variantId || v.sku === item.sku
        );
        if (vIndex !== -1) {
          const v = currentVars[vIndex];
          const prevQty = v.currentStock;
          const newCurrent = Math.max(0, prevQty - item.quantity);
          const newAvail = Math.max(0, newCurrent - v.reservedStock - v.damagedStock);
          const now = new Date().toISOString();

          currentVars[vIndex] = {
            ...v,
            currentStock: newCurrent,
            availableStock: newAvail,
            status: recalculateStatus({ ...v, currentStock: newCurrent, availableStock: newAvail }),
            lastUpdated: now,
          };

          newMovements.push({
            id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: now,
            variantId: v.id,
            sku: v.sku,
            productName: v.productName,
            type: 'SALE',
            quantityChanged: -item.quantity,
            previousQuantity: prevQty,
            newQuantity: newCurrent,
            channel: newOrder.channel === 'Bulk' ? 'Bulk Order' : (newOrder.channel as any),
            referenceId: newOrder.id,
            reason: `Order ${newOrder.id} (${newOrder.channel}) for ${newOrder.customerName}`,
            performedBy: user?.displayName || 'Sales Counter',
          });
        }
      }
    });

    setAppState((prev) => ({
      ...prev,
      salesOrders: [newOrder, ...prev.salesOrders],
      variants: currentVars,
      movements: [...newMovements, ...prev.movements],
    }));
  };

  // Inward Purchase Order
  const handleCreatePurchase = (po: PurchaseOrder, autoReceive: boolean = true) => {
    let currentVars = [...variants];
    let newMovements: StockMovement[] = [];

    if (autoReceive) {
      const vIndex = currentVars.findIndex((v) => v.sku === po.variantSku);
      if (vIndex !== -1) {
        const v = currentVars[vIndex];
        const prevQty = v.currentStock;
        const newCurrent = prevQty + po.quantity;
        const newAvail = newCurrent - v.reservedStock - v.damagedStock;
        const now = new Date().toISOString();

        currentVars[vIndex] = {
          ...v,
          currentStock: newCurrent,
          availableStock: newAvail,
          status: recalculateStatus({ ...v, currentStock: newCurrent, availableStock: newAvail }),
          lastUpdated: now,
        };

        newMovements.push({
          id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: now,
          variantId: v.id,
          sku: v.sku,
          productName: v.productName,
          type: 'PURCHASE',
          quantityChanged: +po.quantity,
          previousQuantity: prevQty,
          newQuantity: newCurrent,
          channel: 'Warehouse',
          referenceId: po.id,
          reason: `PO ${po.id} received from ${po.supplier} (Inv: ${po.invoiceNumber})`,
          performedBy: user?.displayName || 'Warehouse Inward',
        });
      }
    }

    setAppState((prev) => ({
      ...prev,
      purchases: [po, ...prev.purchases],
      variants: currentVars,
      movements: [...newMovements, ...prev.movements],
    }));
  };

  // Inspect & process returns
  const handleInspectReturn = (returnItem: ReturnItem, newCondition: 'Sellable' | 'Damaged') => {
    let currentVars = [...variants];
    let newMovements: StockMovement[] = [];
    const vIndex = currentVars.findIndex((v) => v.sku === returnItem.sku);

    if (vIndex !== -1) {
      const v = currentVars[vIndex];
      const now = new Date().toISOString();

      if (newCondition === 'Sellable') {
        const newCurrent = v.currentStock + returnItem.quantity;
        const newAvail = newCurrent - v.reservedStock - v.damagedStock;

        currentVars[vIndex] = {
          ...v,
          currentStock: newCurrent,
          availableStock: newAvail,
          status: recalculateStatus({ ...v, currentStock: newCurrent, availableStock: newAvail }),
          lastUpdated: now,
        };

        newMovements.push({
          id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: now,
          variantId: v.id,
          sku: v.sku,
          productName: v.productName,
          type: 'RETURN',
          quantityChanged: +returnItem.quantity,
          previousQuantity: v.currentStock,
          newQuantity: newCurrent,
          channel: returnItem.channel,
          referenceId: returnItem.id,
          reason: `Customer return restocked after passed inspection (${returnItem.orderId})`,
          performedBy: user?.displayName || 'Inspector',
        });
      } else {
        // Damaged
        currentVars[vIndex] = {
          ...v,
          damagedStock: v.damagedStock + returnItem.quantity,
          availableStock: Math.max(
            0,
            v.currentStock - v.reservedStock - (v.damagedStock + returnItem.quantity)
          ),
          lastUpdated: now,
        };

        newMovements.push({
          id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: now,
          variantId: v.id,
          sku: v.sku,
          productName: v.productName,
          type: 'DAMAGED',
          quantityChanged: 0,
          previousQuantity: v.currentStock,
          newQuantity: v.currentStock,
          channel: returnItem.channel,
          referenceId: returnItem.id,
          reason: `Returned item failed inspection: classified as damaged (${returnItem.reason})`,
          performedBy: user?.displayName || 'Inspector',
        });
      }
    }

    setAppState((prev) => ({
      ...prev,
      returns: prev.returns.map((r) =>
        r.id === returnItem.id ? { ...r, condition: newCondition } : r
      ),
      variants: currentVars,
      movements: [...newMovements, ...prev.movements],
    }));
  };

  // Packaging adjustment
  const handlePackagingStockAdjust = (item: PackagingItem, delta: number) => {
    setAppState((prev) => ({
      ...prev,
      packaging: prev.packaging.map((p) =>
        p.id === item.id ? { ...p, currentStock: Math.max(0, p.currentStock + delta) } : p
      ),
    }));
  };

  // Marketplace Feeds & Anti-Overselling Handlers
  const handleUpdateMarketplaceSettings = (newSettings: MarketplaceSettings) => {
    setAppState((prev) => ({
      ...prev,
      marketplaces: newSettings,
    }));
  };

  const handleBroadcastAllFeeds = () => {
    const now = new Date().toISOString();
    const channels: SalesChannel[] = ['Amazon', 'Flipkart', 'Meesho'];
    const newLogs: ChannelFeedLog[] = [];

    variants.forEach((v) => {
      channels.forEach((ch, idx) => {
        const key = ch.toLowerCase() as keyof ChannelAllocation;
        const alloc = v.channelAllocation[key] || 0;
        const buffer = marketplaces.globalSafetyBuffer;
        const broadcastQty = v.availableStock === 0 ? 0 : Math.max(0, alloc - buffer);

        newLogs.push({
          id: `FEED-${ch.slice(0, 2).toUpperCase()}-${Date.now() + idx + Math.floor(Math.random() * 1000)}`,
          timestamp: now,
          channel: ch,
          sku: v.sku,
          productName: v.productName,
          broadcastQuantity: broadcastQty,
          previousQuantity: alloc,
          status: 'SUCCESS',
          apiLatencyMs: 140 + Math.floor(Math.random() * 120),
          responseSummary: `HTTP 200 OK • Batch broadcast (${broadcastQty} units to ${ch})`,
          feedSubmissionId: `SUB-${Math.floor(10000000 + Math.random() * 90000000)}`,
        });
      });
    });

    setAppState((prev) => ({
      ...prev,
      feedLogs: [...newLogs.slice(0, 15), ...prev.feedLogs],
    }));
    setLastSynced(new Date());
  };

  const handleSimulateMarketplaceOrder = (
    variantSku: string,
    quantity: number,
    channel: SalesChannel,
    customerName: string
  ) => {
    const variant = variants.find((v) => v.sku === variantSku);
    if (!variant) return;

    const { updatedVariant, movement, feedLogs: generatedFeeds } = processMarketplaceOrder(
      variant,
      quantity,
      channel,
      `ORD-${channel.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      customerName,
      `${channel} API Sync`,
      marketplaces.globalSafetyBuffer
    );

    const newOrder: SalesOrder = {
      id: movement.referenceId || `ORD-${Date.now()}`,
      channel: channel as any,
      customerName,
      orderDate: new Date().toISOString(),
      items: [
        {
          variantId: variant.id,
          sku: variant.sku,
          name: variant.productName,
          isCombo: false,
          quantity,
          unitPrice: variant.sellingPrice,
          totalPrice: variant.sellingPrice * quantity,
        },
      ],
      subtotal: variant.sellingPrice * quantity,
      discount: 0,
      shipping: 0,
      tax: Math.round(variant.sellingPrice * quantity * 0.18),
      total: Math.round(variant.sellingPrice * quantity * 1.18),
      paymentStatus: 'Paid',
      orderStatus: 'Shipped',
    };

    setAppState((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => (v.id === updatedVariant.id ? updatedVariant : v)),
      movements: [movement, ...prev.movements],
      salesOrders: [newOrder, ...prev.salesOrders],
      feedLogs: [...generatedFeeds, ...prev.feedLogs],
    }));
  };

  // CSV Exporter
  const handleExportCSV = (filename: string, rows: string[][], headers: string[]) => {
    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join(
        '\r\n'
      );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMasterInventory = () => {
    const headers = [
      'SKU',
      'Category',
      'Product Name',
      'Variant',
      'Color',
      'Size',
      'Pack Qty',
      'Physical Stock',
      'Reserved Stock',
      'Damaged Stock',
      'Available Stock',
      'Purchase Price',
      'Selling Price',
      'MRP',
      'Status',
      'Storage Location',
      'Supplier',
    ];
    const rows = variants.map((v) => [
      v.sku,
      v.category,
      v.productName,
      v.variantName,
      v.color,
      v.size,
      String(v.packQuantity),
      String(v.currentStock),
      String(v.reservedStock),
      String(v.damagedStock),
      String(v.availableStock),
      String(v.purchasePrice),
      String(v.sellingPrice),
      String(v.mrp),
      v.status,
      v.storageLocation,
      v.supplier,
    ]);
    handleExportCSV('PartyDecor_Master_Inventory', rows, headers);
  };

  const handleExportMovements = () => {
    const headers = [
      'Timestamp',
      'Transaction ID',
      'SKU',
      'Product',
      'Type',
      'Qty Changed',
      'Previous Qty',
      'New Qty',
      'Channel',
      'Reason',
      'User',
    ];
    const rows = movements.map((m) => [
      m.timestamp,
      m.id,
      m.sku,
      m.productName,
      m.type,
      String(m.quantityChanged),
      String(m.previousQuantity),
      String(m.newQuantity),
      m.channel || 'Warehouse',
      m.reason,
      m.performedBy,
    ]);
    handleExportCSV('PartyDecor_Movement_Ledger', rows, headers);
  };

  const handleResetDefaults = () => {
    const fresh = resetAppStateToDefaults();
    setAppState(fresh);
  };

  const lowStockCount = variants.filter(
    (v) => v.status === 'LOW_STOCK' || v.status === 'CRITICAL' || v.status === 'OUT_OF_STOCK'
  ).length;

  const activeBulkOrdersCount = bulkOrders.filter(
    (b) => b.status === 'Confirmed' || b.status === 'Processing' || b.status === 'Ready'
  ).length;

  return (
    <div className="min-h-screen bg-zinc-100/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Left Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        isOpenMobile={isMobileNavOpen}
        setIsOpenMobile={setIsMobileNavOpen}
        lowStockCount={lowStockCount}
        bulkOrdersCount={activeBulkOrdersCount}
        combosCount={combos.length}
      />

      {/* Main Page Area with Left Padding on Desktop */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <TopHeader
          onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
          user={user}
          spreadsheetId={spreadsheetId}
          isSyncing={isSyncing}
          lastSynced={lastSynced}
          lowStockCount={lowStockCount}
          onManualSync={() => {
            setIsSyncing(true);
            setTimeout(() => {
              setIsSyncing(false);
              setLastSynced(new Date());
            }, 600);
          }}
          onOpenQuickAdjustment={() => {
            setAdjustingVariant(null);
            setIsQuickAdjustOpen(true);
          }}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onOpenSheetsSettings={() => setIsSheetsModalOpen(true)}
          onChangeRole={handleChangeRole}
          onLogin={handleLogin}
          onLogout={handleLogout}
          globalSearchQuery={globalSearch}
          setGlobalSearchQuery={setGlobalSearch}
        />

        {/* Dynamic Screen View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentScreen === 'dashboard' && (
            <DashboardView
              products={products}
              variants={variants}
              combos={combos}
              bulkOrders={bulkOrders}
              salesOrders={salesOrders}
              onNavigate={(screen) => setCurrentScreen(screen as NavScreen)}
            />
          )}

          {currentScreen === 'products' && (
            <ProductsView
              products={products}
              variants={variants}
              combos={combos}
              onAddProduct={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              onEditProduct={(p) => {
                setProductToEdit(p);
                setIsProductModalOpen(true);
              }}
              onSelectVariant={(v) => {
                setDetailVariant(v);
                setIsVariantDetailOpen(true);
              }}
            />
          )}

          {currentScreen === 'combos' && (
            <CombosView
              combos={combos}
              variants={variants}
              onCreateCombo={() => {
                setComboToEdit(null);
                setIsComboModalOpen(true);
              }}
              onEditCombo={(c) => {
                setComboToEdit(c);
                setIsComboModalOpen(true);
              }}
              onDuplicateCombo={handleDuplicateCombo}
              onDeleteCombo={handleDeleteCombo}
              onSimulateSale={handleSimulateComboSale}
            />
          )}

          {currentScreen === 'inventory' && (
            <InventoryOverviewView
              variants={variants}
              onOpenQuickAdjustment={(v) => {
                setAdjustingVariant(v);
                setIsQuickAdjustOpen(true);
              }}
              onOpenChannelTransfer={(v) => {
                setTransferVariant(v);
                setIsChannelTransferOpen(true);
              }}
              onSelectVariant={(v) => {
                setDetailVariant(v);
                setIsVariantDetailOpen(true);
              }}
              onExportCSV={handleExportMasterInventory}
            />
          )}

          {currentScreen === 'channels' && (
            <ChannelStockView
              variants={variants}
              onOpenTransferModal={(v) => {
                setTransferVariant(v);
                setIsChannelTransferOpen(true);
              }}
              onExportCSV={handleExportMasterInventory}
              onNavigateToMarketplaces={() => setCurrentScreen('marketplaces')}
              onBroadcastFeeds={handleBroadcastAllFeeds}
            />
          )}

          {currentScreen === 'marketplaces' && (
            <MarketplaceIntegrationsView
              variants={variants}
              settings={marketplaces}
              feedLogs={feedLogs}
              onUpdateSettings={handleUpdateMarketplaceSettings}
              onBroadcastAllFeeds={handleBroadcastAllFeeds}
              onSimulateOrder={handleSimulateMarketplaceOrder}
              userRole={user?.role || 'ADMIN'}
            />
          )}

          {currentScreen === 'orders' && (
            <SalesOrdersView
              orders={salesOrders}
              variants={variants}
              combos={combos}
              onCreateOrder={() => setIsCreateOrderOpen(true)}
              onViewOrderDetails={(o) => setSelectedOrderDetail(o)}
            />
          )}

          {currentScreen === 'bulk_orders' && (
            <BulkOrdersView
              bulkOrders={bulkOrders}
              variants={variants}
              combos={combos}
              onCreateBulkOrder={() => setIsBulkOrderModalOpen(true)}
              onUpdateStatus={handleBulkOrderStatusChangeAction}
            />
          )}

          {currentScreen === 'purchases' && (
            <PurchasesView
              purchases={purchases}
              suppliers={suppliers}
              variants={variants}
              onCreatePurchase={() => {
                setPurchaseVariant(null);
                setIsPurchaseModalOpen(true);
              }}
              onReceivePurchase={(po) => handleCreatePurchase({ ...po, receivedDate: new Date().toISOString() }, true)}
            />
          )}

          {currentScreen === 'returns' && (
            <ReturnsView
              returns={returns}
              variants={variants}
              onCreateReturn={() => setIsReturnModalOpen(true)}
              onInspectReturn={handleInspectReturn}
            />
          )}

          {currentScreen === 'packaging' && (
            <PackagingView
              packaging={packaging}
              onAddPackaging={() => alert('New packaging item added to warehouse')}
              onAdjustStock={handlePackagingStockAdjust}
            />
          )}

          {currentScreen === 'movements' && (
            <PartyMovementsView
              movements={movements}
              onExportCSV={handleExportMovements}
            />
          )}

          {currentScreen === 'forecast' && (
            <ForecastView
              variants={variants}
              onCreatePurchaseFromForecast={(v, qty) => {
                setPurchaseVariant(v);
                setPurchaseSuggestedQty(qty);
                setIsPurchaseModalOpen(true);
              }}
              onExportReport={handleExportMasterInventory}
            />
          )}

          {currentScreen === 'reports' && (
            <ReportsView
              variants={variants}
              combos={combos}
              bulkOrders={bulkOrders}
              salesOrders={salesOrders}
              movements={movements}
              onDownloadCSV={(type) => {
                if (type === 'MOVEMENTS') handleExportMovements();
                else handleExportMasterInventory();
              }}
            />
          )}

          {currentScreen === 'settings' && (
            <PartySettingsView
              spreadsheetId={spreadsheetId}
              spreadsheetTitle={spreadsheetTitle}
              isSyncing={isSyncing}
              userRole={user?.role || 'ADMIN'}
              onChangeRole={handleChangeRole}
              onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
              onManualSync={() => {
                setIsSyncing(true);
                setTimeout(() => {
                  setIsSyncing(false);
                  setLastSynced(new Date());
                }, 600);
              }}
              onResetDefaults={handleResetDefaults}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="py-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>StockFlow Party Decor Enterprise Inventory System</span>
            <span>Multi-Channel Sync: Amazon • Flipkart • Meesho • Local • Bulk Orders</span>
          </div>
        </footer>
      </div>

      {/* Modals Layer */}
      <QuickStockAdjustmentModal
        isOpen={isQuickAdjustOpen}
        variants={variants}
        selectedVariant={adjustingVariant}
        userName={user?.displayName || 'Admin'}
        onClose={() => setIsQuickAdjustOpen(false)}
        onSubmit={handleQuickStockAdjustment}
      />

      <ChannelTransferModal
        isOpen={isChannelTransferOpen}
        variant={transferVariant}
        userName={user?.displayName || 'Admin'}
        onClose={() => setIsChannelTransferOpen(false)}
        onTransfer={handleChannelTransfer}
      />

      <CreateComboModal
        isOpen={isComboModalOpen}
        comboToEdit={comboToEdit}
        variants={variants}
        onClose={() => setIsComboModalOpen(false)}
        onSave={handleSaveCombo}
      />

      <BulkOrderModal
        isOpen={isBulkOrderModalOpen}
        variants={variants}
        combos={combos}
        onClose={() => setIsBulkOrderModalOpen(false)}
        onSubmit={handleCreateBulkOrder}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        productToEdit={productToEdit}
        onClose={() => setIsProductModalOpen(false)}
        onSave={(newProd, newVars) => {
          setAppState((prev) => ({
            ...prev,
            products: prev.products.some((p) => p.id === newProd.id)
              ? prev.products.map((p) => (p.id === newProd.id ? newProd : p))
              : [newProd, ...prev.products],
            variants: [...newVars, ...prev.variants.filter((v) => v.productId !== newProd.id)],
          }));
        }}
      />

      <VariantDetailModal
        isOpen={isVariantDetailOpen}
        variant={detailVariant}
        movements={movements}
        onClose={() => setIsVariantDetailOpen(false)}
        onOpenQuickAdjustment={(v) => {
          setAdjustingVariant(v);
          setIsQuickAdjustOpen(true);
        }}
        onOpenChannelTransfer={(v) => {
          setTransferVariant(v);
          setIsChannelTransferOpen(true);
        }}
      />

      <CreateSalesOrderModal
        isOpen={isCreateOrderOpen}
        variants={variants}
        combos={combos}
        onClose={() => setIsCreateOrderOpen(false)}
        onSubmit={handleCreateSalesOrder}
      />

      <CreatePurchaseModal
        isOpen={isPurchaseModalOpen}
        suppliers={suppliers}
        variants={variants}
        initialVariant={purchaseVariant}
        initialQty={purchaseSuggestedQty}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSubmit={handleCreatePurchase}
      />

      <CreateReturnModal
        isOpen={isReturnModalOpen}
        variants={variants}
        onClose={() => setIsReturnModalOpen(false)}
        onSubmit={(ret) => {
          setAppState((prev) => ({ ...prev, returns: [ret, ...prev.returns] }));
        }}
      />

      <OrderDetailsModal
        isOpen={!!selectedOrderDetail}
        order={selectedOrderDetail}
        onClose={() => setSelectedOrderDetail(null)}
      />

      <PartyNotificationModal
        isOpen={isNotificationModalOpen}
        variants={variants}
        combos={combos}
        onClose={() => setIsNotificationModalOpen(false)}
        onCreatePurchase={(v, qty) => {
          setPurchaseVariant(v);
          setPurchaseSuggestedQty(qty);
          setIsPurchaseModalOpen(true);
        }}
        onExportLowStock={handleExportMasterInventory}
      />

      <SpreadsheetSelector
        isOpen={isSheetsModalOpen}
        currentSpreadsheetId={spreadsheetId}
        currentTitle={spreadsheetTitle}
        onClose={() => setIsSheetsModalOpen(false)}
        onCreateNewSheet={async (title) => {
          setSpreadsheetTitle(title);
          setSpreadsheetId(`sheets-${Date.now()}`);
          localStorage.setItem(STORAGE_KEY_SPREADSHEET_ID, `sheets-${Date.now()}`);
        }}
        onConnectExistingSheet={async (id) => {
          setSpreadsheetId(id);
          localStorage.setItem(STORAGE_KEY_SPREADSHEET_ID, id);
        }}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
