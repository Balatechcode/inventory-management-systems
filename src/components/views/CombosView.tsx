import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Edit2,
  Trash2,
  Package,
  ArrowRight,
  TrendingUp,
  Boxes,
  DollarSign,
  Tag,
  Percent,
} from 'lucide-react';
import { ComboProduct, ProductVariant, SalesChannel } from '../../types/partyInventory';
import { calculateComboAvailability } from '../../services/partyInventoryEngine';

interface CombosViewProps {
  combos: ComboProduct[];
  variants: ProductVariant[];
  onCreateCombo: () => void;
  onEditCombo: (combo: ComboProduct) => void;
  onDuplicateCombo: (combo: ComboProduct) => void;
  onDeleteCombo: (comboId: string) => void;
  onSimulateSale: (combo: ComboProduct) => void;
}

export const CombosView: React.FC<CombosViewProps> = ({
  combos,
  variants,
  onCreateCombo,
  onEditCombo,
  onDuplicateCombo,
  onDeleteCombo,
  onSimulateSale,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('ALL');
  const [activeComboDetail, setActiveComboDetail] = useState<ComboProduct | null>(null);

  const themes = ['ALL', 'Birthday', 'Anniversary', 'Baby Shower', 'Wedding', 'Festival'];

  const filteredCombos = combos.filter((c) => {
    return selectedTheme === 'ALL' || c.theme === selectedTheme;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              Party Decoration Combos & Bundles
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
              Zero Physical Stock – Auto Calculated
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Availability is dynamically determined by lowest component stock. Sales deduct each component from physical inventory.
          </p>
        </div>

        <button
          onClick={onCreateCombo}
          className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Combo</span>
        </button>
      </div>

      {/* Theme Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {themes.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTheme(t)}
            className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
              selectedTheme === t
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
            }`}
          >
            {t === 'ALL' ? 'All Celebration Themes' : t}
          </button>
        ))}
      </div>

      {/* Combo Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredCombos.map((combo) => {
          const avail = calculateComboAvailability(combo, variants);
          const isBottlenecked = avail.maxCombos < 5;

          return (
            <div
              key={combo.id}
              className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Top Card Banner */}
                <div className="p-5 flex items-start justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={combo.imageUrl}
                      alt={combo.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                          {combo.sku}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {combo.theme} • {combo.type}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                        {combo.name}
                      </h3>
                      <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                        {combo.description}
                      </p>
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Available Combos
                    </span>
                    <span
                      className={`text-2xl font-black ${
                        avail.maxCombos === 0
                          ? 'text-rose-600'
                          : avail.maxCombos < 5
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {avail.maxCombos}
                    </span>
                  </div>
                </div>

                {/* Bottleneck Alert */}
                {avail.limitingComponent && (
                  <div className="px-5 py-2.5 bg-amber-50/80 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/60 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span className="truncate">
                      <strong>Limited by:</strong> {avail.limitingComponent.name} – only{' '}
                      <strong>{avail.maxCombos}</strong> complete combos possible ({avail.limitingComponent.availableStock} in stock).
                    </span>
                  </div>
                )}

                {/* Components Breakdown */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    <span>Bundled Components ({combo.components.length})</span>
                    <span className="text-[11px] text-zinc-400 font-normal">
                      Required per combo / Available in stock
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-xs">
                    {avail.components.map((comp, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 flex items-center justify-between ${
                          comp.isBottleneck
                            ? 'bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
                            : 'bg-white dark:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              comp.isBottleneck ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                          <span className="font-semibold truncate">{comp.name}</span>
                          <span className="font-mono text-[10px] text-zinc-400">({comp.sku})</span>
                        </div>
                        <div className="text-right shrink-0 font-mono text-[11px]">
                          <span className="font-bold text-zinc-900 dark:text-white">
                            {comp.requiredQty} req
                          </span>{' '}
                          <span className="text-zinc-400">/</span>{' '}
                          <span className={comp.isBottleneck ? 'text-amber-600 font-bold' : 'text-zinc-500'}>
                            {comp.availableStock} in stock
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financials / Profitability */}
                  <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 text-center text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-zinc-400 block font-bold">
                        Cost
                      </span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        ₹{combo.totalCost}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-zinc-400 block font-bold">
                        Selling
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-white">
                        ₹{combo.sellingPrice}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-zinc-400 block font-bold">
                        Profit
                      </span>
                      <span className="font-bold text-emerald-600">₹{combo.profit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-zinc-400 block font-bold">
                        Margin
                      </span>
                      <span className="font-bold text-emerald-600">
                        {combo.profitMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 bg-zinc-50/70 dark:bg-zinc-950/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDuplicateCombo(combo)}
                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    title="Duplicate Combo"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onEditCombo(combo)}
                    className="p-2 text-zinc-500 hover:text-blue-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    title="Edit Combo"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCombo(combo.id)}
                    className="p-2 text-zinc-500 hover:text-rose-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    title="Delete Combo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onSimulateSale(combo)}
                  disabled={avail.maxCombos === 0}
                  className="px-3.5 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Sale & Deduct Components</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
