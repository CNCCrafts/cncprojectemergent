const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express  = require('express');
const cors     = require('cors');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const multer   = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const db           = require('./db');
const cloudinary   = require('./config/cloudinary');
const parcelguru   = require('./parcelguru');
const connectDB    = require('./config/db'); // Mongoose connection

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Upload storage: Cloudinary when configured, else local disk ─────────────
const CLOUDINARY_ENABLED =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET &&
  !process.env.CLOUDINARY_API_SECRET.includes('your_') &&
  !process.env.CLOUDINARY_API_SECRET.includes('here');

const uploadsDir = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadsDir)) require('fs').mkdirSync(uploadsDir, { recursive: true });

const storage = CLOUDINARY_ENABLED
  ? new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => ({
        folder:          'cnc-ecom',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation:  [{ quality: 'auto', fetch_format: 'auto' }],
        public_id:       `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }),
    })
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadsDir),
      filename:    (req, file, cb) => {
        const ext  = path.extname(file.originalname) || '.jpg';
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

console.log(`📸 Image storage: ${CLOUDINARY_ENABLED ? 'Cloudinary' : 'Local disk'}`);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ─── JWT auth (stateless — survives cold starts) ─────────────────────────────
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@cnccrafts.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@123';
const JWT_SECRET     = process.env.SESSION_SECRET || 'cnc-secret-default';
const TOKEN_TTL      = '30d';

console.log(`🔐 Admin login: expected email="${ADMIN_EMAIL}" (from env: ${process.env.ADMIN_EMAIL ? 'YES' : 'NO — using default'})`);
console.log(`🔐 Admin login: expected password set=${ADMIN_PASSWORD ? 'YES' : 'NO'}`);

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}
function verifyToken(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// Health
app.get('/api/health', async (req, res) => {
  res.json({ ok: true, mongo: 'connected', cloudinary: CLOUDINARY_ENABLED, ts: new Date().toISOString() });
});

// ─── Auth — Admin ─────────────────────────────────────────────────────────────
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
    return res.json({ token: signToken({ role: 'admin', email: ADMIN_EMAIL }) });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/auth/verify', (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, role: decoded.role });
  } catch {
    return res.status(401).json({ valid: false });
  }
});

app.post('/api/auth/logout', (req, res) => { res.json({ success: true }); });

// ─── Auth — Customers ─────────────────────────────────────────────────────────
app.post('/api/auth/customer-register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });
    if (password.length < 6)          return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = await db.getCustomerByEmail(email);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const password_hash = await bcrypt.hash(password, 10);
    const customer = await db.addCustomer({ name, email, password: password_hash });
    const token    = signToken({ role: 'customer', email: customer.email, name: customer.name });
    res.json({ customer: { id: customer.id, name: customer.name, email: customer.email }, token });
  } catch (err) {
    console.error('register:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/customer-login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const customer = await db.getCustomerByEmail(email);
    if (!customer) return res.status(401).json({ error: 'Invalid email or password.' });
    const ok = await bcrypt.compare(password, customer.password || '');
    if (!ok)       return res.status(401).json({ error: 'Invalid email or password.' });

    const token = signToken({ role: 'customer', email: customer.email, name: customer.name });
    res.json({ customer: { id: customer.id, name: customer.name, email: customer.email }, token });
  } catch (err) {
    console.error('login:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── File Upload → Cloudinary or Local ───────────────────────────────────────
app.post('/api/upload', verifyToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (CLOUDINARY_ENABLED) {
    return res.json({ url: req.file.path, public_id: req.file.filename });
  }
  return res.json({ url: `/uploads/${req.file.filename}`, public_id: req.file.filename });
});
app.use('/uploads', express.static(uploadsDir));

// ─── Products ─────────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.getAllProducts({ activeOnly: true, category: req.query.category || null });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products/all', async (req, res) => {
  try { res.json(await db.getAllProducts()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.getProduct(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', verifyToken, async (req, res) => {
  try {
    const { name, category, price, offer_price, description, image, image_id, stock } = req.body;
    const product = await db.addProduct({
      name, category,
      price:       parseFloat(price) || 0,
      offer_price: offer_price != null && offer_price !== '' ? parseFloat(offer_price) : null,
      description: description || '',
      image:       image || '',
      image_id:    image_id || '',
      stock:       parseInt(stock) || 0,
      active:      true,
    });
    res.json({ id: product.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/products/:id', verifyToken, async (req, res) => {
  try {
    const { name, category, price, offer_price, description, image, image_id, stock, active } = req.body;
    await db.updateProduct(req.params.id, {
      name, category,
      price:       parseFloat(price) || 0,
      offer_price: offer_price != null && offer_price !== '' ? parseFloat(offer_price) : null,
      description, image,
      image_id:    image_id || '',
      stock:       parseInt(stock) || 0,
      active:      active ?? true,
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', verifyToken, async (req, res) => {
  try {
    const product = await db.getProduct(req.params.id);
    if (product?.image_id) {
      if (CLOUDINARY_ENABLED) cloudinary.uploader.destroy(product.image_id).catch(() => {});
      else                    try { require('fs').unlinkSync(path.join(uploadsDir, product.image_id)); } catch {}
    }
    await db.deleteProduct(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Orders ───────────────────────────────────────────────────────────────────
function parseItems(o) {
  return { ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []) };
}

app.get('/api/orders', verifyToken, async (req, res) => {
  try {
    const orders = (await db.getAllOrders()).map(parseItems);
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/orders/track', async (req, res) => {
  try {
    const { id, email } = req.query;
    if (!id || !email) return res.status(400).json({ error: 'id and email required' });
    const order = await db.getOrder(id);
    if (!order || order.customerEmail !== email.toLowerCase()) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(parseItems(order));
  } catch (err) { res.status(404).json({ error: 'Order not found' }); }
});

app.get('/api/orders/mine', async (req, res) => {
  try {
    const email = (req.query.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ error: 'email required' });
    const list = (await db.getAllOrders())
      .filter(o => (o.customerEmail || '').toLowerCase() === email)
      .map(parseItems);
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, address, items, total } = req.body;
    const order = await db.addOrder({
      customerName, customerEmail, customerPhone: customerPhone || '',
      address: address || '',
      items: JSON.stringify(items),
      total,
    });
    for (const item of items) await db.decrementStock(item.id, item.quantity);
    res.json({ id: order.id });

    // Push to ParcelGuru asynchronously — does not block the customer response
    parcelguru.pushOrder({ ...order, address: address || '', items }).catch((err) => {
      console.error('ParcelGuru push error (non-fatal):', err.message);
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/orders/:id/status', verifyToken, async (req, res) => {
  try {
    await db.updateOrderStatus(req.params.id, req.body.status);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Inventory ────────────────────────────────────────────────────────────────
app.put('/api/inventory/:id', verifyToken, async (req, res) => {
  try {
    await db.updateProduct(req.params.id, { stock: parseInt(req.body.stock) || 0 });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Settings ─────────────────────────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  try { res.json(await db.getSettings()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/settings', verifyToken, async (req, res) => {
  try {
    for (const [k, v] of Object.entries(req.body || {})) await db.setSetting(k, v);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Contact form ─────────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message, type } = req.body || {};
    if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message are required.' });
    const entry = await db.addContact({
      name:    String(name).trim(),
      email:   String(email).toLowerCase().trim(),
      phone:   phone   ? String(phone).trim()   : '',
      subject: subject ? String(subject).trim() : '',
      message: String(message).trim(),
      type:    type    ? String(type).trim()    : 'contact',
      status:  'new',
    });
    res.json({ success: true, id: entry.id });
  } catch (err) {
    console.error('contact:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/contact', verifyToken, async (req, res) => {
  try { res.json(await db.getAllContacts()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Categories ───────────────────────────────────────────────────────────────
app.get('/api/categories', (req, res) => {
  res.json([
    { id: 'acrylic', label: 'Acrylic Art'  },
    { id: 'mdf',     label: 'MDF Art'      },
    { id: 'acp',     label: 'ACP'          },
    { id: 'pvc',     label: 'PVC'          },
    { id: '3d',      label: '3D Designs'   },
    { id: 'custom',  label: 'Custom Order' },
  ]);
});

// ─── Static (production) ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CNC Crafts Backend API is running.'
  });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
async function boot() {
  try {
    await db.connect();
    console.log('✅ Native MongoDB driver connected.');
  } catch (err) {
    console.error('⚠️ Native MongoDB driver connection failed:', err.message);
    console.log('⚠️ Server will start in degraded mode — admin login still works.');
  }

  // Also try Mongoose connection (non-blocking)
  connectDB().catch(err => {
    console.warn('⚠️ Mongoose connection failed (non-fatal):', err.message);
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CNC-ECOM server running on http://localhost:${PORT}`);
  });
}

boot();
