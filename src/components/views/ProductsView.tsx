import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Package,
  Barcode,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Tag,
} from 'lucide-react';
import { Product, ProductVariant, ProductCategory, ComboProduct } from '../../types/partyInventory';

interface ProductsViewProps {
  products: Product[];
  variants: ProductVariant[];
  combos: ComboProduct[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onSelectVariant: (variant: ProductVariant) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  variants,
  combos,
  onAddProduct,
  onEditProduct,
  onSelectVariant,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(products[0]?.id || null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);

  const categories: ProductCategory[] = [
    'Balloons',
    'Banners',
    'Frills',
    'D-Light',
    'Cork Lights',
    'Curtains',
    'Candles',
    'Props',
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier.toLowerCase().includes(search.toLowerCase()) ||
      p.variants.some(
        (v) =>
          v.sku.toLowerCase().includes(search.toLowerCase()) ||
          v.variantName.toLowerCase().includes(search.toLowerCase()) ||
          v.color.toLowerCase().includes(search.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-500" />
            Products & Variants Hierarchy
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Structure: Category → Product → Variant → Individual SKU with dedicated stock
          </p>
        </div>

        <button
          onClick={onAddProduct}
          className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Category Pills */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search products, variants, colors, or SKU (e.g. BAL-GOLD)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
                selectedCategory === c
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Product List with Nested Variant Cards */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">No products found</p>
            <p className="text-[11px] mt-0.5">Try clearing filters or search query</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isExpanded = expandedProductId === product.id;
            const productVariants = variants.filter((v) => v.productId === product.id);
            const totalStock = productVariants.reduce((sum, v) => sum + v.currentStock, 0);
            const totalAvailable = productVariants.reduce((sum, v) => sum + v.availableStock, 0);
            const totalReserved = productVariants.reduce((sum, v) => sum + v.reservedStock, 0);

            return (
              <div
                key={product.id}
                className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden transition"
              >
                {/* Product Parent Header */}
                <div
                  onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {product.category}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400 font-semibold">
                          Prefix: {product.baseSkuPrefix}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 self-end sm:self-auto">
                    {/* Aggregated stock pills */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                          Total Stock
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-white text-sm">
                          {totalStock}{' '}
                          <span className="text-xs font-normal text-zinc-500">pcs</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                          Available
                        </span>
                        <span className="font-bold text-emerald-600 text-sm">
                          {totalAvailable}{' '}
                          <span className="text-xs font-normal text-zinc-500">pcs</span>
                        </span>
                      </div>
                      {totalReserved > 0 && (
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                            Reserved
                          </span>
                          <span className="font-bold text-blue-600 text-sm">
                            {totalReserved}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProductDetail(product);
                        }}
                        className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="View Full Product Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProduct(product);
                        }}
                        className="p-2 text-zinc-400 hover:text-blue-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <div className="p-1 text-zinc-400">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nested Variants Table */}
                {isExpanded && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-4">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        Product Variants ({productVariants.length})
                      </span>
                      <span className="text-zinc-400 text-[11px]">
                        Click any variant to view detailed channel allocation & movement ledger
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-[10px] uppercase tracking-wider text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold">SKU Code</th>
                            <th className="py-2.5 px-3 font-semibold">Variant Name</th>
                            <th className="py-2.5 px-3 font-semibold">Color / Size</th>
                            <th className="py-2.5 px-3 font-semibold">Pack Qty</th>
                            <th className="py-2.5 px-3 font-semibold">Price (Cost / Sell / MRP)</th>
                            <th className="py-2.5 px-3 font-semibold">Stock (Phys / Res / Avail)</th>
                            <th className="py-2.5 px-3 font-semibold">Location</th>
                            <th className="py-2.5 px-3 font-semibold">Status</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                          {productVariants.map((v) => (
                            <tr
                              key={v.id}
                              onClick={() => onSelectVariant(v)}
                              className="hover:bg-white dark:hover:bg-zinc-900 cursor-pointer transition"
                            >
                              <td className="py-3 px-3 font-mono font-bold text-zinc-900 dark:text-white">
                                {v.sku}
                              </td>
                              <td className="py-3 px-3 font-medium text-zinc-800 dark:text-zinc-200">
                                {v.variantName}
                              </td>
                              <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">
                                {v.color} • {v.size}
                              </td>
                              <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">
                                {v.packQuantity} pcs
                              </td>
                              <td className="py-3 px-3">
                                <span className="text-zinc-400">₹{v.purchasePrice}</span> /{' '}
                                <span className="font-bold text-emerald-600">₹{v.sellingPrice}</span>{' '}
                                <span className="text-[10px] text-zinc-400 line-through">
                                  ₹{v.mrp}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5 font-mono">
                                  <span className="font-bold text-zinc-900 dark:text-white">
                                    {v.currentStock}
                                  </span>
                                  <span className="text-zinc-400">/</span>
                                  <span className="text-blue-500 font-semibold">{v.reservedStock}</span>
                                  <span className="text-zinc-400">/</span>
                                  <span className="text-emerald-600 font-bold">{v.availableStock}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-zinc-500 text-[11px]">
                                {v.storageLocation}
                              </td>
                              <td className="py-3 px-3">
                                {v.status === 'HEALTHY' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                    Healthy
                                  </span>
                                )}
                                {v.status === 'LOW_STOCK' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                                    Low Stock
                                  </span>
                                )}
                                {v.status === 'CRITICAL' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                                    Critical
                                  </span>
                                )}
                                {v.status === 'OUT_OF_STOCK' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                                    Out of Stock
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <span className="text-xs font-semibold text-rose-600 hover:underline">
                                  Inspect →
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProductDetail && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProductDetail.imageUrl}
                  alt={selectedProductDetail.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-500">
                    {selectedProductDetail.category}
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {selectedProductDetail.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                {selectedProductDetail.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Supplier</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {selectedProductDetail.supplier}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">SKU Prefix</span>
                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {selectedProductDetail.baseSkuPrefix}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Total Variants</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {variants.filter((v) => v.productId === selectedProductDetail.id).length} SKUs
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-2">
                  Combo Product Usage:
                </h4>
                {combos.filter((c) =>
                  c.components.some((comp) => comp.productName === selectedProductDetail.name)
                ).length === 0 ? (
                  <p className="text-zinc-400 text-xs italic">
                    This product is not currently bundled in any active combos.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {combos
                      .filter((c) =>
                        c.components.some((comp) => comp.productName === selectedProductDetail.name)
                      )
                      .map((c) => (
                        <div
                          key={c.id}
                          className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white">{c.name}</span>
                            <span className="text-[11px] text-zinc-400 block font-mono">{c.sku}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            Active Bundle
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
