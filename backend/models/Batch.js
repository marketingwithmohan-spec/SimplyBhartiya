import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  // Batch Metadata
  batchNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  seedType: {
    type: String,
    enum: ['BM', 'WS', 'GN', 'CO', 'AL'],
    required: true
  },
  
  // Stage 1: Seed Procurement
  stage1: {
    vendorName: String,
    purchasePlace: String,
    pincode: String,
    purchaseDate: Date,
    quantity: Number,
    price: Number,
    amount: Number,
    packaging: Number,
    packageQuantity: Number,
    completedAt: Date,
    bagQRCode: String // Base64 encoded QR code image
  },
  
  // Stage 2: Oil Extraction
  stage2: {
    workerName: String,
    extractionDateTime: Date,
    machineNumber: String,
    completedAt: Date,
    containerQRCode: String // Base64 encoded QR code image
  },
  
  // Stage 3: Packaging
  stage3: {
    packagingWorkerName: String,
    packagingDateTime: Date,
    bottleCapacity: String,
    completedAt: Date,
    customerQRCode: String, // Base64 encoded
    internalQRCode: String // Base64 encoded
  },
  
  // Timeline
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
batchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Batch = mongoose.model('Batch', batchSchema);

export default Batch;
