import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  FileSpreadsheet,
  PieChart,
  Calendar,
  Layers,
  ArrowUpDown,
  DollarSign,
} from 'lucide-react';
import {
  ProductVariant,
  ComboProduct,
  BulkOrder,
  SalesOrder,
  StockMovement,
} from '../../types/partyInventory';

interface ReportsViewProps {
  variants: ProductVariant[];
  combos: ComboProduct[];
  bulkOrders: BulkOrder[];
  salesOrders: SalesOrder[];
  movements: StockMovement[];
  onDownloadCSV: (type: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  variants,
  combos,
  bulkOrders,
  salesOrders,
  movements,
  onDownloadCSV,
}) => {
  const [selectedReport, setSelectedReport] = useState<string>('INVENTORY');

  const reportTypes = [
    { id: 'INVENTORY', name: 'Master Inventory Valuation Report' },
    { id: 'MOVEMENTS', name: 'Stock Movement Audit Ledger' },
    { id: 'CHANNELS', name: 'Sales by Marketplace Channel' },
    { id: 'COMBOS', name: 'Combo Bundles & Profit Margin' },
    { id: 'BULK', name: 'Local Bulk Order Reservation Report' },
    { id: 'LOW_STOCK', name: 'Critical Low Stock & Reorder List' },
  ];

  const totalInventoryValuation = variants.reduce(
    (sum, v) => sum + v.currentStock * v.purchasePrice,
    0
  );
  const totalRetailPotential = variants.reduce(
    (sum, v) => sum + v.currentStock * v.sellingPrice,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            Executive Reports & Data Export Center
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Generate and download Excel-compatible CSV audits for channel reconciliation, tax filings, and stock valuation
          </p>
        </div>

        <button
          onClick={() => onDownloadCSV(selectedReport)}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          <span>Export Current Report (CSV)</span>
        </button>
      </div>

      {/* Report Selection Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {reportTypes.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedReport(r.id)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition shrink-0 ${
              selectedReport === r.id
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">
            Cost Valuation (Wholesale)
          </span>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
            ₹{totalInventoryValuation.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-500">Based on purchase cost</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-500 block">
            Retail Realization Potential
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{totalRetailPotential.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-500">Based on listed selling prices</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-blue-500 block">
            Gross Margin Spread
          </span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            ₹{(totalRetailPotential - totalInventoryValuation).toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-500">
            ~
            {Math.round(
              ((totalRetailPotential - totalInventoryValuation) / Math.max(1, totalRetailPotential)) *
                100
            )}
            % gross markup
          </span>
        </div>
      </div>

      {/* Report Data Preview Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
          <span>
            {reportTypes.find((r) => r.id === selectedReport)?.name} Preview (Showing up to 20 rows)
          </span>
          <span className="text-zinc-400 font-normal text-[11px]">
            Ready to export as UTF-8 encoded CSV
          </span>
        </div>

        <div className="overflow-x-auto">
          {selectedReport === 'INVENTORY' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[10px] uppercase text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Variant Name</th>
                  <th className="py-2.5 px-3">Physical Stock</th>
                  <th className="py-2.5 px-3">Available</th>
                  <th className="py-2.5 px-3">Cost Value</th>
                  <th className="py-2.5 px-3">Retail Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {variants.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2.5 px-3 font-mono font-bold">{v.sku}</td>
                    <td className="py-2.5 px-3 text-zinc-500">{v.category}</td>
                    <td className="py-2.5 px-3 font-medium">{v.variantName}</td>
                    <td className="py-2.5 px-3 font-mono">{v.currentStock}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">
                      {v.availableStock}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      ₹{(v.currentStock * v.purchasePrice).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold">
                      ₹{(v.currentStock * v.sellingPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'MOVEMENTS' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[10px] uppercase text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">TXN ID</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Change</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {movements.slice(0, 15).map((m) => (
                  <tr key={m.id}>
                    <td className="py-2.5 px-3 text-zinc-500">
                      {new Date(m.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold">{m.id}</td>
                    <td className="py-2.5 px-3 font-mono">{m.sku}</td>
                    <td className="py-2.5 px-3 font-bold text-rose-500">{m.type}</td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {m.quantityChanged > 0 ? `+${m.quantityChanged}` : m.quantityChanged}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{m.reason}</td>
                    <td className="py-2.5 px-3 text-zinc-400">{m.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'COMBOS' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[10px] uppercase text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Combo SKU</th>
                  <th className="py-2.5 px-3">Bundle Name</th>
                  <th className="py-2.5 px-3">Theme</th>
                  <th className="py-2.5 px-3">Cost</th>
                  <th className="py-2.5 px-3">Selling Price</th>
                  <th className="py-2.5 px-3">Net Profit</th>
                  <th className="py-2.5 px-3">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {combos.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-600">{c.sku}</td>
                    <td className="py-2.5 px-3 font-medium">{c.name}</td>
                    <td className="py-2.5 px-3 text-zinc-500">{c.theme}</td>
                    <td className="py-2.5 px-3 font-mono">₹{c.totalCost}</td>
                    <td className="py-2.5 px-3 font-mono font-bold">₹{c.sellingPrice}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">
                      ₹{c.profit}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold">
                      {c.profitMargin.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
