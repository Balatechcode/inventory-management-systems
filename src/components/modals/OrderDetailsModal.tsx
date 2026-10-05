import React from 'react';
import {
  X,
  ShoppingBag,
  Clock,
  CheckCircle2,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { SalesOrder } from '../../types/partyInventory';

interface OrderDetailsModalProps {
  isOpen: boolean;
  order: SalesOrder | null;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  order,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                  {order.id}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {order.channel}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Customer: <strong>{order.customerName}</strong> • {new Date(order.orderDate).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                Payment Status
              </span>
              <span className="font-bold text-emerald-600 text-sm">{order.paymentStatus}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                Order Status
              </span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <span className="font-bold text-zinc-900 dark:text-white block mb-2">
              Ordered Items
            </span>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {order.items.map((it, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      {it.name}
                      {it.isCombo && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          Combo Bundle
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">{it.sku}</span>
                    {it.isCombo && (
                      <span className="text-[10px] text-emerald-600 block mt-0.5">
                        ✓ All components deducted from physical variant stock
                      </span>
                    )}
                  </div>

                  <div className="text-right font-mono font-bold text-zinc-900 dark:text-white">
                    {it.quantity} × ₹{it.unitPrice} = ₹{it.totalPrice}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 space-y-1.5">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal:</span>
              <span className="font-mono">₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-rose-500">
                <span>Discount:</span>
                <span className="font-mono">-₹{order.discount}</span>
              </div>
            )}
            {order.shipping > 0 && (
              <div className="flex justify-between text-zinc-500">
                <span>Shipping:</span>
                <span className="font-mono">+₹{order.shipping}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between text-zinc-500">
                <span>Tax:</span>
                <span className="font-mono">+₹{order.tax}</span>
              </div>
            )}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-bold text-sm text-zinc-900 dark:text-white">
              <span>Grand Total:</span>
              <span className="text-base text-rose-600 font-mono">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
