/**
 * ParcelGuru logistics integration.
 * Pushes orders to the ParcelGuru manifest after they are saved locally.
 * Demo base URL: https://demo.myparcelguru.com
 */

const PARCELGURU_BASE = process.env.PARCELGURU_BASE_URL || 'https://demo.myparcelguru.com';
const PARCELGURU_KEY  = process.env.PARCELGURU_API_KEY  || '';

// ─── Address parser ───────────────────────────────────────────────────────────
// Customers enter a free-text address field. We do best-effort extraction of
// pincode / city / state for the API, defaulting gracefully when fields are
// missing (acceptable in a test environment).
function parseShippingAddress(fullAddress = '') {
  const parts = fullAddress
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  // Look for a 6-digit Indian pincode anywhere in the string
  const pincodeMatch = fullAddress.match(/\b(\d{6})\b/);
  const pincode = pincodeMatch ? pincodeMatch[1] : '000000';

  // Heuristic: last part is state (or "state pincode"), second-to-last is city
  const statePart  = parts[parts.length - 1] || 'Maharashtra';
  const cityPart   = parts[parts.length - 2] || parts[0] || 'Pune';
  const address1   = parts[0] || fullAddress;
  const address2   = parts[1] || '';

  // Strip the pincode from the state part if it appears there
  const state = statePart.replace(/\d{6}/, '').trim() || 'Maharashtra';
  const city  = cityPart.replace(/\d{6}/, '').trim()  || 'Pune';

  return { address1, address2, city, state, pincode };
}

// ─── Name splitter ────────────────────────────────────────────────────────────
function splitName(fullName = '') {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || 'Customer';
  const lastName  = parts.slice(1).join(' ') || '.';
  return { firstName, lastName };
}

// ─── Build ParcelGuru payload ─────────────────────────────────────────────────
function buildPayload(order) {
  const { firstName, lastName } = splitName(order.customerName);
  const addr = parseShippingAddress(order.address);

  const items = (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) || [];

  const lineItems = items.map((item, i) => ({
    id:       item.id || i + 1,
    sku:      `SKU-${item.id || i + 1}`,
    title:    item.name  || 'CNC Crafts Item',
    quantity: item.quantity || 1,
    price:    String(item.price || 0),
    weight:   '250', // grams — generic for test env
  }));

  // Generic package dimensions suitable for CNC / art pieces (test env)
  const packageWeight = Math.max(0.5, items.reduce((s, i) => s + (i.quantity || 1) * 0.25, 0)).toFixed(2);

  const now        = new Date();
  const orderDate  = (order.created_at ? new Date(order.created_at) : now).toISOString();
  const invoiceDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                         .replace(/\//g, '-'); // dd-mm-yyyy

  return {
    order_id:                   `#CNC-${order.id}`,
    order_date:                  orderDate,
    order_status:                'paid',
    pickup_location:             '',            // uses default pickup location
    invoice_number:             `INV-CNC-${order.id}`,
    invoice_date:                invoiceDate,
    package_type:               'prepaid',
    package_declared_value:      String(order.total || 0),
    package_collectable_amount: '0',
    package_weight:              packageWeight,
    package_length:             '20',
    package_breadth:            '20',
    package_height:             '10',
    package_is_fragile:          false,
    line_items:                  lineItems,
    shipping_address: {
      first_name:  firstName,
      last_name:   lastName,
      address1:    addr.address1,
      address2:    addr.address2,
      city:        addr.city,
      state:       addr.state,
      country:    'India',
      pincode:     addr.pincode,
      latitude:   '',
      longitude:  '',
    },
    customer: {
      company:         '',
      first_name:       firstName,
      last_name:        lastName,
      phone:            order.customerPhone || '',
      alternate_phone: '',
      email:            order.customerEmail || '',
    },
  };
}

// ─── Push order to ParcelGuru ─────────────────────────────────────────────────
async function pushOrder(order) {
  if (!PARCELGURU_KEY) {
    console.warn('⚠️  PARCELGURU_API_KEY not set — skipping shipment push.');
    return { skipped: true };
  }

  const payload = buildPayload(order);

  console.log(`📦 Pushing order #${order.id} to ParcelGuru…`);

  const res = await fetch(`${PARCELGURU_BASE}/api/v1/channel/orders/create`, {
    method:  'POST',
    headers: {
      'Content-Type':              'application/json',
      'x-parcelguru-key':           PARCELGURU_KEY,
      'x-parcelguru-api-version':  'v1',
      'x-parcelguru-topic':        'myparcelguru.v1.order_processed',
    },
    body: JSON.stringify(payload),
  });

  let body;
  try { body = await res.json(); } catch { body = { raw: await res.text() }; }

  if (res.ok && body?.status === 'success') {
    console.log(`✅ ParcelGuru: order #${order.id} pushed — status: ${body.status}`);
  } else {
    console.error(`❌ ParcelGuru: order #${order.id} failed — HTTP ${res.status}`, body);
  }

  return body;
}

module.exports = { pushOrder };
