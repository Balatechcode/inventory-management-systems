import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  MoreVertical,
  ArrowUpDown,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  Eye,
  SlidersHorizontal,
  Package,
} from 'lucide-react';
import { InventoryItem, UserRole } from '../types/inventory';
import { exportInventoryToCSV } from '../utils/exportUtils';

interface InventoryTableProps {
  items: InventoryItem[];
  role: UserRole;
  categories: string[];
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  onAddItem: () => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (item: InventoryItem) => void;
  onStockAction: (item: InventoryItem, type: 'IN' | 'OUT') => void;
  onViewDetails: (item: InventoryItem) => void;
}

type SortField = 'name' | 'quantity' | 'unitPrice' | 'lastUpdated';
type SortOrder = 'asc' | 'desc';

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  role,
  categories,
  statusFilter,
  setStatusFilter,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onStockAction,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const canAdd = role === 'ADMIN' || role === 'MANAGER';
  const canEdit = role === 'ADMIN' || role === 'MANAGER';
  const canDelete = role === 'ADMIN';

  // Filtering
  const filteredItems = items.filter((item) => {
    // Search match
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(term) ||
      item.sku.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.supplier.toLowerCase().includes(term) ||
      item.location.toLowerCase().includes(term);

    // Category match
    const matchesCategory =
      selectedCategory === 'ALL' || item.category.toLowerCase() === selectedCategory.toLowerCase();

    // Status match
    let matchesStatus = true;
    if (statusFilter === 'LOW_STOCK') {
      matchesStatus = item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK';
    } else if (statusFilter === 'IN_STOCK') {
      matchesStatus = item.status === 'IN_STOCK';
    } else if (statusFilter === 'OUT_OF_STOCK') {
      matchesStatus = item.status === 'OUT_OF_STOCK';
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'quantity') {
      comparison = a.quantity - b.quantity;
    } else if (sortField === 'unitPrice') {
      comparison = a.unitPrice - b.unitPrice;
    } else if (sortField === 'lastUpdated') {
      comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (item: InventoryItem) => {
    if (item.status === 'OUT_OF_STOCK') {
      return (
        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
          Out of Stock
        </span>
      );
    }
    if (item.status === 'LOW_STOCK') {
      return (
        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
          Low Stock
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        In Stock
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
      {/* Search and Action Toolbar */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, SKU, category, supplier, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/80 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-zinc-700 dark:text-zinc-300 focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Pills */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('LOW_STOCK')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === 'LOW_STOCK'
                  ? 'bg-rose-500 text-white shadow-2xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-rose-500'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStatusFilter('IN_STOCK')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === 'IN_STOCK'
                  ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              In Stock
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={() => exportInventoryToCSV(sortedItems)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition shadow-2xs"
            title="Download CSV of current view"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Add Product Button (RBAC controlled) */}
          {canAdd && (
            <button
              onClick={onAddItem}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th
                onClick={() => toggleSort('name')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-zinc-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Product / SKU</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th
                onClick={() => toggleSort('quantity')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-zinc-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Stock Quantity</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('unitPrice')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-zinc-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Price / Value</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold">Location</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-zinc-600 dark:text-zinc-300">No inventory items found</p>
                  <p className="text-[11px] mt-0.5">Try adjusting your search terms or filters</p>
                </td>
              </tr>
            ) : (
              sortedItems.map((item) => {
                const isLow = item.quantity <= item.minThreshold;
                const ratio = Math.min(100, Math.round((item.quantity / Math.max(1, item.minThreshold * 2)) * 100));

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition group"
                  >
                    {/* Name & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition cursor-pointer" onClick={() => onViewDetails(item)}>
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400 font-mono">
                        <span>{item.sku}</span>
                        <span>•</span>
                        <span>{item.id}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-medium">
                        {item.category}
                      </span>
                    </td>

                    {/* Stock Qty & Bar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`font-bold text-sm ${
                            isLow ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'
                          }`}
                        >
                          {item.quantity}
                        </span>
                        <span className="text-[10px] text-zinc-400">/ min {item.minThreshold}</span>
                      </div>
                      <div className="w-24 bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.quantity === 0
                              ? 'bg-rose-500 w-0'
                              : isLow
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </td>

                    {/* Price & Value */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                        ${item.unitPrice.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Total: ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                    </td>

                    {/* Location & Supplier */}
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                      <div className="font-medium text-zinc-700 dark:text-zinc-300">
                        {item.location || '—'}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate max-w-[130px]">
                        {item.supplier || '—'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(item)}</td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Stock IN */}
                        <button
                          onClick={() => onStockAction(item, 'IN')}
                          title="Stock IN (+)"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition"
                        >
                          <ArrowDownRight className="w-4 h-4" />
                        </button>

                        {/* Quick Stock OUT */}
                        <button
                          onClick={() => onStockAction(item, 'OUT')}
                          disabled={item.quantity === 0}
                          title="Stock OUT (-)"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition disabled:opacity-30"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>

                        {/* View Barcode/Details */}
                        <button
                          onClick={() => onViewDetails(item)}
                          title="View Details & Barcode"
                          className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Item (RBAC) */}
                        {canEdit && (
                          <button
                            onClick={() => onEditItem(item)}
                            title="Edit Item"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Item (Admin only - Confirmation Modal) */}
                        {canDelete && (
                          <button
                            onClick={() => onDeleteItem(item)}
                            title="Delete Item from Google Sheets"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
        {sortedItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            No items matching your search.
          </div>
        ) : (
          sortedItems.map((item) => (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4
                    onClick={() => onViewDetails(item)}
                    className="font-bold text-sm text-zinc-900 dark:text-white"
                  >
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 mt-0.5">
                    <span>{item.sku}</span>
                    <span>•</span>
                    <span className="font-sans px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div>{getStatusBadge(item)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-xl">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase">Stock Level</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {item.quantity} units{' '}
                    <span className="text-[10px] font-normal text-zinc-400">(min {item.minThreshold})</span>
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase">Unit Price</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ${item.unitPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onViewDetails(item)}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStockAction(item, 'IN')}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg"
                  >
                    + In
                  </button>
                  <button
                    onClick={() => onStockAction(item, 'OUT')}
                    disabled={item.quantity === 0}
                    className="px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 rounded-lg disabled:opacity-40"
                  >
                    - Out
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => onEditItem(item)}
                      className="p-1 text-zinc-400 hover:text-blue-500"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => onDeleteItem(item)}
                      className="p-1 text-zinc-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Table Footer Count */}
      <div className="p-3.5 px-5 bg-zinc-50/60 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
        <span>
          Showing <strong>{sortedItems.length}</strong> of <strong>{items.length}</strong> items
        </span>
        <span className="hidden sm:inline text-zinc-400 text-[11px]">
          Live synced with Google Sheets
        </span>
      </div>
    </div>
  );
};
