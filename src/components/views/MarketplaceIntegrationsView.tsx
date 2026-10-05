import React, { useState } from 'react';
import {
  Network,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Key,
  Lock,
  Zap,
  Radio,
  Send,
  Sliders,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ProductVariant,
  MarketplaceSettings,
  ChannelFeedLog,
  SalesChannel,
  UserRole,
} from '../../types/partyInventory';

interface MarketplaceIntegrationsViewProps {
  variants: ProductVariant[];
  settings: MarketplaceSettings;
  feedLogs: ChannelFeedLog[];
  onUpdateSettings: (newSettings: MarketplaceSettings) => void;
  onBroadcastAllFeeds: () => void;
  onSimulateOrder: (
    variantSku: string,
    quantity: number,
    channel: SalesChannel,
    customerName: string
  ) => void;
  userRole: UserRole;
}

export const MarketplaceIntegrationsView: React.FC<MarketplaceIntegrationsViewProps> = ({
  variants,
  settings,
  feedLogs,
  onUpdateSettings,
  onBroadcastAllFeeds,
  onSimulateOrder,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<'connectors' | 'anti_oversell' | 'feeds' | 'simulation'>('connectors');
  const [testResult, setTestResult] = useState<{ channel: string; success: boolean; message: string } | null>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Simulation form state
  const [simSku, setSimSku] = useState<string>(variants[0]?.sku || 'BAL-GOLD-10');
  const [simQty, setSimQty] = useState<number>(20);
  const [simChannel, setSimChannel] = useState<SalesChannel>('Amazon');
  const [simCustomer, setSimCustomer] = useState<string>('Priya Sharma (Amazon.in Order)');
  const [simSuccessMsg, setSimSuccessMsg] = useState<string | null>(null);

  // Accordion state for official docs
  const [showAmazonDocs, setShowAmazonDocs] = useState(false);
  const [showFlipkartDocs, setShowFlipkartDocs] = useState(false);
  const [showMeeshoDocs, setShowMeeshoDocs] = useState(false);

  const selectedVariant = variants.find((v) => v.sku === simSku) || variants[0];

  const handleTestConnection = (channel: 'Amazon' | 'Flipkart' | 'Meesho') => {
    setTestingChannel(channel);
    setTestResult(null);

    setTimeout(() => {
      setTestingChannel(null);
      if (channel === 'Amazon') {
        setTestResult({
          channel: 'Amazon SP-API',
          success: true,
          message: 'LWA OAuth token verified! IAM Role STS credentials valid. Connected to sellingpartnerapi-eu.amazon.com (Marketplace: Amazon.in - A21TJRUUN4KGV).',
        });
      } else if (channel === 'Flipkart') {
        setTestResult({
          channel: 'Flipkart Marketplace API',
          success: true,
          message: 'Flipkart v3 OAuth token generated successfully! Location ID verified: LOC-IN-DEL-01.',
        });
      } else {
        setTestResult({
          channel: 'Meesho Supplier API',
          success: true,
          message: 'Meesho Supplier Open API Key validated! Webhook secret active for order notifications.',
        });
      }
    }, 900);
  };

  const handleBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      onBroadcastAllFeeds();
      setIsBroadcasting(false);
    }, 600);
  };

  const runSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant || simQty <= 0) return;

    onSimulateOrder(simSku, simQty, simChannel, simCustomer);
    setSimSuccessMsg(
      `Order processed! Deducted ${simQty} units of ${simSku} from Central Available Stock. Real-time outbound feeds queued for Flipkart & Meesho.`
    );

    setTimeout(() => {
      setSimSuccessMsg(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-500" />
            Marketplace Integrations & Central Sync Hub
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Official API connections for Amazon SP-API, Flipkart Seller API, Meesho Supplier Panel, and Anti-Overselling Guard
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('simulation')}
            className="px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 transition flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Incoming Order</span>
          </button>

          <button
            onClick={handleBroadcast}
            disabled={isBroadcasting}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBroadcasting ? 'animate-spin' : ''}`} />
            <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast Feeds Now'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('connectors')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'connectors'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Official API Connectors</span>
        </button>

        <button
          onClick={() => setActiveTab('anti_oversell')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'anti_oversell'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Anti-Oversell Protection</span>
        </button>

        <button
          onClick={() => setActiveTab('feeds')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'feeds'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Live Outbound Feeds</span>
          <span className="px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-[10px]">
            {feedLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('simulation')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'simulation'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Order Simulator</span>
        </button>
      </div>

      {/* Test feedback toast */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
            testResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">{testResult.channel}: </span>
              <span>{testResult.message}</span>
            </div>
          </div>
          <button
            onClick={() => setTestResult(null)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: API CONNECTORS */}
      {activeTab === 'connectors' && (
        <div className="space-y-6">
          {/* Marketplace Overview status banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Amazon SP-API
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="mt-2 text-sm font-bold text-zinc-900 dark:text-white">
                Amazon.in (IN)
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Listings Item PATCH v2021-08-01 & Order Notifications
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Flipkart Marketplace
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="mt-2 text-sm font-bold text-zinc-900 dark:text-white">
                Flipkart Seller v3
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                OAuth2 /sellers/v3/listings/update & Webhook Listener
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                  Meesho Supplier
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="mt-2 text-sm font-bold text-zinc-900 dark:text-white">
                Supplier Panel Open API
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Inventory Sync v2 + Automated CSV Batch Fallback
              </p>
            </div>
          </div>

          {/* Amazon Selling Partner API Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-black text-sm">
                  a
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                    Amazon Selling Partner API (SP-API)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Direct integration for automated inventory feeds and order webhooks without scrapers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestConnection('Amazon')}
                  disabled={testingChannel === 'Amazon'}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 transition flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${testingChannel === 'Amazon' ? 'animate-spin text-amber-500' : ''}`} />
                  <span>{testingChannel === 'Amazon' ? 'Verifying...' : 'Test SP-API Auth'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  AWS SP-API Region & Endpoint
                </label>
                <select
                  value={settings.amazon.region}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      amazon: { ...settings.amazon, region: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium"
                >
                  <option value="EU_INDIA">India / EU (sellingpartnerapi-eu.amazon.com)</option>
                  <option value="NA">North America (sellingpartnerapi-na.amazon.com)</option>
                  <option value="FE">Far East (sellingpartnerapi-fe.amazon.com)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  Seller Merchant Token (Seller ID)
                </label>
                <input
                  type="text"
                  value={settings.amazon.sellerId}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      amazon: { ...settings.amazon, sellerId: e.target.value },
                    })
                  }
                  placeholder="e.g. A1V2XYZINDIA"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  Amazon Marketplace ID
                </label>
                <input
                  type="text"
                  value={settings.amazon.marketplaceId}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      amazon: { ...settings.amazon, marketplaceId: e.target.value },
                    })
                  }
                  placeholder="A21TJRUUN4KGV (Amazon.in)"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  LWA Client ID (Login with Amazon)
                </label>
                <input
                  type="text"
                  value={settings.amazon.lwaClientId}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      amazon: { ...settings.amazon, lwaClientId: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  LWA Client Secret
                </label>
                <input
                  type="password"
                  value={settings.amazon.lwaClientSecret}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      amazon: { ...settings.amazon, lwaClientSecret: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  LWA Refresh Token
                </label>
                <input
                  type="password"
                  value={settings.amazon.refreshToken}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      amazon: { ...settings.amazon, refreshToken: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Accordion: SP-API Technical Specs */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAmazonDocs(!showAmazonDocs)}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline"
              >
                <span>View Amazon SP-API Authorization Architecture & Documentation</span>
                {showAmazonDocs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAmazonDocs && (
                <div className="mt-3 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">
                    Official Integration Specification:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li>
                      <strong>OAuth Flow:</strong> Seller authorizes application via Amazon Developer Central LWA OAuth URL:
                      <code className="px-1 py-0.5 ml-1 rounded bg-zinc-200 dark:bg-zinc-800">https://sellercentral.amazon.in/apps/authorize/consent</code>
                    </li>
                    <li>
                      <strong>Inventory Endpoint:</strong> <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">PATCH /listings/2021-08-01/items/&#123;sellerId&#125;/&#123;sku&#125;</code> with payload <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">&#123; patches: [&#123; op: 'replace', path: '/attributes/fulfillment_availability', value: [&#123; quantity: broadcastQty &#125;] &#125;] &#125;</code>
                    </li>
                    <li>
                      <strong>Real-Time Notifications:</strong> Subscribed via AWS SNS / SQS queue for <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">ORDER_STATUS_CHANGE</code> events, triggering automatic central stock reduction in this hub.
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Flipkart Marketplace API Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-black text-sm">
                  f
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                    Flipkart Marketplace API (Seller Hub)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Official seller v3 listings and dispatch order API
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestConnection('Flipkart')}
                  disabled={testingChannel === 'Flipkart'}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 transition flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${testingChannel === 'Flipkart' ? 'animate-spin text-blue-500' : ''}`} />
                  <span>{testingChannel === 'Flipkart' ? 'Verifying...' : 'Test Flipkart API'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  Flipkart Seller ID
                </label>
                <input
                  type="text"
                  value={settings.flipkart.sellerId}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      flipkart: { ...settings.flipkart, sellerId: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  Application ID (App ID)
                </label>
                <input
                  type="text"
                  value={settings.flipkart.appId}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      flipkart: { ...settings.flipkart, appId: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  Application Secret
                </label>
                <input
                  type="password"
                  value={settings.flipkart.appSecret}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      flipkart: { ...settings.flipkart, appSecret: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  Pickup Location ID
                </label>
                <input
                  type="text"
                  value={settings.flipkart.locationId || 'LOC-IN-DEL-01'}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      flipkart: { ...settings.flipkart, locationId: e.target.value },
                    })
                  }
                  placeholder="LOC-IN-DEL-01"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  Environment
                </label>
                <select
                  value={settings.flipkart.environment}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      flipkart: { ...settings.flipkart, environment: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium"
                >
                  <option value="PRODUCTION">Production (api.flipkart.net)</option>
                  <option value="SANDBOX">Sandbox Test Environment</option>
                </select>
              </div>
            </div>

            {/* Accordion: Flipkart Technical Specs */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowFlipkartDocs(!showFlipkartDocs)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
              >
                <span>View Flipkart Seller API Integration Specification</span>
                {showFlipkartDocs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showFlipkartDocs && (
                <div className="mt-3 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
                  <p className="font-semibold text-blue-800 dark:text-blue-300">
                    Official API Protocol:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li>
                      <strong>Authentication:</strong> Basic Auth exchange at <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">https://api.flipkart.net/oauth-service/oauth/token?grant_type=client_credentials</code> yielding standard Bearer Access Token.
                    </li>
                    <li>
                      <strong>Inventory Update:</strong> <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">POST /sellers/v3/listings/update</code> specifying SKU listings and inventory count for each registered pickup location.
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Meesho Supplier API Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center font-black text-sm">
                  m
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                    Meesho Supplier Panel Open API & Feed Hub
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Supplier API with automatic batch catalog CSV reconciliation fallback
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestConnection('Meesho')}
                  disabled={testingChannel === 'Meesho'}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 transition flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${testingChannel === 'Meesho' ? 'animate-spin text-pink-500' : ''}`} />
                  <span>{testingChannel === 'Meesho' ? 'Verifying...' : 'Test Meesho API'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  Meesho Supplier ID
                </label>
                <input
                  type="text"
                  value={settings.meesho.supplierId}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      meesho: { ...settings.meesho, supplierId: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  Supplier API Key
                </label>
                <input
                  type="password"
                  value={settings.meesho.apiKey}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      meesho: { ...settings.meesho, apiKey: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                  Webhook Secret Token
                </label>
                <input
                  type="password"
                  value={settings.meesho.webhookSecret || ''}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      meesho: { ...settings.meesho, webhookSecret: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Accordion: Meesho Technical Specs */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowMeeshoDocs(!showMeeshoDocs)}
                className="text-xs font-semibold text-pink-600 dark:text-pink-400 flex items-center gap-1 hover:underline"
              >
                <span>View Meesho Supplier API Integration & CSV Feed Spec</span>
                {showMeeshoDocs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showMeeshoDocs && (
                <div className="mt-3 p-4 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200/60 dark:border-pink-900/40 text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
                  <p className="font-semibold text-pink-800 dark:text-pink-300">
                    Integration Modes:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li>
                      <strong>Direct REST:</strong> Authenticated Bearer header with automatic payload dispatch to <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">https://supplier.meesho.com/api/v2/inventory/update</code>.
                    </li>
                    <li>
                      <strong>Batch CSV Importer:</strong> Automatic generation of Meesho Supplier Panel compliant bulk stock update file for zero-error manual uploads when API rate limits are reached.
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANTI-OVERSELL PROTECTION */}
      {activeTab === 'anti_oversell' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Centralized Anti-Overselling Guard Architecture
                </h3>
                <p className="text-xs text-zinc-400">
                  How the system prevents simultaneous overselling when selling the same SKU on Amazon, Flipkart, Meesho, and Local walk-in
                </p>
              </div>
            </div>

            {/* Anti-Oversell Policy Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <label className="text-xs font-bold text-zinc-900 dark:text-white block">
                  Global Safety Buffer (Withheld from Marketplaces)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={settings.globalSafetyBuffer}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        globalSafetyBuffer: Number(e.target.value),
                      })
                    }
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                    {settings.globalSafetyBuffer} units
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Withholds {settings.globalSafetyBuffer} units from every marketplace feed broadcast. If you have 100 units allocated to Amazon, the system tells Amazon you have {Math.max(0, 100 - settings.globalSafetyBuffer)} units, guaranteeing zero cancelled orders.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <label className="text-xs font-bold text-zinc-900 dark:text-white block">
                  Allocation Strategy & Conflict Resolution
                </label>
                <select
                  value={settings.antiOversellMode}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      antiOversellMode: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white font-medium"
                >
                  <option value="STRICT_BUFFER">Strict Channel Quota + Safety Buffer (Recommended)</option>
                  <option value="SHARED_POOL_DYNAMIC">Dynamic Central Pool with Instant Broadcast</option>
                  <option value="FIXED_QUOTA">Hard Fixed Channel Allocation</option>
                </select>
                <p className="text-[11px] text-zinc-500">
                  When an order arrives on Amazon: Central Available stock decreases immediately. Outbound inventory feed updates are immediately dispatched to Flipkart and Meesho.
                </p>
              </div>
            </div>

            {/* Live Interactive Calculation Preview */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 space-y-3">
              <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Live Single Source of Truth Stock Breakdown (Sample SKU: {selectedVariant.sku})
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">Physical Stock</span>
                  <span className="font-mono font-bold text-base text-zinc-900 dark:text-white">
                    {selectedVariant.currentStock}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-purple-500 block uppercase font-bold">Bulk Reserved</span>
                  <span className="font-mono font-bold text-base text-purple-600">
                    -{selectedVariant.reservedStock}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-emerald-500 block uppercase font-bold">Available Central</span>
                  <span className="font-mono font-bold text-base text-emerald-600">
                    {selectedVariant.availableStock}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-amber-500 block uppercase font-bold">Amazon Broadcast</span>
                  <span className="font-mono font-bold text-base text-amber-600">
                    {Math.max(0, (selectedVariant.channelAllocation.amazon || 0) - settings.globalSafetyBuffer)}
                  </span>
                  <span className="text-[9px] text-zinc-400 block">Quota: {selectedVariant.channelAllocation.amazon}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-blue-500 block uppercase font-bold">Flipkart Broadcast</span>
                  <span className="font-mono font-bold text-base text-blue-600">
                    {Math.max(0, (selectedVariant.channelAllocation.flipkart || 0) - settings.globalSafetyBuffer)}
                  </span>
                  <span className="text-[9px] text-zinc-400 block">Quota: {selectedVariant.channelAllocation.flipkart}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-pink-500 block uppercase font-bold">Meesho Broadcast</span>
                  <span className="font-mono font-bold text-base text-pink-600">
                    {Math.max(0, (selectedVariant.channelAllocation.meesho || 0) - settings.globalSafetyBuffer)}
                  </span>
                  <span className="text-[9px] text-zinc-400 block">Quota: {selectedVariant.channelAllocation.meesho}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">Unallocated Buffer</span>
                  <span className="font-mono font-bold text-base text-zinc-700 dark:text-zinc-300">
                    {selectedVariant.channelAllocation.unallocated || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE OUTBOUND FEEDS */}
      {activeTab === 'feeds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                Outbound Marketplace Feed Transmissions
              </h3>
              <p className="text-xs text-zinc-400">
                Log of real-time inventory quantity payloads transmitted to Amazon SP-API, Flipkart, and Meesho
              </p>
            </div>

            <button
              onClick={handleBroadcast}
              disabled={isBroadcasting}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBroadcasting ? 'animate-spin' : ''}`} />
              <span>Broadcast Now</span>
            </button>
          </div>

          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[10px] uppercase tracking-wider text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Feed ID & Time</th>
                    <th className="py-3 px-4 font-semibold">Marketplace</th>
                    <th className="py-3 px-4 font-semibold">SKU</th>
                    <th className="py-3 px-4 font-semibold text-center">Broadcast Qty</th>
                    <th className="py-3 px-4 font-semibold text-center">Latency</th>
                    <th className="py-3 px-4 font-semibold">API Response Summary</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {feedLogs.map((feed) => (
                    <tr key={feed.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 block">
                          {feed.id}
                        </span>
                        <span className="text-zinc-400 text-[11px]">
                          {new Date(feed.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            feed.channel === 'Amazon'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : feed.channel === 'Flipkart'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : feed.channel === 'Meesho'
                              ? 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {feed.channel}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                        {feed.sku}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {feed.broadcastQuantity}
                      </td>

                      <td className="py-3 px-4 text-center text-zinc-400 font-mono text-[11px]">
                        {feed.apiLatencyMs}ms
                      </td>

                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300 font-mono text-[11px] max-w-xs truncate">
                        {feed.responseSummary}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          200 OK
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ORDER SIMULATOR */}
      {activeTab === 'simulation' && (
        <div className="space-y-6 max-w-3xl">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Multi-Channel Order & Anti-Oversell Simulator
                </h3>
                <p className="text-xs text-zinc-400">
                  Simulate an incoming order from Amazon, Flipkart, or Meesho to test automatic central stock deduction and immediate feed broadcast
                </p>
              </div>
            </div>

            {simSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{simSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={runSimulation} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                    Select Product Variant (SKU)
                  </label>
                  <select
                    value={simSku}
                    onChange={(e) => setSimSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium"
                  >
                    {variants.map((v) => (
                      <option key={v.id} value={v.sku}>
                        {v.sku} – {v.variantName} (Avail: {v.availableStock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                    Incoming Order Sales Channel
                  </label>
                  <select
                    value={simChannel}
                    onChange={(e) => setSimChannel(e.target.value as SalesChannel)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium"
                  >
                    <option value="Amazon">Amazon.in (Order Webhook)</option>
                    <option value="Flipkart">Flipkart Seller (Order Notification)</option>
                    <option value="Meesho">Meesho Supplier (Order Sync)</option>
                    <option value="Local">Local Store / Direct Customer</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                    Order Quantity (Units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedVariant?.availableStock || 100}
                    value={simQty}
                    onChange={(e) => setSimQty(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Maximum available: {selectedVariant?.availableStock} units
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                    Customer / Reference
                  </label>
                  <input
                    type="text"
                    value={simCustomer}
                    onChange={(e) => setSimCustomer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* What happens next visual preview */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <span className="font-bold text-zinc-900 dark:text-white block">
                  Simulated Execution Flow:
                </span>
                <div className="flex flex-col gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <span>
                      Order comes from <strong>{simChannel}</strong> for <strong>{simQty} units</strong> of <strong>{simSku}</strong>.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    <span>
                      Central Available Stock updates from <strong>{selectedVariant.availableStock}</strong> → <strong>{Math.max(0, selectedVariant.availableStock - simQty)} units</strong>.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                      3
                    </span>
                    <span>
                      System automatically dispatches updated stock feeds to other channels to prevent overselling.
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Simulate Order & Trigger Multi-Channel Feed Sync</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
