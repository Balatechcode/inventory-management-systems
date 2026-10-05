import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  Star,
  PackagePlus,
} from 'lucide-react';
import { PurchaseOrder, Supplier, ProductVariant } from '../../types/partyInventory';

interface PurchasesViewProps {
  purchases: PurchaseOrder[];
  suppliers: Supplier[];
  variants: ProductVariant[];
  onCreatePurchase: () => void;
  onReceivePurchase: (purchase: PurchaseOrder) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchases,
  suppliers,
  variants,
  onCreatePurchase,
  onReceivePurchase,
}) => {
  const [activeTab, setActiveTab] = useState<'purchases' | 'suppliers'>('purchases');
  const [search, setSearch] = useState('');

  const filteredPurchases = purchases.filter((p) => {
    return (
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier.toLowerCase().includes(search.toLowerCase()) ||
      p.variantSku.toLowerCase().includes(search.toLowerCase()) ||
      p.variantName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const filteredSuppliers = suppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-500" />
            Purchasing & Supplier Logistics
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Track purchase orders and instantly inward received stock into warehouse inventory
          </p>
        </div>

        <button
          onClick={onCreatePurchase}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 text-xs">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`pb-3 font-semibold transition border-b-2 ${
            activeTab === 'purchases'
              ? 'border-emerald-600 text-emerald-600 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Purchase Orders ({purchases.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 font-semibold transition border-b-2 ${
            activeTab === 'suppliers'
              ? 'border-emerald-600 text-emerald-600 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Verified Suppliers ({suppliers.length})
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'purchases'
                ? 'Search PO ID, supplier, SKU...'
                : 'Search supplier name, contact...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {activeTab === 'purchases' ? (
        /* Purchase Orders Table */
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">PO Number</th>
                  <th className="py-3 px-4 font-semibold">Supplier & Invoice</th>
                  <th className="py-3 px-4 font-semibold">Ordered Product / SKU</th>
                  <th className="py-3 px-4 font-semibold">Quantity</th>
                  <th className="py-3 px-4 font-semibold">Purchase Price</th>
                  <th className="py-3 px-4 font-semibold">Total Cost</th>
                  <th className="py-3 px-4 font-semibold">Payment Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Inward Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredPurchases.map((po) => {
                  const isReceived = !!po.receivedDate;
                  return (
                    <tr key={po.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                        {po.id}
                        <span className="text-[10px] text-zinc-400 block font-sans">
                          {po.purchaseDate}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-zinc-900 dark:text-white block">
                          {po.supplier}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          Inv: {po.invoiceNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate max-w-[220px]">
                          {po.variantName}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-400">{po.variantSku}</span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-white font-mono">
                        +{po.quantity} pcs
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                        ₹{po.purchasePrice}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">
                        ₹{po.totalCost.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            po.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {po.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isReceived ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Stock Inwarded
                          </span>
                        ) : (
                          <button
                            onClick={() => onReceivePurchase(po)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition flex items-center gap-1 ml-auto"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                            <span>Inward Stock</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Suppliers Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-white">{sup.name}</h4>
                  <span className="text-xs text-zinc-500">Contact: {sup.contactPerson}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{sup.rating}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{sup.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{sup.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate">{sup.address}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Lead Time: {sup.leadTimeDays} days</span>
                <div className="flex gap-1">
                  {sup.categoriesSupplied.map((c) => (
                    <span
                      key={c}
                      className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
