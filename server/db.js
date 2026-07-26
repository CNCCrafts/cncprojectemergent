/**
 * MongoDB-backed data layer for CNC ECOM.
 * All persistent app data (products, orders, customers, contact forms,
 * settings) lives in MongoDB Atlas. Images stay on Cloudinary.
 */
const { MongoClient } = require('mongodb');

const uri    = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'cnc_ecom';

if (!uri) {
  console.error('❌ MONGODB_URI missing in env — server will start in degraded mode (no DB operations work).');
  console.error('⚠️  Set MONGODB_URI in your .env file and restart.');
  // Don't crash — admin login still works
}

let client, db;
let productsCol, ordersCol, customersCol, contactsCol, settingsCol, countersCol;

// ─── Counters (auto-increment ids) ───────────────────────────────────────────
async function nextId(name) {
  if (!countersCol) throw new Error('Database not connected');
  const res = await countersCol.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return res.value ? res.value.seq : res.seq;
}

// ─── Boot ────────────────────────────────────────────────────────────────────
async function connect() {
  if (!uri) {
    throw new Error('MONGODB_URI not set — cannot connect to database');
  }
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 10,
  });
  await client.connect();
  db           = client.db(dbName);
  productsCol  = db.collection('products');
  ordersCol    = db.collection('orders');
  customersCol = db.collection('customers');
  contactsCol  = db.collection('contact_forms');
  settingsCol  = db.collection('settings');
  countersCol  = db.collection('counters');

  await Promise.all([
    productsCol.createIndex({ id: 1 }, { unique: true }),
    productsCol.createIndex({ category: 1 }),
    ordersCol.createIndex({ id: 1 }, { unique: true }),
    ordersCol.createIndex({ customerEmail: 1 }),
    customersCol.createIndex({ email: 1 }, { unique: true }),
    contactsCol.createIndex({ created_at: -1 }),
    settingsCol.createIndex({ key: 1 }, { unique: true }),
  ]);

  await seedIfEmpty();
  console.log(`✅ Mongo connected → db="${dbName}"`);
}

