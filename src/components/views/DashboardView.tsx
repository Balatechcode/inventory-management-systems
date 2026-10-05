import React from 'react';
import {
  Package,
  Layers,
  Boxes,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Ban,
  ShoppingBag,
  DollarSign,
  Clock,
  Truck,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  Product,
  ProductVariant,
  ComboProduct,
  BulkOrder,
  SalesOrder,
} from '../../types/partyInventory';
import { calculateComboAvailability } from '../../services/partyInventoryEngine';

interface DashboardViewProps {
  products: Product[];
  variants: ProductVariant[];
  combos: ComboProduct[];
  bulkOrders: BulkOrder[];
  salesOrders: SalesOrder[];
  onNavigate: (screen: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  variants,
  combos,
  bulkOrders,
  salesOrders,
  onNavigate,
}) => {
  // Aggregate KPI metrics
  const totalProducts = products.length;
  const totalVariants = variants.length;
  const totalPhysicalStock = variants.reduce((sum, v) => sum + v.currentStock, 0);
  const totalReservedStock = variants.reduce((sum, v) => sum + v.reservedStock, 0);
  const totalAvailableStock = variants.reduce((sum, v) => sum + v.availableStock, 0);
  const lowStockCount = variants.filter((v) => v.status === 'LOW_STOCK').length;
  const criticalStockCount = variants.filter((v) => v.status === 'CRITICAL').length;
  const outOfStockCount = variants.filter((v) => v.status === 'OUT_OF_STOCK').length;
  const healthyCount = variants.filter((v) => v.status === 'HEALTHY').length;

  // Sales Orders calculations
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayOrders = salesOrders.filter((o) => o.orderDate.startsWith(todayDateStr));
  const todaySalesAmount = salesOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = salesOrders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;
  const activeBulkOrders = bulkOrders.filter((b) => b.status === 'Confirmed' || b.status === 'Processing' || b.status === 'Ready');

  // Sales by channel breakdown
  const channelSales: Record<string, { count: number; revenue: number }> = {
    Amazon: { count: 0, revenue: 0 },
    Flipkart: { count: 0, revenue: 0 },
    Meesho: { count: 0, revenue: 0 },
    Local: { count: 0, revenue: 0 },
    'Bulk Order': { count: 0, revenue: 0 },
  };

  salesOrders.forEach((o) => {
    const ch = o.channel === 'Bulk' ? 'Bulk Order' : o.channel;
    if (channelSales[ch]) {
      channelSales[ch].count += 1;
      channelSales[ch].revenue += o.total;
    }
  });

  // Category inventory values
  const categoryInventory: Record<string, { units: number; skus: number }> = {};
  variants.forEach((v) => {
    if (!categoryInventory[v.category]) {
      categoryInventory[v.category] = { units: 0, skus: 0 };
    }
    categoryInventory[v.category].units += v.currentStock;
    categoryInventory[v.category].skus += 1;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-xl border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Live Operations Hub
            </span>
            <span className="text-xs text-zinc-400">Multi-Channel Party Inventory</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Decoration Products & Combo Management
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Real-time stock across Amazon, Flipkart, Meesho, Local Store, and Event Bulk Orders.
            Atomic component deduction active for all celebration bundles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('combos')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manage Combos</span>
          </button>
          <button
            onClick={() => onNavigate('bulk_orders')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Bulk Orders</span>
          </button>
        </div>
      </div>

      {/* Top 10 Core KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Products */}
        <div
          onClick={() => onNavigate('products')}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Products</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">
            {totalProducts}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">{totalVariants} active SKUs</div>
        </div>

        {/* Physical Stock */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Physical Stock</span>
            <Boxes className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">
            {totalPhysicalStock.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            Total units in warehouse
          </div>
        </div>

        {/* Available Stock */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Available Stock</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-2">
            {totalAvailableStock.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Ready for immediate sale</div>
        </div>

        {/* Reserved Stock */}
        <div
          onClick={() => onNavigate('bulk_orders')}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Reserved Stock</span>
            <Lock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {totalReservedStock.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Locked for bulk orders</div>
        </div>

        {/* Low Stock Items */}
        <div
          onClick={() => onNavigate('forecast')}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-rose-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {lowStockCount + criticalStockCount}
          </div>
          <div className="text-[11px] text-rose-500 mt-0.5">
            {criticalStockCount} critical items
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => onNavigate('forecast')}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Out of Stock</span>
            <Ban className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {outOfStockCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">SKUs depleted</div>
        </div>

        {/* Today's Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Today's Orders</span>
            <ShoppingBag className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">
            {todayOrders.length > 0 ? todayOrders.length : salesOrders.length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Across all 5 channels</div>
        </div>

        {/* Revenue */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Recorded Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">
            ₹{todaySalesAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Marketplaces & direct</div>
        </div>

        {/* Pending Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Pending Dispatch</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {pendingOrdersCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Orders in warehouse prep</div>
        </div>

        {/* Active Bulk Orders */}
        <div
          onClick={() => onNavigate('bulk_orders')}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Active Bulk Orders</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {activeBulkOrders.length}
          </div>
          <div className="text-[11px] text-blue-500 mt-0.5">Stock reserved locally</div>
        </div>
      </div>

      {/* Spotlight: Combo Availability & Bottlenecks */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              Dynamic Combo Availability (Component Stock Engine)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Combos have zero physical stock. Availability is calculated instantly from base components.
            </p>
          </div>
          <button
            onClick={() => onNavigate('combos')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            View all combos <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {combos.map((combo) => {
            const avail = calculateComboAvailability(combo, variants);
            return (
              <div
                key={combo.id}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold">
                      {combo.sku}
                    </span>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white mt-1">
                      {combo.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Can Assemble
                    </span>
                    <span
                      className={`text-xl font-black ${
                        avail.maxCombos === 0
                          ? 'text-rose-600'
                          : avail.maxCombos < 5
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {avail.maxCombos}{' '}
                      <span className="text-xs font-normal text-zinc-500">combos</span>
                    </span>
                  </div>
                </div>

                {avail.limitingComponent && (
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      Limited by: <strong>{avail.limitingComponent.name}</strong> ({avail.limitingComponent.availableStock} in stock, needs {avail.limitingComponent.requiredQty}/combo)
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs text-zinc-500">
                  <span>Price: ₹{combo.sellingPrice}</span>
                  <span className="text-emerald-600 font-semibold">
                    Profit: ₹{combo.profit} ({combo.profitMargin.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics Grid: Sales By Channel & Category Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Channel */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Multi-Channel Sales Performance
            </h3>
            <span className="text-xs text-zinc-400">Total ₹{todaySalesAmount}</span>
          </div>

          <div className="space-y-3">
            {Object.entries(channelSales).map(([channel, data]) => {
              const maxRev = Math.max(1, todaySalesAmount);
              const pct = Math.round((data.revenue / maxRev) * 100);

              const getChannelColor = (ch: string) => {
                switch (ch) {
                  case 'Amazon':
                    return 'bg-amber-500';
                  case 'Flipkart':
                    return 'bg-blue-500';
                  case 'Meesho':
                    return 'bg-pink-500';
                  case 'Local':
                    return 'bg-emerald-500';
                  default:
                    return 'bg-purple-500';
                }
              };

              return (
                <div key={channel} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {channel}{' '}
                      <span className="text-zinc-400 font-normal">({data.count} orders)</span>
                    </span>
                    <span className="font-bold font-mono text-zinc-900 dark:text-white">
                      ₹{data.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getChannelColor(
                        channel
                      )}`}
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Health & Category Breakdown */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-500" />
              Stock Health & Categories
            </h3>
            <span className="text-xs text-zinc-400">{variants.length} Variants</span>
          </div>

          {/* Health Segment Bar */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-zinc-500">Overall Inventory Health</span>
              <span className="font-bold text-emerald-600">
                {Math.round((healthyCount / Math.max(1, totalVariants)) * 100)}% Healthy
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-3 rounded-full flex overflow-hidden">
              <div
                className="bg-emerald-500 h-full"
                title={`Healthy: ${healthyCount}`}
                style={{ width: `${(healthyCount / totalVariants) * 100}%` }}
              />
              <div
                className="bg-amber-500 h-full"
                title={`Low Stock: ${lowStockCount}`}
                style={{ width: `${(lowStockCount / totalVariants) * 100}%` }}
              />
              <div
                className="bg-rose-500 h-full"
                title={`Critical / Out: ${criticalStockCount + outOfStockCount}`}
                style={{ width: `${((criticalStockCount + outOfStockCount) / totalVariants) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Healthy ({healthyCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Low ({lowStockCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical ({criticalStockCount + outOfStockCount})
              </span>
            </div>
          </div>

          {/* Categories mini list */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
            {Object.entries(categoryInventory).slice(0, 8).map(([cat, data]) => (
              <div
                key={cat}
                className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="text-zinc-400 text-[10px] uppercase font-bold truncate">{cat}</div>
                <div className="font-bold text-zinc-800 dark:text-zinc-200 text-sm mt-0.5">
                  {data.units} <span className="text-[10px] font-normal text-zinc-400">pcs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
