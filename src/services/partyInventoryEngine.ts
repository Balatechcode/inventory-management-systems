import {
  ProductVariant,
  ComboProduct,
  BulkOrder,
  BulkOrderStatus,
  StockMovement,
  ChannelAllocation,
  SalesChannel,
} from '../types/partyInventory';

export interface ComboAvailabilityResult {
  maxCombos: number;
  limitingComponent: {
    sku: string;
    name: string;
    availableStock: number;
    requiredQty: number;
  } | null;
  components: Array<{
    sku: string;
    name: string;
    requiredQty: number;
    availableStock: number;
    possibleCombos: number;
    isBottleneck: boolean;
  }>;
}

/**
 * Calculates how many complete combos can currently be produced from available stock
 * and identifies the exact bottleneck limiting component.
 */
export function calculateComboAvailability(
  combo: ComboProduct,
  variants: ProductVariant[]
): ComboAvailabilityResult {
  if (!combo.components || combo.components.length === 0) {
    return { maxCombos: 0, limitingComponent: null, components: [] };
  }

  let minCombos = Number.MAX_SAFE_INTEGER;
  let bottleneck: { sku: string; name: string; availableStock: number; requiredQty: number } | null = null;

  const componentDetails = combo.components.map((comp) => {
    const variant = variants.find(
      (v) => v.id === comp.variantId || v.sku === comp.variantSku
    );
    const available = variant ? Math.max(0, variant.availableStock) : 0;
    const possible = comp.quantityRequired > 0 ? Math.floor(available / comp.quantityRequired) : 0;

    if (possible < minCombos) {
      minCombos = possible;
      bottleneck = {
        sku: comp.variantSku,
        name: comp.variantName || comp.productName,
        availableStock: available,
        requiredQty: comp.quantityRequired,
      };
    }

    return {
      sku: comp.variantSku,
      name: comp.variantName || comp.productName,
      requiredQty: comp.quantityRequired,
      availableStock: available,
      possibleCombos: possible,
      isBottleneck: false,
    };
  });

  const finalMax = minCombos === Number.MAX_SAFE_INTEGER ? 0 : minCombos;

  // Mark all bottleneck components
  componentDetails.forEach((c) => {
    if (c.possibleCombos === finalMax) {
      c.isBottleneck = true;
    }
  });

  return {
    maxCombos: finalMax,
    limitingComponent: finalMax > 0 && finalMax < 9999 ? bottleneck : bottleneck,
    components: componentDetails,
  };
}

/**
 * Helper to update stock status based on current vs threshold
 */
export function recalculateStatus(variant: ProductVariant): ProductVariant['status'] {
  if (variant.currentStock === 0) return 'OUT_OF_STOCK';
  if (variant.availableStock <= Math.ceil(variant.lowStockThreshold * 0.4)) return 'CRITICAL';
  if (variant.availableStock <= variant.lowStockThreshold) return 'LOW_STOCK';
  return 'HEALTHY';
}

/**
 * Deducts components when a Combo is sold.
 * Every physical item must have one source of truth for inventory!
 */
