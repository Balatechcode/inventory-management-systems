import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  Layers,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import {
  Product,
  ProductVariant,
  ProductCategory,
  StockStatus,
} from '../../types/partyInventory';

interface ProductModalProps {
  isOpen: boolean;
  productToEdit: Product | null;
  onClose: () => void;
  onSave: (product: Product, variants: ProductVariant[]) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  productToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Balloons');
  const [description, setDescription] = useState('');
  const [baseSkuPrefix, setBaseSkuPrefix] = useState('BAL');
  const [supplier, setSupplier] = useState('Latex King Rubber Works');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80'
  );
  const [variantsList, setVariantsList] = useState<Omit<ProductVariant, 'id' | 'productId'>[]>([]);
  const [error, setError] = useState<string | null>(null);

  // New variant subform state
  const [varName, setVarName] = useState('Gold – 10 pcs');
  const [varColor, setVarColor] = useState('Gold');
  const [varSize, setVarSize] = useState('10 inch');
  const [varPackQty, setVarPackQty] = useState(10);
  const [varPurchasePrice, setVarPurchasePrice] = useState(28);
  const [varSellingPrice, setVarSellingPrice] = useState(75);
  const [varMrp, setVarMrp] = useState(99);
  const [varInitialStock, setVarInitialStock] = useState(200);
  const [varThreshold, setVarThreshold] = useState(50);
  const [varLocation, setVarLocation] = useState('Aisle 1 - Bin A1');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setDescription(productToEdit.description);
      setBaseSkuPrefix(productToEdit.baseSkuPrefix);
      setSupplier(productToEdit.supplier);
      setImageUrl(productToEdit.imageUrl);
      setVariantsList(productToEdit.variants.map((v) => ({ ...v })));
    } else {
      setName('');
      setCategory('Balloons');
      setDescription('');
      setBaseSkuPrefix('BAL');
      setSupplier('Latex King Rubber Works');
      setVariantsList([]);
    }
    setError(null);
  }, [productToEdit, isOpen]);

  // Update baseSkuPrefix when category changes
  useEffect(() => {
    if (!productToEdit) {
      switch (category) {
        case 'Balloons':
          setBaseSkuPrefix('BAL');
          break;
        case 'Banners':
          setBaseSkuPrefix('BAN');
          break;
        case 'Frills':
          setBaseSkuPrefix('FRL');
          break;
        case 'D-Light':
          setBaseSkuPrefix('DLT');
          break;
        case 'Cork Lights':
          setBaseSkuPrefix('CLK');
          break;
        case 'Curtains':
          setBaseSkuPrefix('CUR');
          break;
        case 'Candles':
          setBaseSkuPrefix('CND');
          break;
        case 'Props':
          setBaseSkuPrefix('PROP');
          break;
        default:
          setBaseSkuPrefix('PRD');
      }
    }
  }, [category, productToEdit]);

  if (!isOpen) return null;

  const handleAddVariant = () => {
    const colorCode = varColor.slice(0, 4).toUpperCase();
    const sizeCode = varPackQty ? `${varPackQty}` : '01';
    const generatedSku = `${baseSkuPrefix}-${colorCode}-${sizeCode}`;

    if (variantsList.some((v) => v.sku === generatedSku)) {
      setError(`A variant with SKU ${generatedSku} already exists in this product.`);
      return;
    }

    const newVar: Omit<ProductVariant, 'id' | 'productId'> = {
      sku: generatedSku,
      productName: name || 'Product',
      category,
      variantName: varName,
      color: varColor,
      size: varSize,
      packQuantity: varPackQty,
      purchasePrice: varPurchasePrice,
      sellingPrice: varSellingPrice,
      mrp: varMrp,
      currentStock: varInitialStock,
      reservedStock: 0,
      damagedStock: 0,
      availableStock: varInitialStock,
      lowStockThreshold: varThreshold,
      reorderLevel: varThreshold + 20,
      reorderQuantity: varInitialStock * 2,
      supplier,
      storageLocation: varLocation,
      status: varInitialStock <= varThreshold ? 'LOW_STOCK' : 'HEALTHY',
      channelAllocation: {
        amazon: Math.floor(varInitialStock * 0.35),
        flipkart: Math.floor(varInitialStock * 0.25),
        meesho: Math.floor(varInitialStock * 0.2),
        local: Math.floor(varInitialStock * 0.1),
        bulk: 0,
        unallocated: Math.floor(varInitialStock * 0.1),
      },
      lastUpdated: new Date().toISOString(),
      avgDailySales: 5,
      last7DaysSales: 35,
      last30DaysSales: 150,
    };

    setVariantsList([...variantsList, newVar]);
    setError(null);
  };

  const handleRemoveVariant = (skuToRemove: string) => {
    setVariantsList(variantsList.filter((v) => v.sku !== skuToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (variantsList.length === 0) {
      setError('Please add at least one variant with distinct SKU.');
      return;
    }

    const prodId = productToEdit ? productToEdit.id : `PROD-${Date.now()}`;
    const finalizedVariants: ProductVariant[] = variantsList.map((v, idx) => ({
      ...v,
      id: (v as ProductVariant).id || `VAR-${Date.now()}-${idx}`,
      productId: prodId,
      productName: name.trim(),
      category,
    }));

    const finalProduct: Product = {
      id: prodId,
      name: name.trim(),
      category,
      description: description.trim(),
      baseSkuPrefix,
      supplier,
      imageUrl,
      variants: finalizedVariants,
      createdAt: productToEdit ? productToEdit.createdAt : new Date().toISOString(),
    };

    onSave(finalProduct, finalizedVariants);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                {productToEdit ? 'Edit Product & Variants' : 'Add New Decoration Product'}
              </h3>
              <p className="text-xs text-zinc-400">
                Setup product family and generate individual SKUs for every variant
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Parent Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium"
              >
                <option value="Balloons">Balloons</option>
                <option value="Banners">Banners</option>
                <option value="Frills">Frills</option>
                <option value="D-Light">D-Light / Decorative Lights</option>
                <option value="Cork Lights">Cork Lights</option>
                <option value="Curtains">Curtains</option>
                <option value="Candles">Candles</option>
                <option value="Props">Props</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Metallic Balloon"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Primary Supplier / Vendor
              </label>
              <input
                type="text"
                placeholder="e.g. Latex King Rubber Works"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Base SKU Prefix
              </label>
              <input
                type="text"
                required
                value={baseSkuPrefix}
                onChange={(e) => setBaseSkuPrefix(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono font-bold text-zinc-900 dark:text-white uppercase"
              />
            </div>
          </div>

          {/* Variant Builder Strip */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <span className="font-bold text-zinc-900 dark:text-white block">
              + Add Product Variant (Color, Size, Pack, Price, Stock)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] text-zinc-500 mb-0.5">Variant Name</label>
                <input
                  type="text"
                  value={varName}
                  onChange={(e) => setVarName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-500 mb-0.5">Color</label>
                <input
                  type="text"
                  value={varColor}
                  onChange={(e) => setVarColor(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-500 mb-0.5">Size / Length</label>
                <input
                  type="text"
                  value={varSize}
                  onChange={(e) => setVarSize(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-500 mb-0.5">Pack Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={varPackQty}
                  onChange={(e) => setVarPackQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div>
                <label className="block text-[11px] text-zinc-500 mb-0.5">Cost Price (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={varPurchasePrice}
                  onChange={(e) => setVarPurchasePrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-500 mb-0.5">Selling Price (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={varSellingPrice}
                  onChange={(e) => setVarSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-500 mb-0.5">MRP (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={varMrp}
                  onChange={(e) => setVarMrp(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-500 mb-0.5">Initial Stock</label>
                <input
                  type="number"
                  min="0"
                  value={varInitialStock}
                  onChange={(e) => setVarInitialStock(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="w-full py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add SKU</span>
                </button>
              </div>
            </div>
          </div>

          {/* Configured Variants List */}
          <div className="space-y-2">
            <span className="font-bold text-zinc-900 dark:text-white block">
              Configured Variants ({variantsList.length})
            </span>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {variantsList.map((v) => (
                <div key={v.sku} className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white mr-2">
                      {v.sku}
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {v.variantName}
                    </span>
                    <span className="text-zinc-400 text-[11px] block">
                      Color: {v.color} • Size: {v.size} • Pack: {v.packQuantity} pcs • Price: ₹
                      {v.sellingPrice} (Cost: ₹{v.purchasePrice})
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      {v.currentStock} units
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.sku)}
                      className="p-1 text-zinc-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition"
            >
              Save Product & SKUs
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
