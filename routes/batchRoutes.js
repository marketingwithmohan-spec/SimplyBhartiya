import express from 'express';
import Batch from '../models/Batch.js';
import {
  generateBatchNumber,
  generateQRCode,
  generateCustomerQRPayload,
  generateInternalQRPayload
} from '../utilities/qrUtils.js';
import {
  buildDashboardAnalytics,
  createHistoryWorkbook,
  createReportWorkbook,
  normalizeRange,
  workbookToBuffer
} from '../utilities/analyticsUtils.js';

const router = express.Router();

const sendWorkbook = async (res, fileName, workbook) => {
  const buffer = await workbookToBuffer(workbook);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(buffer);
};

router.get('/dashboard/analytics', async (req, res) => {
  try {
    const range = normalizeRange(req.query.range);
    const batches = await Batch.find().sort({ createdAt: -1 });
    const analytics = buildDashboardAnalytics(batches, range);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/export/history.xlsx', async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    const workbook = await createHistoryWorkbook(batches);
    await sendWorkbook(res, 'simply-bhartiya-entry-history.xlsx', workbook);
  } catch (error) {
    console.error('Error exporting history:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/reports/dashboard.xlsx', async (req, res) => {
  try {
    const range = normalizeRange(req.query.range);
    const batches = await Batch.find().sort({ createdAt: -1 });
    const analytics = buildDashboardAnalytics(batches, range);
    const workbook = await createReportWorkbook(analytics, batches);
    await sendWorkbook(res, `simply-bhartiya-dashboard-report-${range}.xlsx`, workbook);
  } catch (error) {
    console.error('Error exporting dashboard report:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Stage 1: Create Seed Procurement Record
 * POST /api/batches/create-seed
 */
router.post('/create-seed', async (req, res) => {
  try {
    const {
      vendorName,
      purchasePlace,
      pincode,
      purchaseDate,
      seedType,
      quantity,
      price,
      amount,
      packaging,
      packageQuantity
    } = req.body;

    // Validate required fields
    if (!vendorName || !purchasePlace || !pincode || !purchaseDate || !seedType || !quantity || !price || !packaging || !packageQuantity) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const quantityValue = Number(quantity);
    const priceValue = Number(price);
    const packagingValue = Number(packaging);
    const packageQuantityValue = Number(packageQuantity);
    const computedAmount = Number((quantityValue * priceValue).toFixed(2));

    if ([quantityValue, priceValue, packagingValue, packageQuantityValue].some((value) => Number.isNaN(value) || value < 0)) {
      return res.status(400).json({ error: 'Quantity, price, packaging and package quantity must be valid positive numbers' });
    }

    // Generate batch number
    const batchNumber = generateBatchNumber(seedType, pincode);

    // Check if batch already exists (shouldn't, but safety check)
    const existingBatch = await Batch.findOne({ batchNumber });
    if (existingBatch) {
      return res.status(400).json({ error: 'Batch already exists' });
    }

    // Create new batch with Stage 1 data
    const batch = new Batch({
      batchNumber,
      seedType,
      stage1: {
        vendorName,
        purchasePlace,
        pincode,
        purchaseDate: new Date(purchaseDate),
        quantity: quantityValue,
        price: priceValue,
        amount: Number.isNaN(Number(amount)) ? computedAmount : Number(amount),
        packaging: packagingValue,
        packageQuantity: packageQuantityValue,
        completedAt: new Date()
      }
    });

    // Save to database
    await batch.save();

    // Generate Bag QR Code (contains batch number)
    const bagQRData = batchNumber; // Simple: just the batch number
    const bagQRCode = await generateQRCode(bagQRData);

    // Update batch with QR code
    batch.stage1.bagQRCode = bagQRCode;
    await batch.save();

    res.status(201).json({
      success: true,
      message: 'Seed Procurement record created successfully',
      batchNumber,
      bagQRCode,
      batch
    });
  } catch (error) {
    console.error('Error creating seed record:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Batch Details by Batch Number
 * GET /api/batches/:batchNumber
 */
router.get('/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;

    const batch = await Batch.findOne({ batchNumber });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({
      success: true,
      batch
    });
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Stage 2: Update Oil Extraction Record
 * PUT /api/batches/:batchNumber/extract-oil
 */
router.put('/:batchNumber/extract-oil', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const { workerName, extractionDateTime, machineNumber } = req.body;

    // Validate required fields
    if (!workerName || !extractionDateTime || !machineNumber) {
      return res.status(400).json({ error: 'All extraction fields are required' });
    }

    const batch = await Batch.findOne({ batchNumber });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Update Stage 2 data
    batch.stage2 = {
      workerName,
      extractionDateTime: new Date(extractionDateTime),
      machineNumber,
      completedAt: new Date()
    };

    await batch.save();

    // Generate Container QR Code
    const containerQRData = batchNumber; // Could include more data if needed
    const containerQRCode = await generateQRCode(containerQRData);

    batch.stage2.containerQRCode = containerQRCode;
    await batch.save();

    res.json({
      success: true,
      message: 'Oil Extraction record updated successfully',
      containerQRCode,
      batch
    });
  } catch (error) {
    console.error('Error updating extraction record:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Stage 3: Update Packaging Record and Generate Final QR Codes
 * PUT /api/batches/:batchNumber/package
 */
router.put('/:batchNumber/package', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const { packagingWorkerName, packagingDateTime, bottleCapacity } = req.body;

    // Validate required fields
    if (!packagingWorkerName || !packagingDateTime || !bottleCapacity) {
      return res.status(400).json({ error: 'All packaging fields are required' });
    }

    const batch = await Batch.findOne({ batchNumber });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Update Stage 3 data
    batch.stage3 = {
      packagingWorkerName,
      packagingDateTime: new Date(packagingDateTime),
      bottleCapacity,
      completedAt: new Date()
    };

    // Generate Customer QR Code Payload
    const customerQRPayload = generateCustomerQRPayload(batch);
    const customerQRCode = await generateQRCode(customerQRPayload);

    // Generate Internal QR Code Payload
    const internalQRPayload = generateInternalQRPayload(batch);
    const internalQRCode = await generateQRCode(internalQRPayload);

    // Update batch with QR codes
    batch.stage3.customerQRCode = customerQRCode;
    batch.stage3.internalQRCode = internalQRCode;

    await batch.save();

    res.json({
      success: true,
      message: 'Packaging record completed successfully with QR codes generated',
      customerQRCode,
      internalQRCode,
      batch
    });
  } catch (error) {
    console.error('Error updating packaging record:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all batches (for admin/overview)
 * GET /api/batches
 */
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: batches.length,
      batches
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get batch statistics
 * GET /api/batches/stats/overview
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const totalBatches = await Batch.countDocuments();
    const stage1Complete = await Batch.countDocuments({ 'stage1.completedAt': { $exists: true } });
    const stage2Complete = await Batch.countDocuments({ 'stage2.completedAt': { $exists: true } });
    const stage3Complete = await Batch.countDocuments({ 'stage3.completedAt': { $exists: true } });

    res.json({
      success: true,
      stats: {
        totalBatches,
        stage1Complete,
        stage2Complete,
        stage3Complete,
        stage1Percentage: totalBatches ? Math.round((stage1Complete / totalBatches) * 100) : 0,
        stage2Percentage: totalBatches ? Math.round((stage2Complete / totalBatches) * 100) : 0,
        stage3Percentage: totalBatches ? Math.round((stage3Complete / totalBatches) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
