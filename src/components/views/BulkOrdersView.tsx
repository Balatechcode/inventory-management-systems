import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  AlertTriangle,
  XCircle,
  Clock,
  Phone,
  Calendar,
  Layers,
  ChevronRight,
  DollarSign,
  PackageCheck,
} from 'lucide-react';
import { BulkOrder, BulkOrderStatus, ProductVariant, ComboProduct } from '../../types/partyInventory';

interface BulkOrdersViewProps {
  bulkOrders: BulkOrder[];
  variants: ProductVariant[];
  combos: ComboProduct[];
  onCreateBulkOrder: () => void;
  onUpdateStatus: (order: BulkOrder, newStatus: BulkOrderStatus) => void;
}

export const BulkOrdersView: React.FC<BulkOrdersViewProps> = ({
  bulkOrders,
  variants,
  combos,
  onCreateBulkOrder,
  onUpdateStatus,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<BulkOrder | null>(bulkOrders[0] || null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders = bulkOrders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerCompany && o.customerCompany.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: BulkOrderStatus) => {
    switch (status) {
      case 'Draft':
      case 'Quotation':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            {status} (No Reserve)
          </span>
        );
      case 'Confirmed':
      case 'Stock Reserved':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-blue-500" />
            <span>{status}</span>
          </span>
        );
      case 'Processing':
      case 'Ready':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>{status}</span>
          </span>
        );
      case 'Delivered':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Delivered & Sold</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
            <XCircle className="w-3 h-3 text-rose-500" />
            <span>Cancelled (Released)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-500" />
            Local Bulk Orders & Event Reservation Engine
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Quotations do not hold stock. Confirmed orders automatically lock warehouse inventory until delivery or cancellation.
          </p>
        </div>

        <button
          onClick={onCreateBulkOrder}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Bulk Order</span>
        </button>
      </div>

      {/* Two Column Layout: Orders List & Active Order Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Orders List (Left) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Filters */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search decorator, company, or order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
              {(['ALL', 'Quotation', 'Confirmed', 'Processing', 'Delivered'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Cards */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                No bulk orders found.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 shadow-xs'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-blue-600">
                            {order.id}
                          </span>
                          <span className="text-[11px] text-zinc-400">• Event: {order.eventDate}</span>
                        </div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                          {order.customerName}
                        </h4>
                        {order.customerCompany && (
                          <p className="text-xs text-zinc-500">{order.customerCompany}</p>
                        )}
                      </div>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">
                        {order.items.length} line items (
                        {order.items.reduce((s, i) => s + i.quantity, 0)} units)
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-white">
                        ₹{order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Order Inspector & Workflow Controller (Right) */}
        <div className="lg:col-span-7">
          {selectedOrder ? (
            <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs p-6 space-y-6">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-blue-600">
                      {selectedOrder.id}
                    </span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {selectedOrder.customerName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {selectedOrder.customerPhone}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Event: {selectedOrder.eventDate}
                    </span>
                  </div>
                </div>

                {/* Status Action Workflow Stepper */}
                <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto text-xs">
                  {selectedOrder.status === 'Quotation' && (
                    <button
                      onClick={() => onUpdateStatus(selectedOrder, 'Confirmed')}
                      className="px-3.5 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs flex items-center gap-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Confirm & Reserve Stock</span>
                    </button>
                  )}

                  {selectedOrder.status === 'Confirmed' && (
                    <button
                      onClick={() => onUpdateStatus(selectedOrder, 'Processing')}
                      className="px-3.5 py-1.5 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Start Warehouse Prep</span>
                    </button>
                  )}

                  {selectedOrder.status === 'Processing' && (
                    <button
                      onClick={() => onUpdateStatus(selectedOrder, 'Ready')}
                      className="px-3.5 py-1.5 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition flex items-center gap-1"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Mark Ready For Dispatch</span>
                    </button>
                  )}

                  {(selectedOrder.status === 'Confirmed' ||
                    selectedOrder.status === 'Processing' ||
                    selectedOrder.status === 'Ready') && (
                    <button
                      onClick={() => onUpdateStatus(selectedOrder, 'Delivered')}
                      className="px-3.5 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Deliver & Deduct Stock</span>
                    </button>
                  )}

                  {selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && (
                    <button
                      onClick={() => onUpdateStatus(selectedOrder, 'Cancelled')}
                      className="px-3 py-1.5 font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Stock Reservation Banner */}
              {selectedOrder.stockReserved ? (
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Stock Locked:</strong> Quantities below are currently reserved in your
                    warehouse. Other marketplace sales will not consume this stock.
                  </span>
                </div>
              ) : selectedOrder.status === 'Delivered' ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Delivered & Billed:</strong> Physical stock has been permanently deducted
                    and recorded in sales ledger.
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>
                    Quotation stage. Physical stock is NOT reserved yet. Click "Confirm & Reserve Stock" when the client confirms.
                  </span>
                </div>
              )}

              {/* Items Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Ordered Products & Combos
                </h4>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span>{item.name}</span>
                            {item.isCombo && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                                Combo Bundle
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-zinc-400">{item.sku}</span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {item.quantity} pcs @ ₹{item.unitPrice}
                        </span>
                        <span className="text-zinc-500 text-[11px] block">
                          = ₹{item.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Financials Summary */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Special Bulk Discount:</span>
                  <span className="font-mono text-rose-500">
                    -₹{selectedOrder.discount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Advance Received:</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    ₹{selectedOrder.advancePaid.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-sm font-bold text-zinc-900 dark:text-white">
                  <span>Net Payable Amount:</span>
                  <span className="text-base text-blue-600">
                    ₹{selectedOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                  <strong>Notes:</strong> {selectedOrder.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-zinc-400 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              Select a bulk order to inspect stock reservations and dispatch state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
