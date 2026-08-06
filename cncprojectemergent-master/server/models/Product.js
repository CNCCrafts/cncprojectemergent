const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  category:    { type: String, required: true, enum: ['acrylic', 'mdf', 'acp', 'pvc', '3d'] },
  price:       { type: Number, required: true, min: 0, default: 0 },
  offer_price: { type: Number, default: null },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },     // Cloudinary secure_url
  image_id:    { type: String, default: '' },     // Cloudinary public_id (for deletion)
  stock:       { type: Number, default: 0, min: 0 },
  active:      { type: Boolean, default: true },
}, { timestamps: true });

// Virtual: id as string for frontend compatibility
productSchema.virtual('id').get(function () { return this._id.toHexString(); });
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
