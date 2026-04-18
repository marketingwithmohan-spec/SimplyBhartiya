import QRCode from 'qrcode';

/**
 * Generate a unique Batch Number
 * Format: [Prefix][Year][Month][Date][Time][Pincode]
 * Example: BM20260413143025-500001
 */
export const generateBatchNumber = (seedType, pincode) => {
  const now = new Date();
  
  // Get prefix based on seed type
  const prefix = seedType; // seedType is already the prefix (BM, WS, GN, CO, AL)
  
  // Format: YYYYMMDDHHMMSS
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const timestamp = `${year}${month}${date}${hours}${minutes}${seconds}`;
  
  // Combine: Prefix-Timestamp-Pincode
  const batchNumber = `${prefix}${timestamp}-${pincode}`;
  
  return batchNumber;
};

/**
 * Generate QR Code as Base64 string
 */
export const generateQRCode = async (data) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
};

const formatDateTimeForQR = (dateValue) => {
  if (!dateValue) {
    return 'N/A';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} Time: ${hours}:${minutes}:${seconds}`;
};

/**
 * Generate Customer QR Code Payload
 * Displays only: Seed Procurement Date, Pincode, Extraction Date, Packaging Date, Batch Number
 */
export const generateCustomerQRPayload = (batch) => {
  return [
    'Type: Customer',
    `BatchNumber: ${batch.batchNumber || 'N/A'}`,
    `SeedProcurementDate: ${formatDateTimeForQR(batch.stage1?.purchaseDate)}`,
    `Pincode: ${batch.stage1?.pincode || 'N/A'}`,
    `ExtractionDate: ${formatDateTimeForQR(batch.stage2?.extractionDateTime)}`,
    `PackagingDate: ${formatDateTimeForQR(batch.stage3?.packagingDateTime)}`
  ].join('\n');
};

/**
 * Generate Internal/Business QR Code Payload
 * Displays complete history: Vendors, Workers, Machine IDs, etc.
 */
export const generateInternalQRPayload = (batch) => {
  return [
    'Type: Internal/Business',
    `BatchNumber: ${batch.batchNumber || 'N/A'}`,
    `SeedType: ${batch.seedType || 'N/A'}`,
    `VendorName: ${batch.stage1?.vendorName || 'N/A'}`,
    `PurchasePlace: ${batch.stage1?.purchasePlace || 'N/A'}`,
    `Pincode: ${batch.stage1?.pincode || 'N/A'}`,
    `SeedProcurementDate: ${formatDateTimeForQR(batch.stage1?.purchaseDate)}`,
    `ExtractionWorker: ${batch.stage2?.workerName || 'N/A'}`,
    `ExtractionDate: ${formatDateTimeForQR(batch.stage2?.extractionDateTime)}`,
    `MachineNumber: ${batch.stage2?.machineNumber || 'N/A'}`,
    `PackagingWorker: ${batch.stage3?.packagingWorkerName || 'N/A'}`,
    `PackagingDate: ${formatDateTimeForQR(batch.stage3?.packagingDateTime)}`
  ].join('\n');
};

/**
 * Decode QR data (for verification)
 */
export const decodeQRData = (data) => {
  try {
    return JSON.parse(data);
  } catch (error) {
    return { raw: data };
  }
};
