import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  DollarSign,
  Package,
} from 'lucide-react';
import { ComboProduct, ComboComponent, ProductVariant, ComboType } from '../../types/partyInventory';

interface CreateComboModalProps {
  isOpen: boolean;
  comboToEdit: ComboProduct | null;
  variants: ProductVariant[];
  onClose: () => void;
  onSave: (combo: ComboProduct) => void;
}

export const CreateComboModal: React.FC<CreateComboModalProps> = ({
  isOpen,
  comboToEdit,
  variants,
  onClose,
  onSave,
}) => {
  const [sku, setSku] = useState('COM-BDAY-001');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('Birthday');
  const [type, setType] = useState<ComboType>('Fixed');
  const [sellingPrice, setSellingPrice] = useState<number>(499);
  const [mrp, setMrp] = useState<number>(799);
  const [packagingCost, setPackagingCost] = useState<number>(20);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80'
  );
  const [components, setComponents] = useState<ComboComponent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Selected component in dropdown to add
  const [selectedVariantSku, setSelectedVariantSku] = useState<string>(variants[0]?.sku || '');
  const [qtyToAdd, setQtyToAdd] = useState<number>(1);

  useEffect(() => {
    if (comboToEdit) {
      setSku(comboToEdit.sku);
      setName(comboToEdit.name);
      setDescription(comboToEdit.description);
      setTheme(comboToEdit.theme);
      setType(comboToEdit.type);
      setSellingPrice(comboToEdit.sellingPrice);
      setMrp(comboToEdit.mrp);
      setPackagingCost(comboToEdit.packagingCost);
      setImageUrl(comboToEdit.imageUrl);
      setComponents(comboToEdit.components || []);
    } else {
      const generatedId = `COM-${theme.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      setSku(generatedId);
      setName('');
      setDescription('');
      setTheme('Birthday');
      setType('Fixed');
      setSellingPrice(499);
      setMrp(799);
      setPackagingCost(20);
      setComponents([]);
    }
    setError(null);
  }, [comboToEdit, isOpen, theme]);

  if (!isOpen) return null;

  // Real-time cost calculations
  const componentCost = components.reduce(
    (sum, c) => sum + c.quantityRequired * c.unitCost,
    0
  );
  const totalCost = componentCost + packagingCost;
  const profit = Math.max(0, sellingPrice - totalCost);
  const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  const handleAddComponent = () => {
    const v = variants.find((item) => item.sku === selectedVariantSku);
    if (!v) return;

    if (components.some((c) => c.variantSku === v.sku)) {
      setError(`Variant ${v.sku} is already added in this combo.`);
      return;
    }

    const newComp: ComboComponent = {
      variantId: v.id,
      variantSku: v.sku,
      variantName: v.variantName,
      productName: v.productName,
      category: v.category,
      quantityRequired: qtyToAdd,
      unitCost: v.purchasePrice,
    };

    setComponents([...components, newComp]);
    setError(null);
  };

  const handleRemoveComponent = (skuToRemove: string) => {
    setComponents(components.filter((c) => c.variantSku !== skuToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a combo bundle name.');
      return;
    }
    if (!sku.trim()) {
      setError('Combo SKU is required.');
      return;
    }
    if (components.length === 0) {
      setError('Please add at least one component item into this combo.');
      return;
    }

    const finalCombo: ComboProduct = {
      id: comboToEdit ? comboToEdit.id : `COMBO-${Date.now()}`,
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      theme,
      type,
      components,
      sellingPrice,
      mrp,
      packagingCost,
      totalCost,
      profit,
      profitMargin,
      imageUrl,
      status: 'Active',
      createdAt: comboToEdit ? comboToEdit.createdAt : new Date().toISOString(),
    };

    onSave(finalCombo);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                {comboToEdit ? 'Edit Combo Bundle' : 'Create New Decoration Combo'}
              </h3>
              <p className="text-xs text-zinc-400">
                Combines multiple physical SKUs into a unified salable package
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Combo SKU (e.g. COM-BDAY-001)
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono font-bold text-zinc-900 dark:text-white uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Celebration Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              >
                <option value="Birthday">Birthday</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Baby Shower">Baby Shower</option>
                <option value="Wedding">Wedding / Engagement</option>
                <option value="Festival">Festival (Diwali, New Year, Christmas)</option>
                <option value="Welcome">Welcome / Housewarming</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Combo Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Golden Glamour Birthday Arch Combo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Description & Packaging Guidelines
            </label>
            <textarea
              rows={2}
              placeholder="What makes this bundle special? Include packaging sequence..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
            />
          </div>

          {/* Pricing & Profitability Strip */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              Pricing & Automated Profit Margin
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">MRP Printed (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={mrp}
                  onChange={(e) => setMrp(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">Pkg Cost (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
              </div>

              <div className="text-center sm:text-right">
                <span className="text-[11px] text-zinc-500 block">Net Profit</span>
                <span className="text-base font-bold text-emerald-600 block">₹{profit}</span>
                <span className="text-[10px] text-emerald-500 font-semibold">
                  {profitMargin.toFixed(1)}% margin
                </span>
              </div>
            </div>
          </div>

          {/* Components Selector */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 dark:text-white">
                Combo Component Items ({components.length})
              </span>
              <span className="text-[11px] text-zinc-400">
                Total Component Cost: ₹{componentCost}
              </span>
            </div>

            {/* Add component controls */}
            <div className="flex gap-2">
              <select
                value={selectedVariantSku}
                onChange={(e) => setSelectedVariantSku(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono text-xs"
              >
                {variants.map((v) => (
                  <option key={v.sku} value={v.sku}>
                    {v.sku} – {v.productName} ({v.variantName}) [Cost: ₹{v.purchasePrice}]
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={qtyToAdd}
                onChange={(e) => setQtyToAdd(Math.max(1, parseInt(e.target.value, 10) || 1))}
                placeholder="Qty"
                className="w-20 px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold text-center"
              />

              <button
                type="button"
                onClick={handleAddComponent}
                className="px-3 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Components List */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {components.length === 0 ? (
                <div className="p-4 text-center text-zinc-400 text-xs">
                  No components added yet. Select a variant above and click Add.
                </div>
              ) : (
                components.map((c) => (
                  <div key={c.variantSku} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-white">{c.variantName}</div>
                      <span className="font-mono text-[10px] text-zinc-400">
                        {c.variantSku} • Unit Cost: ₹{c.unitCost}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-zinc-900 dark:text-white font-mono">
                        {c.quantityRequired} pcs/combo (₹{c.quantityRequired * c.unitCost})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(c.variantSku)}
                        className="p-1 text-zinc-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
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
              {comboToEdit ? 'Save Changes' : 'Create Combo Bundle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