// ─── Seeding ────────────────────────────────────────────────────────────────
async function seedIfEmpty() {
  const count = await productsCol.countDocuments();
  if (count > 0) {
    // Ensure Custom Order product exists
    const co = await productsCol.findOne({ category: 'custom' });
    if (!co) await productsCol.insertOne(customOrderProduct(await nextId('products')));
    return;
  }

  const now = new Date().toISOString();
  const seed = [
    { name: 'Floral Acrylic Wall Art',    category: 'acrylic', price: 1299, offer_price: null, description: 'Elegant hand-crafted floral design on premium acrylic panel. Perfect for living rooms.',      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80', image_id: '', stock: 25, active: true, created_at: now },
    { name: 'Acrylic Family Name Plaque', category: 'acrylic', price:  899, offer_price: null, description: 'Personalized family name plaque in crystal-clear acrylic with gold lettering.',                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', image_id: '', stock: 30, active: true, created_at: now },
    { name: 'Geometric Acrylic Panel',    category: 'acrylic', price: 1599, offer_price: null, description: 'Modern geometric pattern in multi-layered acrylic. UV resistant finish.',                        image: 'https://images.unsplash.com/photo-1561518776-e76a5e48f731?w=400&q=80', image_id: '', stock: 15, active: true, created_at: now },
    { name: 'Mandala MDF Wall Decor',     category: 'mdf',     price:  799, offer_price: null, description: 'Intricately laser-cut mandala design on 6mm MDF board. Ready to hang.',                          image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&q=80', image_id: '', stock: 40, active: true, created_at: now },
    { name: 'MDF Tree of Life',           category: 'mdf',     price: 1099, offer_price: null, description: 'Beautiful Tree of Life CNC-cut from premium MDF. Available in natural or painted finish.',       image: 'https://images.unsplash.com/photo-1534889156217-d643df14f14a?w=400&q=80', image_id: '', stock: 20, active: true, created_at: now },
    { name: 'MDF Nameplate for Door',     category: 'mdf',     price:  499, offer_price: null, description: 'Custom door nameplate with elegant fonts and decorative borders.',                              image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', image_id: '', stock: 50, active: true, created_at: now },
    { name: 'ACP Office Signage',         category: 'acp',     price: 2499, offer_price: null, description: 'Professional aluminium composite panel signage with digital print. Weather-proof.',              image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', image_id: '', stock: 10, active: true, created_at: now },
    { name: 'ACP Shop Board',             category: 'acp',     price: 3999, offer_price: null, description: 'High-visibility shop board with LED backlit option on ACP base.',                                 image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80', image_id: '', stock:  8, active: true, created_at: now },
    { name: 'ACP Brand Logo Panel',       category: 'acp',     price: 1999, offer_price: null, description: 'Precision-cut brand logo panel on brushed aluminium composite. Rust-proof.',                       image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80', image_id: '', stock: 12, active: true, created_at: now },
    { name: 'PVC Foam Board Letters',     category: 'pvc',     price:  649, offer_price: null, description: 'Cut-to-shape foam board letters for interior displays. Lightweight & durable.',                    image: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=400&q=80', image_id: '', stock: 60, active: true, created_at: now },
    { name: 'PVC Wedding Backdrop',       category: 'pvc',     price: 2999, offer_price: null, description: 'Elegant custom PVC backdrop for weddings & events. Printed with premium UV inks.',                image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80', image_id: '', stock:  5, active: true, created_at: now },
    { name: 'PVC Wall Sticker Set',       category: 'pvc',     price:  399, offer_price: null, description: 'Set of decorative PVC wall stickers. Easy peel-and-stick application.',                            image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80', image_id: '', stock: 80, active: true, created_at: now },
    { name: '3D Geometric Lamp',          category: '3d',      price: 1849, offer_price: null, description: 'Stunning 3D printed geometric lamp with warm LED. Multiple finish options.',                       image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80', image_id: '', stock: 18, active: true, created_at: now },
    { name: '3D Miniature Architecture',  category: '3d',      price: 3499, offer_price: null, description: 'Detailed 3D model of iconic architecture. Custom designs available.',                              image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80', image_id: '', stock:  7, active: true, created_at: now },
    { name: '3D Trophy & Award',          category: '3d',      price: 1249, offer_price: null, description: 'Custom 3D printed trophy for corporate events & sports. Gold/silver finish.',                      image: 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=400&q=80', image_id: '', stock: 22, active: true, created_at: now },
  ];

  const withIds = [];
  for (const p of seed) withIds.push({ id: await nextId('products'), ...p });
  withIds.push(customOrderProduct(await nextId('products')));
  await productsCol.insertMany(withIds);
  console.log('✅ Seeded sample products (incl. Custom Order).');
}

function customOrderProduct(id) {
  return {
    id,
    name:        'Custom Order — Bring Your Vision',
    category:    'custom',
    price:       0,
    offer_price: null,
    description: 'Have something unique in mind? Submit a custom order with your design brief, materials, dimensions and timeline — our craft team will get back with a personalised quote.',
    image:       'https://images.unsplash.com/photo-1607988795691-3d0147b43231?w=600&q=80',
    image_id:    '',
    stock:       999,
    active:      true,
    is_custom:   true,
    created_at:  new Date().toISOString(),
  };
}

// ─── Products ────────────────────────────────────────────────────────────────
async function getAllProducts({ activeOnly = false, category = null } = {}) {
  if (!productsCol) return [];
  const q = {};
  if (activeOnly) q.active = true;
  if (category)   q.category = category;
  return productsCol.find(q, { projection: { _id: 0 } }).sort({ created_at: -1 }).toArray();
}
async function getProduct(id) {
  if (!productsCol) return null;
  return productsCol.findOne({ id: Number(id) }, { projection: { _id: 0 } });
}
async function addProduct(product) {
  const id = await nextId('products');
  const entry = { id, ...product, created_at: new Date().toISOString() };
  await productsCol.insertOne(entry);
  const { _id, ...rest } = entry;
  return rest;
}
async function updateProduct(id, updates) {
  await productsCol.updateOne({ id: Number(id) }, { $set: updates });
  return getProduct(id);
}
async function deleteProduct(id) {
  const r = await productsCol.findOneAndDelete({ id: Number(id) });
  return r?.value || null;
}

// ─── Orders ─────────────────────────────────────────────────────────────────
async function getAllOrders() {
  if (!ordersCol) return [];
  return ordersCol.find({}, { projection: { _id: 0 } }).sort({ created_at: -1 }).toArray();
}
async function getOrder(id) {
  if (!ordersCol) return null;
  return ordersCol.findOne({ id: Number(id) }, { projection: { _id: 0 } });
}
async function addOrder(order) {
  const id = await nextId('orders');
  const entry = {
    id,
    ...order,
    customerEmail: (order.customerEmail || '').toLowerCase(),
    status: order.status || 'pending',
    created_at: new Date().toISOString(),
  };
  await ordersCol.insertOne(entry);
  const { _id, ...rest } = entry;
  return rest;
}
async function updateOrderStatus(id, status) {
  await ordersCol.updateOne({ id: Number(id) }, { $set: { status } });
  return getOrder(id);
}

// ─── Customers ──────────────────────────────────────────────────────────────
async function getAllCustomers() {
  if (!customersCol) return [];
  return customersCol.find({}, { projection: { _id: 0, password: 0 } }).toArray();
}
async function getCustomerByEmail(email) {
  if (!customersCol) return null;
  return customersCol.findOne({ email: email.toLowerCase() });
}
async function getCustomer(id) {
  if (!customersCol) return null;
  return customersCol.findOne({ id: Number(id) }, { projection: { _id: 0, password: 0 } });
}
async function addCustomer(customer) {
  const id = await nextId('customers');
  const entry = { id, ...customer, email: customer.email.toLowerCase(), created_at: new Date().toISOString() };
  await customersCol.insertOne(entry);
  const { _id, password, ...rest } = entry;
  return rest;
}

// ─── Contact Forms ──────────────────────────────────────────────────────────
async function addContact(payload) {
  const id = await nextId('contacts');
  const entry = { id, ...payload, created_at: new Date().toISOString() };
  await contactsCol.insertOne(entry);
  const { _id, ...rest } = entry;
  return rest;
}
async function getAllContacts() {
  if (!contactsCol) return [];
  return contactsCol.find({}, { projection: { _id: 0 } }).sort({ created_at: -1 }).toArray();
}

// ─── Settings ───────────────────────────────────────────────────────────────
async function getSettings() {
  if (!settingsCol) return {};
  const rows = await settingsCol.find({}, { projection: { _id: 0 } }).toArray();
  const s = {};
  for (const r of rows) s[r.key] = r.value;
  return s;
}
async function setSetting(key, value) {
  await settingsCol.updateOne({ key }, { $set: { key, value } }, { upsert: true });
}

// ─── Stock ──────────────────────────────────────────────────────────────────
async function decrementStock(productId, quantity) {
  if (!productsCol) return;
  await productsCol.updateOne(
    { id: Number(productId), stock: { $gt: 0 } },
    { $inc: { stock: -Math.abs(quantity) } },
  );
}

module.exports = {
  connect,
  getAllProducts, getProduct, addProduct, updateProduct, deleteProduct,
  getAllOrders, getOrder, addOrder, updateOrderStatus,
  getAllCustomers, getCustomerByEmail, getCustomer, addCustomer,
  addContact, getAllContacts,
  getSettings, setSetting,
  decrementStock,
};