export function deductComboComponents(
  combo: ComboProduct,
  quantitySold: number,
  channel: SalesChannel,
  orderId: string,
  performedBy: string,
  variants: ProductVariant[]
): { updatedVariants: ProductVariant[]; movements: StockMovement[] } {
  const updatedVariants = [...variants];
  const movements: StockMovement[] = [];
  const now = new Date().toISOString();

  combo.components.forEach((comp) => {
    const totalUnitsToDeduct = comp.quantityRequired * quantitySold;
    const vIndex = updatedVariants.findIndex(
      (v) => v.id === comp.variantId || v.sku === comp.variantSku
    );

    if (vIndex !== -1) {
      const v = updatedVariants[vIndex];
      const prevQty = v.currentStock;
      const newCurrent = Math.max(0, prevQty - totalUnitsToDeduct);
      const newAvail = Math.max(0, newCurrent - v.reservedStock - v.damagedStock);

      // Deduct from channel allocation if applicable
      const channelKey = channel.toLowerCase() as keyof ChannelAllocation;
      const alloc = { ...v.channelAllocation };
      if (channelKey in alloc && alloc[channelKey] !== undefined) {
        alloc[channelKey] = Math.max(0, alloc[channelKey] - totalUnitsToDeduct);
      }

      const updatedV: ProductVariant = {
        ...v,
        currentStock: newCurrent,
        availableStock: newAvail,
        channelAllocation: alloc,
        status: recalculateStatus({ ...v, currentStock: newCurrent, availableStock: newAvail }),
        lastUpdated: now,
      };

      updatedVariants[vIndex] = updatedV;

      movements.push({
        id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: now,
        variantId: v.id,
        sku: v.sku,
        productName: v.productName,
        type: 'COMBO_SALE',
        quantityChanged: -totalUnitsToDeduct,
        previousQuantity: prevQty,
        newQuantity: newCurrent,
        channel,
        referenceId: orderId,
        reason: `Auto component deduction for combo "${combo.name}" (${quantitySold} combo sold)`,
        performedBy,
      });
    }
  });

  return { updatedVariants, movements };
}

/**
 * Handles state transitions for Local Bulk Orders:
 * - Reserving stock on confirmation
 * - Converting reserved stock to sold on delivery
 * - Releasing reserved stock on cancellation
 */
export function handleBulkOrderStatusChange(
  order: BulkOrder,
  newStatus: BulkOrderStatus,
  variants: ProductVariant[],
  combos: ComboProduct[],
  performedBy: string
): { updatedOrder: BulkOrder; updatedVariants: ProductVariant[]; movements: StockMovement[] } {
  const updatedVariants = [...variants];
  const movements: StockMovement[] = [];
  const now = new Date().toISOString();

  const wasReserved = order.stockReserved;
  const shouldBeReserved =
    newStatus === 'Confirmed' ||
    newStatus === 'Stock Reserved' ||
    newStatus === 'Processing' ||
    newStatus === 'Ready';

  const isDelivered = newStatus === 'Delivered';
  const isCancelled = newStatus === 'Cancelled';

  // Expand items to base variant units
  const variantRequirements: Record<string, number> = {};

  order.items.forEach((item) => {
    if (item.isCombo && item.comboId) {
      const combo = combos.find((c) => c.id === item.comboId || c.sku === item.sku);
      if (combo) {
        combo.components.forEach((comp) => {
          variantRequirements[comp.variantSku] =
            (variantRequirements[comp.variantSku] || 0) + comp.quantityRequired * item.quantity;
        });
      }
    } else {
      variantRequirements[item.sku] = (variantRequirements[item.sku] || 0) + item.quantity;
    }
  });

  // 1. Transition: Unreserved -> Reserved (Confirmed)
  if (!wasReserved && shouldBeReserved) {
    Object.entries(variantRequirements).forEach(([sku, qty]) => {
      const idx = updatedVariants.findIndex((v) => v.sku === sku);
      if (idx !== -1) {
        const v = updatedVariants[idx];
        const newReserved = v.reservedStock + qty;
        const newAvail = Math.max(0, v.currentStock - newReserved - v.damagedStock);

        updatedVariants[idx] = {
          ...v,
          reservedStock: newReserved,
          availableStock: newAvail,
          status: recalculateStatus({ ...v, reservedStock: newReserved, availableStock: newAvail }),
          lastUpdated: now,
        };

        movements.push({
          id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: now,
          variantId: v.id,
          sku: v.sku,
          productName: v.productName,
          type: 'BULK_ORDER_RESERVATION',
          quantityChanged: -qty,
          previousQuantity: v.availableStock,
          newQuantity: newAvail,
          channel: 'Bulk Order',
          referenceId: order.id,
          reason: `Stock reserved for Bulk Order ${order.id} (${order.customerName})`,
          performedBy,
        });
      }
    });
  }

  // 2. Transition: Reserved -> Delivered (Deduct physical and clear reservation)
  if (wasReserved && isDelivered) {
    Object.entries(variantRequirements).forEach(([sku, qty]) => {
      const idx = updatedVariants.findIndex((v) => v.sku === sku);
      if (idx !== -1) {
        const v = updatedVariants[idx];
        const newCurrent = Math.max(0, v.currentStock - qty);
        const newReserved = Math.max(0, v.reservedStock - qty);
        const newAvail = Math.max(0, newCurrent - newReserved - v.damagedStock);

        updatedVariants[idx] = {
          ...v,
          currentStock: newCurrent,
          reservedStock: newReserved,
          availableStock: newAvail,
          status: recalculateStatus({
            ...v,
            currentStock: newCurrent,
            reservedStock: newReserved,
            availableStock: newAvail,
          }),
          lastUpdated: now,
        };

        movements.push({
          id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: now,
          variantId: v.id,
          sku: v.sku,
          productName: v.productName,
          type: 'SALE',
          quantityChanged: -qty,
          previousQuantity: v.currentStock,
          newQuantity: newCurrent,
          channel: 'Bulk Order',
          referenceId: order.id,
          reason: `Delivered Bulk Order ${order.id} (${order.customerName})`,
          performedBy,
        });
      }
    });
  }

  // 3. Transition: Reserved -> Cancelled (Release reserved stock)
  if (wasReserved && isCancelled) {
    Object.entries(variantRequirements).forEach(([sku, qty]) => {
      const idx = updatedVariants.findIndex((v) => v.sku === sku);
      if (idx !== -1) {
        const v = updatedVariants[idx];
        const newReserved = Math.max(0, v.reservedStock - qty);
        const newAvail = Math.max(0, v.currentStock - newReserved - v.damagedStock);

        updatedVariants[idx] = {
          ...v,
          reservedStock: newReserved,
          availableStock: newAvail,
          status: recalculateStatus({ ...v, reservedStock: newReserved, availableStock: newAvail }),
          lastUpdated: now,
        };

        movements.push({
          id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: now,
          variantId: v.id,
          sku: v.sku,
          productName: v.productName,
          type: 'BULK_ORDER_RELEASE',
          quantityChanged: +qty,
          previousQuantity: v.availableStock,
          newQuantity: newAvail,
          channel: 'Bulk Order',
          referenceId: order.id,
          reason: `Stock released from cancelled Bulk Order ${order.id}`,
          performedBy,
        });
      }
    });
  }

  const updatedOrder: BulkOrder = {
    ...order,
    status: newStatus,
    stockReserved: isDelivered || isCancelled ? false : shouldBeReserved,
  };

  return { updatedOrder, updatedVariants, movements };
}

