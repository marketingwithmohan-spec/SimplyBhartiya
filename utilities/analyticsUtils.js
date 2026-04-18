import ExcelJS from 'exceljs';

const VALID_RANGES = ['weekly', 'monthly', 'yearly'];

export const normalizeRange = (range = 'monthly') => {
  return VALID_RANGES.includes(range) ? range : 'monthly';
};

export const getRangeStart = (range = 'monthly') => {
  const now = new Date();
  const start = new Date(now);

  if (range === 'weekly') {
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() - 6);
    return start;
  }

  if (range === 'yearly') {
    start.setHours(0, 0, 0, 0);
    start.setMonth(now.getMonth() - 11, 1);
    return start;
  }

  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - 29);
  return start;
};

const isValidDate = (value) => value && !Number.isNaN(new Date(value).getTime());

const formatLabel = (date, range) => {
  if (range === 'yearly') {
    return date.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
  }

  if (range === 'weekly') {
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short' });
  }

  return `W${Math.ceil(date.getDate() / 7)} ${date.toLocaleString('en-IN', { month: 'short' })}`;
};

const formatLocalDateKey = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const createBuckets = (range) => {
  const now = new Date();
  const buckets = [];

  if (range === 'weekly') {
    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setDate(now.getDate() - index);
      buckets.push({
        key: formatLocalDateKey(date),
        label: formatLabel(date, range),
        successfulPurchases: 0,
        extractions: 0,
        packaging: 0,
        seedSpend: 0
      });
    }
    return buckets;
  }

  if (range === 'yearly') {
    for (let index = 11; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      buckets.push({
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: formatLabel(date, range),
        successfulPurchases: 0,
        extractions: 0,
        packaging: 0,
        seedSpend: 0
      });
    }
    return buckets;
  }

  for (let week = 0; week < 5; week += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - ((4 - week) * 7));
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}-${Math.ceil(date.getDate() / 7)}`,
      label: formatLabel(date, range),
      successfulPurchases: 0,
      extractions: 0,
      packaging: 0,
      seedSpend: 0
    });
  }

  return buckets;
};

const resolveBucketKey = (value, range) => {
  const date = new Date(value);

  if (range === 'weekly') {
    return formatLocalDateKey(date);
  }

  if (range === 'yearly') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  return `${date.getFullYear()}-${date.getMonth()}-${Math.ceil(date.getDate() / 7)}`;
};

const movingAverage = (values, precision = 1) => {
  const usable = values.filter((value) => typeof value === 'number');
  if (!usable.length) {
    return 0;
  }

  const sample = usable.slice(-3);
  return Number((sample.reduce((total, value) => total + value, 0) / sample.length).toFixed(precision));
};

export const buildDashboardAnalytics = (batches = [], selectedRange = 'monthly') => {
  const range = normalizeRange(selectedRange);
  const startDate = getRangeStart(range);
  const buckets = createBuckets(range);
  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  const relevantBatches = batches.filter((batch) => {
    return [
      batch.createdAt,
      batch.stage1?.completedAt,
      batch.stage2?.completedAt,
      batch.stage3?.completedAt
    ].some((value) => isValidDate(value) && new Date(value) >= startDate);
  });

  for (const batch of relevantBatches) {
    const stageEntries = [
      { date: batch.stage1?.completedAt, field: 'successfulPurchases' },
      { date: batch.stage2?.completedAt, field: 'extractions' },
      { date: batch.stage3?.completedAt, field: 'packaging' }
    ];

    for (const entry of stageEntries) {
      if (!isValidDate(entry.date)) {
        continue;
      }

      const date = new Date(entry.date);
      if (date < startDate) {
        continue;
      }

      const bucket = bucketMap.get(resolveBucketKey(date, range));
      if (bucket) {
        bucket[entry.field] += 1;
      }
    }

    if (isValidDate(batch.stage1?.completedAt)) {
      const purchaseDate = new Date(batch.stage1.completedAt);
      if (purchaseDate >= startDate) {
        const bucket = bucketMap.get(resolveBucketKey(purchaseDate, range));
        if (bucket) {
          bucket.seedSpend += Number(batch.stage1?.amount) || 0;
        }
      }
    }
  }

  const summary = {
    totalBatches: relevantBatches.length,
    successfulPurchases: relevantBatches.filter((batch) => isValidDate(batch.stage1?.completedAt) && new Date(batch.stage1.completedAt) >= startDate).length,
    extractions: relevantBatches.filter((batch) => isValidDate(batch.stage2?.completedAt) && new Date(batch.stage2.completedAt) >= startDate).length,
    packaging: relevantBatches.filter((batch) => isValidDate(batch.stage3?.completedAt) && new Date(batch.stage3.completedAt) >= startDate).length,
    seedSpend: relevantBatches.reduce((total, batch) => {
      if (isValidDate(batch.stage1?.completedAt) && new Date(batch.stage1.completedAt) >= startDate) {
        return total + (Number(batch.stage1?.amount) || 0);
      }
      return total;
    }, 0)
  };

  const batchWise = relevantBatches.slice(0, 12).map((batch) => ({
    batchNumber: batch.batchNumber,
    seedType: batch.seedType,
    vendorName: batch.stage1?.vendorName || 'N/A',
    purchasePlace: batch.stage1?.purchasePlace || 'N/A',
    pincode: batch.stage1?.pincode || 'N/A',
    purchaseDate: batch.stage1?.purchaseDate || null,
    workerName: batch.stage2?.workerName || 'N/A',
    extractionDateTime: batch.stage2?.extractionDateTime || null,
    machineNumber: batch.stage2?.machineNumber || 'N/A',
    packagingWorkerName: batch.stage3?.packagingWorkerName || 'N/A',
    packagingDateTime: batch.stage3?.packagingDateTime || null,
    successfulPurchases: isValidDate(batch.stage1?.completedAt) ? 1 : 0,
    extractions: isValidDate(batch.stage2?.completedAt) ? 1 : 0,
    packaging: isValidDate(batch.stage3?.completedAt) ? 1 : 0,
    seedSpend: Number(batch.stage1?.amount) || 0,
    lastUpdated: batch.updatedAt || batch.createdAt
  }));

  const prediction = {
    nextSuccessfulPurchases: movingAverage(buckets.map((item) => item.successfulPurchases), 1),
    nextExtractions: movingAverage(buckets.map((item) => item.extractions), 1),
    nextPackaging: movingAverage(buckets.map((item) => item.packaging), 1),
    nextSeedSpend: movingAverage(buckets.map((item) => item.seedSpend), 2)
  };

  const narrative = `In the ${range} view, ${summary.successfulPurchases} purchases, ${summary.extractions} extractions, and ${summary.packaging} packaging events were recorded across ${summary.totalBatches} active batches with ₹${summary.seedSpend.toFixed(2)} spent on seeds. Based on recent activity, the next period is projected at about ₹${prediction.nextSeedSpend.toFixed(2)} in seed spend and ${prediction.nextPackaging} packaging events.`;

  return {
    range,
    generatedAt: new Date().toISOString(),
    summary,
    timeSeries: buckets,
    batchWise,
    prediction,
    narrative
  };
};

const buildHistoryRows = (batches = []) => {
  return batches.map((batch) => ({
    BatchNumber: batch.batchNumber,
    SeedType: batch.seedType,
    VendorName: batch.stage1?.vendorName || '',
    PurchasePlace: batch.stage1?.purchasePlace || '',
    Pincode: batch.stage1?.pincode || '',
    PurchaseDate: batch.stage1?.purchaseDate ? new Date(batch.stage1.purchaseDate).toLocaleString('en-IN') : '',
    QuantityKGs: batch.stage1?.quantity ?? '',
    PriceRs: batch.stage1?.price ?? '',
    AmountRs: batch.stage1?.amount ?? '',
    PackagingKGs: batch.stage1?.packaging ?? '',
    PackageQuantity: batch.stage1?.packageQuantity ?? '',
    ExtractionWorker: batch.stage2?.workerName || '',
    MachineNumber: batch.stage2?.machineNumber || '',
    ExtractionDate: batch.stage2?.extractionDateTime ? new Date(batch.stage2.extractionDateTime).toLocaleString('en-IN') : '',
    PackagingWorker: batch.stage3?.packagingWorkerName || '',
    PackagingDate: batch.stage3?.packagingDateTime ? new Date(batch.stage3.packagingDateTime).toLocaleString('en-IN') : '',
    BottleCapacity: batch.stage3?.bottleCapacity || '',
    CreatedAt: batch.createdAt ? new Date(batch.createdAt).toLocaleString('en-IN') : '',
    UpdatedAt: batch.updatedAt ? new Date(batch.updatedAt).toLocaleString('en-IN') : ''
  }));
};

export const createHistoryWorkbook = async (batches = []) => {
  const workbook = new ExcelJS.Workbook();
  const historySheet = workbook.addWorksheet('Entry History');
  const rows = buildHistoryRows(batches);
  historySheet.addRows(rows);
  return workbook;
};

export const createReportWorkbook = async (analytics, batches = []) => {
  const workbook = new ExcelJS.Workbook();

  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRows([
    { Metric: 'Range', Value: analytics.range },
    { Metric: 'Generated At', Value: analytics.generatedAt },
    { Metric: 'Total Batches', Value: analytics.summary.totalBatches },
    { Metric: 'Successful Purchases', Value: analytics.summary.successfulPurchases },
    { Metric: 'Extractions', Value: analytics.summary.extractions },
    { Metric: 'Packaging', Value: analytics.summary.packaging },
    { Metric: 'Seed Spend (₹)', Value: analytics.summary.seedSpend.toFixed(2) },
    { Metric: 'Predicted Next Purchases', Value: analytics.prediction.nextSuccessfulPurchases },
    { Metric: 'Predicted Next Extractions', Value: analytics.prediction.nextExtractions },
    { Metric: 'Predicted Next Packaging', Value: analytics.prediction.nextPackaging },
    { Metric: 'Predicted Next Seed Spend (₹)', Value: analytics.prediction.nextSeedSpend.toFixed(2) },
    { Metric: 'Narrative Summary', Value: analytics.narrative }
  ]);

  const trendSheet = workbook.addWorksheet('Time Series');
  trendSheet.addRows(analytics.timeSeries.map((item) => ({
    Period: item.label,
    SuccessfulPurchases: item.successfulPurchases,
    Extractions: item.extractions,
    Packaging: item.packaging,
    SeedSpend: item.seedSpend.toFixed(2)
  })));

  const batchSheet = workbook.addWorksheet('Batch History');
  batchSheet.addRows(buildHistoryRows(batches));

  return workbook;
};

export const workbookToBuffer = async (workbook) => {
  return await workbook.xlsx.writeBuffer();
};
