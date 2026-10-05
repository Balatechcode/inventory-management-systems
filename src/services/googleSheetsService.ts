import { InventoryItem, StockMovement, StockStatus, MovementType } from '../types/inventory';
import { getAccessToken } from './firebaseAuth';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export const INVENTORY_SHEET_NAME = 'Inventory';
export const MOVEMENTS_SHEET_NAME = 'Stock Movements';

export const INVENTORY_HEADERS = [
  'Item ID',
  'SKU',
  'Item Name',
  'Category',
  'Quantity',
  'Min Threshold',
  'Unit Price ($)',
  'Supplier',
  'Location',
  'Last Updated',
  'Status',
];

export const MOVEMENTS_HEADERS = [
  'Timestamp',
  'Transaction ID',
  'Item ID',
  'SKU',
  'Item Name',
  'Type',
  'Qty Changed',
  'Previous Qty',
  'New Qty',
  'Reason',
  'Performed By',
];

// Seed sample data for newly created spreadsheets
export const INITIAL_SEED_ITEMS: Omit<InventoryItem, 'rowIndex'>[] = [
  {
    id: 'ITEM-1001',
    sku: 'ELC-LOG-01',
    name: 'Wireless Ergonomic Mouse',
    category: 'Electronics',
    quantity: 45,
    minThreshold: 15,
    unitPrice: 29.99,
    supplier: 'LogiTech Direct',
    location: 'Aisle 3 - Shelf B',
    lastUpdated: new Date().toISOString(),
    status: 'IN_STOCK',
  },
  {
    id: 'ITEM-1002',
    sku: 'ELC-MEC-02',
    name: 'RGB Mechanical Keyboard',
    category: 'Electronics',
    quantity: 8,
    minThreshold: 10,
    unitPrice: 89.50,
    supplier: 'Keychron Corp',
    location: 'Aisle 3 - Shelf A',
    lastUpdated: new Date().toISOString(),
    status: 'LOW_STOCK',
  },
  {
    id: 'ITEM-1003',
    sku: 'OFF-MON-03',
    name: '27-inch 4K IPS Monitor',
    category: 'Office Supplies',
    quantity: 3,
    minThreshold: 8,
    unitPrice: 280.00,
    supplier: 'VisionDisplay Inc',
    location: 'Warehouse Bay 1',
    lastUpdated: new Date().toISOString(),
    status: 'LOW_STOCK',
  },
  {
    id: 'ITEM-1004',
    sku: 'CAB-USBC-04',
    name: 'Braided USB-C Cable 2M',
    category: 'Accessories',
    quantity: 120,
    minThreshold: 25,
    unitPrice: 9.99,
    supplier: 'Anker Hub',
    location: 'Aisle 1 - Bin 4',
    lastUpdated: new Date().toISOString(),
    status: 'IN_STOCK',
  },
  {
    id: 'ITEM-1005',
    sku: 'HWD-SSDT-05',
    name: '2TB NVMe PCIe 4.0 SSD',
    category: 'Hardware',
    quantity: 0,
    minThreshold: 12,
    unitPrice: 149.99,
    supplier: 'Crucial Micron',
    location: 'Secure Cabinet C',
    lastUpdated: new Date().toISOString(),
    status: 'OUT_OF_STOCK',
  },
  {
    id: 'ITEM-1006',
    sku: 'OFF-CHAIR-06',
    name: 'Ergonomic Mesh Chair Pro',
    category: 'Office Supplies',
    quantity: 18,
    minThreshold: 5,
    unitPrice: 219.00,
    supplier: 'Steelcase Hub',
    location: 'Warehouse Bay 4',
    lastUpdated: new Date().toISOString(),
    status: 'IN_STOCK',
  },
  {
    id: 'ITEM-1007',
    sku: 'AUD-NOIS-07',
    name: 'Noise Cancelling Headphones',
    category: 'Electronics',
    quantity: 5,
    minThreshold: 10,
    unitPrice: 199.95,
    supplier: 'Sony Audio',
    location: 'Aisle 2 - Shelf C',
    lastUpdated: new Date().toISOString(),
    status: 'LOW_STOCK',
  },
];

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No active Google authentication token. Please sign in with Google.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Creates a brand new Google Spreadsheet configured with Inventory and Stock Movements tabs.
 */