/**
 * Transfers allocated stock between channels (e.g. Amazon -> Local, Unallocated -> Flipkart)
 */
export function transferChannelAllocation(
  variant: ProductVariant,
  fromChannel: keyof ChannelAllocation,
  toChannel: keyof ChannelAllocation,
  quantity: number,
  performedBy: string
): { updatedVariant: ProductVariant; movement: StockMovement } {
  const alloc = { ...variant.channelAllocation };
  const availableInFrom = alloc[fromChannel] || 0;
  const transferQty = Math.min(availableInFrom, quantity);

  alloc[fromChannel] = Math.max(0, alloc[fromChannel] - transferQty);
  alloc[toChannel] = (alloc[toChannel] || 0) + transferQty;

  const now = new Date().toISOString();
  const updatedVariant: ProductVariant = {
    ...variant,
    channelAllocation: alloc,
    lastUpdated: now,
  };

  const movement: StockMovement = {
    id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now,
    variantId: variant.id,
    sku: variant.sku,
    productName: variant.productName,
    type: 'CHANNEL_TRANSFER',
    quantityChanged: 0,
    previousQuantity: variant.currentStock,
    newQuantity: variant.currentStock,
    channel: toChannel === 'amazon' ? 'Amazon' : toChannel === 'flipkart' ? 'Flipkart' : toChannel === 'meesho' ? 'Meesho' : 'Local',
    reason: `Channel reallocation: ${String(fromChannel).toUpperCase()} (${transferQty} units) → ${String(toChannel).toUpperCase()}`,
    performedBy,
  };

  return { updatedVariant, movement };
}

