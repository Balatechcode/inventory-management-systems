import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Download,
  Eye,
  Sparkles,
} from 'lucide-react';
import { SalesOrder, OrderChannel, ProductVariant, ComboProduct } from '../../types/partyInventory';

interface SalesOrdersViewProps {
  orders: SalesOrder[];
  variants: ProductVariant[];
  combos: ComboProduct[];
  onCreateOrder: () => void;
  onViewOrderDetails: (order: SalesOrder) => void;
}

export const SalesOrdersView: React.FC<SalesOrdersViewProps> = ({
  orders,
  variants,
  combos,
  onCreateOrder,
  onViewOrderDetails,
}) => {
  const [search, setSearch] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');

  const channels = ['ALL', 'Amazon', 'Flipkart', 'Meesho', 'Local', 'Bulk'];

  const filteredOrders = orders.filter((o) => {
    const matchesChannel = selectedChannel === 'ALL' || o.channel === selectedChannel;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));
    return matchesChannel && matchesSearch;
  });

  const getChannelBadge = (ch: OrderChannel) => {
    switch (ch) {
      case 'Amazon':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200';
      case 'Flipkart':
        return 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200';
      case 'Meesho':
        return 'bg-pink-100 dark:bg-pink-950/80 text-pink-800 dark:text-pink-300 border-pink-200';
      case 'Local':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200';
      case 'Bulk':
        return 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-500" />
            Unified Sales Orders Management
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Omni-channel sales across Amazon, Flipkart, Meesho, and Local counter
          </p>
        </div>

        <button
          onClick={onCreateOrder}
          className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Sales Order</span>
        </button>
      </div>

      {/* Filter and Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search order ID, customer name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {channels.map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
                selectedChannel === ch
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Channel</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Ordered Items</th>
                <th className="py-3 px-4 font-semibold">Order Total</th>
                <th className="py-3 px-4 font-semibold">Payment</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                    {order.id}
                    <span className="text-[10px] font-normal text-zinc-400 block font-sans">
                      {new Date(order.orderDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getChannelBadge(
                        order.channel
                      )}`}
                    >
                      {order.channel}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                    {order.customerName}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 max-w-[260px]">
                      {order.items.map((i, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] truncate">
                          {i.isCombo ? (
                            <span className="text-rose-500 font-bold">✨ [Combo]</span>
                          ) : (
                            <span className="text-zinc-400 font-mono">{i.sku}</span>
                          )}
                          <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate">
                            {i.name}
                          </span>
                          <span className="text-zinc-400">×{i.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-white font-mono">
                    ₹{order.total.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        order.orderStatus === 'Delivered' || order.orderStatus === 'Shipped'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onViewOrderDetails(order)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