export async function createInventorySpreadsheet(title: string = 'StockFlow Inventory Database') {
  const headers = await getAuthHeader();

  const response = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: INVENTORY_SHEET_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
        {
          properties: {
            title: MOVEMENTS_SHEET_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create spreadsheet: ${response.statusText}`
    );
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const inventorySheetId = data.sheets?.[0]?.properties?.sheetId || 0;
  const movementsSheetId = data.sheets?.[1]?.properties?.sheetId || 1;

  // Initialize Inventory headers & seed data
  const inventoryRows = [
    INVENTORY_HEADERS,
    ...INITIAL_SEED_ITEMS.map((item) => [
      item.id,
      item.sku,
      item.name,
      item.category,
      item.quantity.toString(),
      item.minThreshold.toString(),
      item.unitPrice.toFixed(2),
      item.supplier,
      item.location,
      item.lastUpdated,
      item.status,
    ]),
  ];

  await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}/values/${INVENTORY_SHEET_NAME}!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ values: inventoryRows }),
    }
  );

  // Initialize Stock Movements headers
  const initialMovements = [
    MOVEMENTS_HEADERS,
    [
      new Date().toISOString(),
      'TXN-INIT-01',
      'ITEM-1001',
      'ELC-LOG-01',
      'Wireless Ergonomic Mouse',
      'IN',
      '+45',
      '0',
      '45',
      'Initial Inventory Stocking',
      'System Setup',
    ],
  ];

  await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}/values/${MOVEMENTS_SHEET_NAME}!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ values: initialMovements }),
    }
  );

  // Apply styling: bold headers and color highlight to row 1
  try {
    await fetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: inventorySheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.12, green: 0.16, blue: 0.22 },
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          {
            repeatCell: {
              range: {
                sheetId: movementsSheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.12, green: 0.16, blue: 0.22 },
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('Could not apply header styling, continuing:', styleErr);
  }

  return {
    spreadsheetId,
    spreadsheetTitle: title,
    inventorySheetId,
    movementsSheetId,
  };
}

/**
 * Fetches spreadsheet metadata (title and sheet tabs with IDs)
 */
export async function getSpreadsheetDetails(spreadsheetId: string) {
  const headers = await getAuthHeader();
  const res = await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}?fields=properties.title,sheets.properties(sheetId,title)`,
    { headers }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch spreadsheet (${res.status})`);
  }

  const data = await res.json();
  const sheets = data.sheets || [];
  const inventorySheet = sheets.find(
    (s: { properties?: { title?: string } }) =>
      s.properties?.title?.toLowerCase() === INVENTORY_SHEET_NAME.toLowerCase()
  );
  const movementsSheet = sheets.find(
    (s: { properties?: { title?: string } }) =>
      s.properties?.title?.toLowerCase() === MOVEMENTS_SHEET_NAME.toLowerCase()
  );

  return {
    title: data.properties?.title || 'Inventory Spreadsheet',
    inventorySheetId: inventorySheet?.properties?.sheetId ?? sheets[0]?.properties?.sheetId ?? 0,
    movementsSheetId: movementsSheet?.properties?.sheetId,
    inventoryTabName: inventorySheet?.properties?.title || sheets[0]?.properties?.title || INVENTORY_SHEET_NAME,
    movementsTabName: movementsSheet?.properties?.title || MOVEMENTS_SHEET_NAME,
  };
}

/**
 * Reads all inventory items from the active Google Sheet
 */
export async function fetchInventoryItems(
  spreadsheetId: string,
  tabName: string = INVENTORY_SHEET_NAME
): Promise<InventoryItem[]> {
  const headers = await getAuthHeader();
  const range = `${encodeURIComponent(tabName)}!A2:K`;
  const res = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values/${range}`, { headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch inventory rows');
  }

  const data = await res.json();
  const rows: (string | number)[][] = data.values || [];

  return rows.map((row, index) => {
    const id = String(row[0] || `ITEM-${1000 + index}`);
    const sku = String(row[1] || `SKU-${index}`);
    const name = String(row[2] || 'Unnamed Product');
    const category = String(row[3] || 'General');
    const quantity = parseInt(String(row[4] || '0'), 10) || 0;
    const minThreshold = parseInt(String(row[5] || '10'), 10) || 10;
    const unitPrice = parseFloat(String(row[6] || '0').replace(/[^0-9.]/g, '')) || 0;
    const supplier = String(row[7] || 'Internal');
    const location = String(row[8] || 'Main Stock');
    const lastUpdated = String(row[9] || new Date().toISOString());

    let status: StockStatus = 'IN_STOCK';
    if (quantity === 0) {
      status = 'OUT_OF_STOCK';
    } else if (quantity <= minThreshold) {
      status = 'LOW_STOCK';
    }

    return {
      id,
      sku,
      name,
      category,
      quantity,
      minThreshold,
      unitPrice,
      supplier,
      location,
      lastUpdated,
      status,
      rowIndex: index + 2, // 1-based index (row 1 is header)
    };
  });
}

/**
 * Reads stock movement history from Google Sheet
 */
export async function fetchStockMovements(
  spreadsheetId: string,
  tabName: string = MOVEMENTS_SHEET_NAME
): Promise<StockMovement[]> {
  const headers = await getAuthHeader();
  const range = `${encodeURIComponent(tabName)}!A2:K`;
  const res = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values/${range}`, { headers });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  const rows: (string | number)[][] = data.values || [];

  return rows
    .map((row, index) => {
      const timestamp = String(row[0] || new Date().toISOString());
      const id = String(row[1] || `TXN-${index}`);
      const itemId = String(row[2] || '');
      const sku = String(row[3] || '');
      const itemName = String(row[4] || '');
      const rawType = String(row[5] || 'ADJUSTMENT').toUpperCase();
      const type: MovementType = rawType === 'IN' || rawType === 'OUT' ? rawType : 'ADJUSTMENT';
      const quantityChanged = parseInt(String(row[6] || '0').replace('+', ''), 10) || 0;
      const previousQuantity = parseInt(String(row[7] || '0'), 10) || 0;
      const newQuantity = parseInt(String(row[8] || '0'), 10) || 0;
      const reason = String(row[9] || 'Standard adjustment');
      const performedBy = String(row[10] || 'System');

      return {
        id,
        timestamp,
        itemId,
        sku,
        itemName,
        type,
        quantityChanged,
        previousQuantity,
        newQuantity,
        reason,
        performedBy,
      };
    })
    .reverse(); // latest first
}

/**
 * Appends a new inventory item row into Google Sheet
 */
export async function addInventoryItem(
  spreadsheetId: string,
  item: Omit<InventoryItem, 'rowIndex'>,
  tabName: string = INVENTORY_SHEET_NAME
) {
  const headers = await getAuthHeader();
  const rowData = [
    item.id,
    item.sku,
    item.name,
    item.category,
    item.quantity.toString(),
    item.minThreshold.toString(),
    item.unitPrice.toFixed(2),
    item.supplier,
    item.location,
    item.lastUpdated,
    item.status,
  ];

  const res = await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(tabName)}!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ values: [rowData] }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to append item to Google Sheet');
  }

  return res.json();
}

/**
 * Updates an existing inventory item in its exact Google Sheet row
 */
export async function updateInventoryItem(
  spreadsheetId: string,
  rowIndex: number,
  item: InventoryItem,
  tabName: string = INVENTORY_SHEET_NAME
) {
  const headers = await getAuthHeader();
  const rowData = [
    item.id,
    item.sku,
    item.name,
    item.category,
    item.quantity.toString(),
    item.minThreshold.toString(),
    item.unitPrice.toFixed(2),
    item.supplier,
    item.location,
    new Date().toISOString(),
    item.status,
  ];

  const range = `${encodeURIComponent(tabName)}!A${rowIndex}:K${rowIndex}`;
  const res = await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify({ values: [rowData] }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to update item in Google Sheet');
  }

  return res.json();
}

/**
 * Records a stock transaction in the Stock Movements sheet
 */
export async function appendStockMovement(
  spreadsheetId: string,
  movement: StockMovement,
  tabName: string = MOVEMENTS_SHEET_NAME
) {
  try {
    const headers = await getAuthHeader();
    const rowData = [
      movement.timestamp,
      movement.id,
      movement.itemId,
      movement.sku,
      movement.itemName,
      movement.type,
      movement.type === 'IN' ? `+${movement.quantityChanged}` : `-${movement.quantityChanged}`,
      movement.previousQuantity.toString(),
      movement.newQuantity.toString(),
      movement.reason,
      movement.performedBy,
    ];

    await fetch(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(tabName)}!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ values: [rowData] }),
      }
    );
  } catch (err) {
    console.error('Failed to log stock movement in sheet:', err);
  }
}

/**
 * Deletes a row from the Inventory Google Sheet using batchUpdate
 */
export async function deleteInventoryRow(
  spreadsheetId: string,
  sheetId: number,
  rowIndex: number // 1-based row index
) {
  const headers = await getAuthHeader();
  const res = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1, // 0-indexed
              endIndex: rowIndex,
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to delete row in Google Sheet');
  }

  return res.json();
}