/**
 * Handles incoming order from a sales channel (Amazon, Flipkart, Meesho, Local):
 * Central inventory is the single source of truth.
 * - Deducts from physical & available stock (e.g. 450 -> 430)
 * - Deducts from the channel's quota, drawing from unallocated buffer if needed
 * - Emits stock movement audit log
 * - Prepares real-time outbound feed broadcasts for all connected channels
 */
export function processMarketplaceOrder(
  variant: ProductVariant,
  quantity: number,
  channel: SalesChannel,
  orderReferenceId: string,
  customerName: string,
  performedBy: string,
  safetyBuffer: number = 5
): {
  updatedVariant: ProductVariant;
  movement: StockMovement;
  feedLogs: import('../types/partyInventory').ChannelFeedLog[];
} {
  const now = new Date().toISOString();
  const prevCurrent = variant.currentStock;
  const prevAvail = variant.availableStock;

  const actualDeduct = Math.min(variant.availableStock, quantity);
  const newCurrent = Math.max(0, prevCurrent - actualDeduct);
  const newAvail = Math.max(0, newCurrent - variant.reservedStock - variant.damagedStock);

  // Channel allocation deduction
  const alloc = { ...variant.channelAllocation };
  const channelKey = (
    channel === 'Amazon' ? 'amazon' :
    channel === 'Flipkart' ? 'flipkart' :
    channel === 'Meesho' ? 'meesho' :
    channel === 'Local' ? 'local' : 'bulk'
  ) as keyof ChannelAllocation;

  const currentChannelQuota = alloc[channelKey] || 0;
  if (currentChannelQuota >= actualDeduct) {
    alloc[channelKey] = currentChannelQuota - actualDeduct;
  } else {
    // Deplete channel quota, take remainder from unallocated buffer
    const remainder = actualDeduct - currentChannelQuota;
    alloc[channelKey] = 0;
    alloc.unallocated = Math.max(0, (alloc.unallocated || 0) - remainder);
  }

  const updatedVariant: ProductVariant = {
    ...variant,
    currentStock: newCurrent,
    availableStock: newAvail,
    channelAllocation: alloc,
    status: recalculateStatus({ ...variant, currentStock: newCurrent, availableStock: newAvail }),
    lastUpdated: now,
  };

  const movement: StockMovement = {
    id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now,
    variantId: variant.id,
    sku: variant.sku,
    productName: variant.productName,
    type: 'SALE',
    quantityChanged: -actualDeduct,
    previousQuantity: prevCurrent,
    newQuantity: newCurrent,
    channel,
    referenceId: orderReferenceId,
    reason: `${channel} Marketplace Order (${actualDeduct} units) - Customer: ${customerName}`,
    performedBy,
  };

  // Generate outbound sync feed logs to immediately broadcast updated inventory across all marketplaces
  const feedChannels: SalesChannel[] = ['Amazon', 'Flipkart', 'Meesho'];
  const feedLogs: import('../types/partyInventory').ChannelFeedLog[] = feedChannels.map((ch, idx) => {
    const key = ch.toLowerCase() as keyof ChannelAllocation;
    const rawAlloc = alloc[key] || 0;
    // Broadcast quantity honors safety buffer to prevent cross-channel oversell
    const broadcastQty = newAvail === 0 ? 0 : Math.max(0, rawAlloc - safetyBuffer);

    return {
      id: `FEED-${ch.slice(0, 2).toUpperCase()}-${Date.now() + idx}`,
      timestamp: now,
      channel: ch,
      sku: variant.sku,
      productName: variant.productName,
      broadcastQuantity: broadcastQty,
      previousQuantity: rawAlloc,
      status: 'SUCCESS',
      apiLatencyMs: 180 + Math.floor(Math.random() * 140),
      responseSummary: `HTTP 200 OK • Synced ${broadcastQty} units to ${ch} (buffer: ${safetyBuffer})`,
      feedSubmissionId: `SUB-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };
  });

  return { updatedVariant, movement, feedLogs };
}
