import { InventoryItem, StockMovement, LowStockAlert } from '../types/inventory';

function downloadCSV(csvContent: string, fileName: string) {
  // UTF-8 BOM prefix (\uFEFF) ensures Excel properly decodes utf-8 characters
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportInventoryToCSV(items: InventoryItem[], title: string = 'StockFlow_Inventory') {
  const headers = [
    'Item ID',
    'SKU',
    'Item Name',
    'Category',
    'Current Quantity',
    'Min Threshold',
    'Unit Price ($)',
    'Total Value ($)',
    'Supplier',
    'Location',
    'Status',
    'Last Updated',
  ];

  const rows = items.map((item) => [
    escapeCSV(item.id),
    escapeCSV(item.sku),
    escapeCSV(item.name),
    escapeCSV(item.category),
    item.quantity,
    item.minThreshold,
    item.unitPrice.toFixed(2),
    (item.quantity * item.unitPrice).toFixed(2),
    escapeCSV(item.supplier),
    escapeCSV(item.location),
    escapeCSV(item.status),
    escapeCSV(item.lastUpdated),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSV(csvContent, `${title}_${dateStr}.csv`);
}

export function exportLowStockReport(alerts: LowStockAlert[]) {
  const headers = [
    'Item ID',
    'SKU',
    'Product Name',
    'Category',
    'Current Stock',
    'Min Threshold',
    'Units Short',
    'Severity Level',
  ];

  const rows = alerts.map((a) => [
    escapeCSV(a.itemId),
    escapeCSV(a.sku),
    escapeCSV(a.name),
    escapeCSV(a.category),
    a.currentQuantity,
    a.minThreshold,
    Math.max(0, a.minThreshold - a.currentQuantity),
    escapeCSV(a.severity),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSV(csvContent, `StockFlow_Low_Stock_Report_${dateStr}.csv`);
}

export function exportMovementsToCSV(movements: StockMovement[]) {
  const headers = [
    'Timestamp',
    'Transaction ID',
    'Item ID',
    'SKU',
    'Product Name',
    'Type',
    'Quantity Changed',
    'Previous Qty',
    'New Qty',
    'Reason',
    'User / Actor',
  ];

  const rows = movements.map((m) => [
    escapeCSV(m.timestamp),
    escapeCSV(m.id),
    escapeCSV(m.itemId),
    escapeCSV(m.sku),
    escapeCSV(m.itemName),
    escapeCSV(m.type),
    m.type === 'IN' ? `+${m.quantityChanged}` : `-${m.quantityChanged}`,
    m.previousQuantity,
    m.newQuantity,
    escapeCSV(m.reason),
    escapeCSV(m.performedBy),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSV(csvContent, `StockFlow_Audit_Trail_${dateStr}.csv`);
}
