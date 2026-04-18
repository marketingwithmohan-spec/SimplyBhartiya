const API_BASE_URL = '/api';

let html5QrcodeScanner2 = null;
let html5QrcodeScanner3 = null;
let scanner2Active = false;
let scanner3Active = false;
let activeAnalyticsRange = 'monthly';

const analyticsState = {
    data: null
};

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setDefaultDateTime();
    switchTab('dashboard');
    loadDashboardAnalytics();
});

function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            switchTab(event.currentTarget.dataset.tab);
        });
    });

    document.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            activeAnalyticsRange = btn.dataset.range;
            document.querySelectorAll('.filter-btn').forEach((filterBtn) => filterBtn.classList.remove('active'));
            btn.classList.add('active');
            loadDashboardAnalytics();
        });
    });

    ['quantity', 'price'].forEach((id) => {
        const field = document.getElementById(id);
        field?.addEventListener('input', updateStage1Amount);
    });

    document.querySelectorAll('.metric-card-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            showMetricDetails(btn.dataset.metric);
        });
    });

    document.getElementById('export-history-btn').addEventListener('click', () => {
        downloadFile(`${API_BASE_URL}/batches/export/history.xlsx`, `simply-bhartiya-history-${Date.now()}.xlsx`);
    });

    document.getElementById('download-report-btn').addEventListener('click', () => {
        downloadFile(`${API_BASE_URL}/batches/reports/dashboard.xlsx?range=${activeAnalyticsRange}`, `simply-bhartiya-report-${activeAnalyticsRange}-${Date.now()}.xlsx`);
    });

    document.getElementById('stage1-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        await handleStage1Submit();
    });

    document.getElementById('stage2-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        await handleStage2Submit();
    });

    document.getElementById('stage3-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        await handleStage3Submit();
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach((tab) => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
}

function setDefaultDateTime() {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    const value = `${date}T${time}`;

    ['purchaseDate', 'extractionDateTime', 'packagingDateTime'].forEach((id) => {
        const field = document.getElementById(id);
        if (field) {
            field.value = value;
        }
    });

    updateStage1Amount();
}

function updateStage1Amount() {
    const quantity = Number(document.getElementById('quantity')?.value || 0);
    const price = Number(document.getElementById('price')?.value || 0);
    const amountField = document.getElementById('amount');

    if (!amountField) {
        return;
    }

    amountField.value = quantity > 0 && price > 0 ? (quantity * price).toFixed(2) : '';
}

function formatDateTime(dateString) {
    if (!dateString) {
        return 'N/A';
    }

    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

async function loadDashboardAnalytics() {
    try {
        const data = await fetchJson(`${API_BASE_URL}/batches/dashboard/analytics?range=${activeAnalyticsRange}`);
        analyticsState.data = data.analytics;
        renderDashboard(data.analytics);
    } catch (error) {
        console.error(error);
        showAlert(error.message, 'error');
    }
}

function formatCurrency(value) {
    return Number(value || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function renderDashboard(analytics) {
    document.getElementById('analytics-range-label').textContent = capitalize(analytics.range);
    document.getElementById('successfulPurchases-count').textContent = analytics.summary.successfulPurchases;
    document.getElementById('extractions-count').textContent = analytics.summary.extractions;
    document.getElementById('packaging-count').textContent = analytics.summary.packaging;
    document.getElementById('totalBatches-count').textContent = analytics.summary.totalBatches;
    document.getElementById('dashboard-summary-text').textContent = analytics.narrative;
    document.getElementById('current-seed-spend').textContent = formatCurrency(analytics.summary.seedSpend);
    document.getElementById('prediction-purchases').textContent = analytics.prediction.nextSuccessfulPurchases;
    document.getElementById('prediction-extractions').textContent = analytics.prediction.nextExtractions;
    document.getElementById('prediction-packaging').textContent = analytics.prediction.nextPackaging;
    document.getElementById('prediction-seed-spend').textContent = `₹${formatCurrency(analytics.prediction.nextSeedSpend)}`;

    const maxValue = Math.max(1, ...analytics.timeSeries.flatMap((item) => [item.successfulPurchases, item.extractions, item.packaging]));
    const chart = document.getElementById('time-series-chart');
    chart.innerHTML = analytics.timeSeries.map((item) => {
        const purchaseHeight = Math.max(6, (item.successfulPurchases / maxValue) * 180);
        const extractionHeight = Math.max(6, (item.extractions / maxValue) * 180);
        const packagingHeight = Math.max(6, (item.packaging / maxValue) * 180);
        return `
            <div class="chart-group">
                <div class="chart-stack">
                    <div class="chart-bar purchase" style="height:${purchaseHeight}px" title="Purchases: ${item.successfulPurchases}"></div>
                    <div class="chart-bar extraction" style="height:${extractionHeight}px" title="Extractions: ${item.extractions}"></div>
                    <div class="chart-bar packaging" style="height:${packagingHeight}px" title="Packaging: ${item.packaging}"></div>
                </div>
                <div class="chart-label">${item.label}</div>
            </div>
        `;
    }).join('');

    const tableBody = document.getElementById('batch-wise-table-body');
    tableBody.innerHTML = analytics.batchWise.map((item) => `
        <tr>
            <td>${item.batchNumber}</td>
            <td>${item.seedType}</td>
            <td>${item.vendorName}</td>
            <td>${item.successfulPurchases}</td>
            <td>${item.extractions}</td>
            <td>${item.packaging}</td>
        </tr>
    `).join('') || '<tr><td colspan="6" class="text-center text-muted py-4">No batch data available for this range.</td></tr>';

    showMetricDetails('totalBatches');
}

function showMetricDetails(metric) {
    const analytics = analyticsState.data;
    const body = document.getElementById('metric-detail-body');
    const head = document.getElementById('metric-detail-head');
    const title = document.getElementById('metric-detail-title');
    const subtitle = document.getElementById('metric-detail-subtitle');

    if (!analytics) {
        body.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Dashboard data is still loading.</td></tr>';
        return;
    }

    const metricMap = {
        successfulPurchases: {
            title: 'Successful Purchases Details',
            subtitle: 'Shows only the Stage 1 information entered during procurement.',
            filter: (item) => item.successfulPurchases > 0,
            headers: ['Batch Number', 'Vendor Name', 'Purchase Place', 'Pincode', 'Seed Type', 'Purchase Date'],
            row: (item) => [item.batchNumber, item.vendorName, item.purchasePlace || 'N/A', item.pincode || 'N/A', item.seedType, formatDateTime(item.purchaseDate || item.lastUpdated)]
        },
        extractions: {
            title: 'Extraction Details',
            subtitle: 'Shows Stage 2 extraction records with worker, date, and machine number.',
            filter: (item) => item.extractions > 0,
            headers: ['Batch Number', 'Worker Name', 'Extraction Date', 'Machine Number'],
            row: (item) => [item.batchNumber, item.workerName || 'N/A', formatDateTime(item.extractionDateTime || item.lastUpdated), item.machineNumber || 'N/A']
        },
        packaging: {
            title: 'Packaging Details',
            subtitle: 'Shows Stage 3 packaging records with worker and packaging date.',
            filter: (item) => item.packaging > 0,
            headers: ['Batch Number', 'Packaging Worker', 'Packaging Date'],
            row: (item) => [item.batchNumber, item.packagingWorkerName || 'N/A', formatDateTime(item.packagingDateTime || item.lastUpdated)]
        },
        totalBatches: {
            title: 'Active Batch Details',
            subtitle: 'All active batches included in the selected dashboard range.',
            filter: () => true,
            headers: ['Batch Number', 'Seed Type', 'Vendor Name', 'Current Status', 'Updated'],
            row: (item) => [item.batchNumber, item.seedType, item.vendorName, `P:${item.successfulPurchases} | E:${item.extractions} | PK:${item.packaging}`, formatDateTime(item.lastUpdated)]
        }
    };

    const config = metricMap[metric] || metricMap.totalBatches;
    title.textContent = config.title;
    subtitle.textContent = config.subtitle;
    head.innerHTML = `<tr>${config.headers.map((headerText) => `<th>${headerText}</th>`).join('')}</tr>`;

    const rows = analytics.batchWise.filter(config.filter);
    body.innerHTML = rows.map((item) => `
        <tr>
            ${config.row(item).map((value) => `<td>${value}</td>`).join('')}
        </tr>
    `).join('') || `<tr><td colspan="${config.headers.length}" class="text-center text-muted py-4">No records found for this metric in the selected range.</td></tr>`;
}

function capitalize(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}

async function handleStage1Submit() {
    const formData = {
        vendorName: document.getElementById('vendorName').value,
        purchasePlace: document.getElementById('purchasePlace').value,
        pincode: document.getElementById('pincode').value,
        purchaseDate: document.getElementById('purchaseDate').value,
        seedType: document.getElementById('seedType').value,
        quantity: document.getElementById('quantity').value,
        price: document.getElementById('price').value,
        amount: document.getElementById('amount').value,
        packaging: document.getElementById('packaging').value,
        packageQuantity: document.getElementById('packageQuantity').value
    };

    if (!formData.vendorName || !formData.purchasePlace || !formData.pincode || !formData.purchaseDate || !formData.seedType || !formData.quantity || !formData.price || !formData.packaging || !formData.packageQuantity) {
        showAlert('Please fill all required fields', 'error');
        return;
    }

    try {
        showAlert('Creating batch...', 'info');
        const data = await fetchJson(`${API_BASE_URL}/batches/create-seed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        displayStage1Result(data);
        document.getElementById('stage1-form').reset();
        setDefaultDateTime();
        updateStage1Amount();
        loadDashboardAnalytics();
        showAlert('Batch created successfully! QR code generated.', 'success');
    } catch (error) {
        console.error(error);
        showAlert(error.message, 'error');
    }
}

function displayStage1Result(data) {
    const resultSection = document.getElementById('stage1-result');
    document.getElementById('batchNumber-display').textContent = data.batchNumber;
    document.getElementById('bagQR-display').src = data.bagQRCode;
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function toggleScanner(stage) {
    if (stage === 'stage2') {
        scanner2Active ? stopScanner2() : startScanner2();
        return;
    }

    if (stage === 'stage3') {
        scanner3Active ? stopScanner3() : startScanner3();
    }
}

const scannerConfig = {
    fps: 10,
    qrbox: { width: 300, height: 300 },
    aspectRatio: 1.0,
    disableFlip: false,
    experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
    }
};

function startScanner2() {
    if (html5QrcodeScanner2) {
        html5QrcodeScanner2.start({ facingMode: 'environment' }, scannerConfig, onScanSuccess2, onScanError)
            .then(() => {
                scanner2Active = true;
                document.getElementById('scanner-toggle-stage2').textContent = 'Hide Scanner';
            })
            .catch((error) => {
                console.error(error);
                showAlert('Failed to start scanner. Please check camera permissions and ensure the QR code is clearly visible.', 'error');
            });
        return;
    }

    html5QrcodeScanner2 = new Html5Qrcode('qr-scanner-stage2');
    html5QrcodeScanner2.start({ facingMode: 'environment' }, scannerConfig, onScanSuccess2, onScanError)
        .then(() => {
            scanner2Active = true;
            document.getElementById('scanner-toggle-stage2').textContent = 'Hide Scanner';
        })
        .catch((error) => {
            console.error(error);
            showAlert('Failed to start scanner. Please check camera permissions and ensure the QR code is clearly visible.', 'error');
        });
}

function stopScanner2() {
    if (!html5QrcodeScanner2 || !scanner2Active) {
        return;
    }

    html5QrcodeScanner2.stop().then(() => {
        scanner2Active = false;
        document.getElementById('scanner-toggle-stage2').textContent = 'Show Scanner';
    });
}

function onScanSuccess2(decodedText) {
    document.getElementById('scannedBatchNumber-stage2').value = decodedText;
    stopScanner2();
    loadBatchDataForStage2(decodedText);
}

function onScanError(error) {
    if (error && error.includes && !error.includes('NotFound')) {
        console.warn('Scan error:', error);
    }
}

async function loadBatchDataForStage2(batchNumber) {
    try {
        const data = await fetchJson(`${API_BASE_URL}/batches/${batchNumber}`);
        const batch = data.batch;
        const existingDisplay = document.getElementById('stage2-existing-display');
        existingDisplay.innerHTML = `
            <p><strong>Vendor:</strong> ${batch.stage1.vendorName}</p>
            <p><strong>Purchase Place:</strong> ${batch.stage1.purchasePlace}</p>
            <p><strong>Pincode:</strong> ${batch.stage1.pincode}</p>
            <p><strong>Seed Type:</strong> ${batch.seedType}</p>
            <p><strong>Purchase Date:</strong> ${formatDateTime(batch.stage1.purchaseDate)}</p>
            <p><strong>Quantity:</strong> ${batch.stage1.quantity || 'N/A'} KGs</p>
            <p><strong>Price:</strong> ₹${batch.stage1.price || 'N/A'}</p>
            <p><strong>Amount:</strong> ₹${batch.stage1.amount || 'N/A'}</p>
            <p><strong>Packaging:</strong> ${batch.stage1.packaging || 'N/A'} KGs</p>
            <p><strong>Package Quantity:</strong> ${batch.stage1.packageQuantity || 'N/A'}</p>
        `;

        document.getElementById('stage2-existing-data').style.display = 'block';
        document.getElementById('stage2-form').style.display = 'block';
        showAlert('Batch found! Please fill extraction details.', 'success');
    } catch (error) {
        console.error(error);
        showAlert(error.message, 'error');
    }
}

async function handleStage2Submit() {
    const batchNumber = document.getElementById('scannedBatchNumber-stage2').value;
    const formData = {
        workerName: document.getElementById('workerName').value,
        extractionDateTime: document.getElementById('extractionDateTime').value,
        machineNumber: document.getElementById('machineNumber').value
    };

    if (!batchNumber || !formData.workerName || !formData.extractionDateTime || !formData.machineNumber) {
        showAlert('Please scan batch and fill all fields', 'error');
        return;
    }

    try {
        showAlert('Updating extraction record...', 'info');
        const data = await fetchJson(`${API_BASE_URL}/batches/${batchNumber}/extract-oil`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        displayStage2Result(data);
        document.getElementById('stage2-form').reset();
        document.getElementById('stage2-existing-data').style.display = 'none';
        document.getElementById('stage2-form').style.display = 'none';
        document.getElementById('scannedBatchNumber-stage2').value = '';
        setDefaultDateTime();
        loadDashboardAnalytics();
        showAlert('Extraction record updated successfully!', 'success');
    } catch (error) {
        console.error(error);
        showAlert(error.message, 'error');
    }
}

function displayStage2Result(data) {
    const resultSection = document.getElementById('stage2-result');
    document.getElementById('containerQR-display').src = data.containerQRCode;
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function startScanner3() {
    if (html5QrcodeScanner3) {
        html5QrcodeScanner3.start({ facingMode: 'environment' }, scannerConfig, onScanSuccess3, onScanError)
            .then(() => {
                scanner3Active = true;
                document.getElementById('scanner-toggle-stage3').textContent = 'Hide Scanner';
            })
            .catch((error) => {
                console.error(error);
                showAlert('Failed to start scanner. Please check camera permissions and ensure the QR code is clearly visible.', 'error');
            });
        return;
    }

    html5QrcodeScanner3 = new Html5Qrcode('qr-scanner-stage3');
    html5QrcodeScanner3.start({ facingMode: 'environment' }, scannerConfig, onScanSuccess3, onScanError)
        .then(() => {
            scanner3Active = true;
            document.getElementById('scanner-toggle-stage3').textContent = 'Hide Scanner';
        })
        .catch((error) => {
            console.error(error);
            showAlert('Failed to start scanner. Please check camera permissions and ensure the QR code is clearly visible.', 'error');
        });
}

function stopScanner3() {
    if (!html5QrcodeScanner3 || !scanner3Active) {
        return;
    }

    html5QrcodeScanner3.stop().then(() => {
        scanner3Active = false;
        document.getElementById('scanner-toggle-stage3').textContent = 'Show Scanner';
    });
}

function onScanSuccess3(decodedText) {
    document.getElementById('scannedBatchNumber-stage3').value = decodedText;
    stopScanner3();
    loadBatchDataForStage3(decodedText);
}

async function loadBatchDataForStage3(batchNumber) {
    try {
        const data = await fetchJson(`${API_BASE_URL}/batches/${batchNumber}`);
        const batch = data.batch;
        const existingDisplay = document.getElementById('stage3-existing-display');

        let html = `
            <p><strong>Batch Number:</strong> ${batch.batchNumber}</p>
            <p><strong>Seed Type:</strong> ${batch.seedType}</p>
            <h5 class="mt-3">Stage 1 - Seed Procurement</h5>
            <p><strong>Vendor:</strong> ${batch.stage1.vendorName}</p>
            <p><strong>Purchase Date:</strong> ${formatDateTime(batch.stage1.purchaseDate)}</p>
            <p><strong>Pincode:</strong> ${batch.stage1.pincode}</p>
            <p><strong>Quantity:</strong> ${batch.stage1.quantity || 'N/A'} KGs</p>
            <p><strong>Price:</strong> ₹${batch.stage1.price || 'N/A'}</p>
            <p><strong>Amount:</strong> ₹${batch.stage1.amount || 'N/A'}</p>
            <p><strong>Packaging:</strong> ${batch.stage1.packaging || 'N/A'} KGs</p>
            <p><strong>Package Quantity:</strong> ${batch.stage1.packageQuantity || 'N/A'}</p>
        `;

        if (batch.stage2 && batch.stage2.completedAt) {
            html += `
                <h5 class="mt-3">Stage 2 - Oil Extraction</h5>
                <p><strong>Worker:</strong> ${batch.stage2.workerName}</p>
                <p><strong>Extraction Date:</strong> ${formatDateTime(batch.stage2.extractionDateTime)}</p>
                <p><strong>Machine:</strong> ${batch.stage2.machineNumber}</p>
            `;
        }

        existingDisplay.innerHTML = html;
        document.getElementById('stage3-existing-data').style.display = 'block';
        document.getElementById('stage3-form').style.display = 'block';
        showAlert('Batch found! Please enter packaging details.', 'success');
    } catch (error) {
        console.error(error);
        showAlert(error.message, 'error');
    }
}

async function handleStage3Submit() {
    const batchNumber = document.getElementById('scannedBatchNumber-stage3').value;
    const formData = {
        packagingWorkerName: document.getElementById('packagingWorkerName').value,
        packagingDateTime: document.getElementById('packagingDateTime').value,
        bottleCapacity: document.getElementById('bottleCapacity').value
    };

    if (!batchNumber || !formData.packagingWorkerName || !formData.packagingDateTime || !formData.bottleCapacity) {
        showAlert('Please scan batch and fill all fields', 'error');
        return;
    }

    try {
        showAlert('Completing packaging and generating final QR codes...', 'info');
        const data = await fetchJson(`${API_BASE_URL}/batches/${batchNumber}/package`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        displayStage3Result(data);
        document.getElementById('stage3-form').reset();
        document.getElementById('stage3-existing-data').style.display = 'none';
        document.getElementById('stage3-form').style.display = 'none';
        document.getElementById('scannedBatchNumber-stage3').value = '';
        setDefaultDateTime();
        loadDashboardAnalytics();
        showAlert('Packaging completed! Final QR codes generated.', 'success');
    } catch (error) {
        console.error(error);
        showAlert(error.message, 'error');
    }
}

function displayStage3Result(data) {
    const resultSection = document.getElementById('stage3-result');
    document.getElementById('customerQR-display').src = data.customerQRCode;
    document.getElementById('internalQR-display').src = data.internalQRCode;
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

async function searchBatch() {
    const batchNumber = document.getElementById('searchBatchNumber').value.trim();

    if (!batchNumber) {
        showAlert('Please enter a batch number', 'error');
        return;
    }

    try {
        showAlert('Searching...', 'info');
        const data = await fetchJson(`${API_BASE_URL}/batches/${batchNumber}`);
        displayBatchTracking(data.batch);
        showAlert('Batch found!', 'success');
    } catch (error) {
        console.error(error);
        showAlert(error.message, 'error');
    }
}

function displayBatchTracking(batch) {
    const trackingContent = document.getElementById('tracking-content');
    const stage1Complete = batch.stage1 && batch.stage1.completedAt;
    const stage2Complete = batch.stage2 && batch.stage2.completedAt;
    const stage3Complete = batch.stage3 && batch.stage3.completedAt;

    let html = `
        <div class="batch-summary">
            <h3>Batch: ${batch.batchNumber}</h3>
            <p><strong>Seed Type:</strong> ${batch.seedType}</p>
            <p><strong>Created:</strong> ${formatDateTime(batch.createdAt)}</p>
        </div>
    `;

    if (stage1Complete) {
        html += `
            <div class="stage-info complete">
                <h4>✓ Stage 1: Seed Procurement (Complete)</h4>
                <p><strong>Vendor:</strong> ${batch.stage1.vendorName}</p>
                <p><strong>Purchase Place:</strong> ${batch.stage1.purchasePlace}</p>
                <p><strong>Pincode:</strong> ${batch.stage1.pincode}</p>
                <p><strong>Purchase Date:</strong> ${formatDateTime(batch.stage1.purchaseDate)}</p>
                <p><strong>Quantity:</strong> ${batch.stage1.quantity || 'N/A'} KGs</p>
                <p><strong>Price:</strong> ₹${batch.stage1.price || 'N/A'}</p>
                <p><strong>Amount:</strong> ₹${batch.stage1.amount || 'N/A'}</p>
                <p><strong>Packaging:</strong> ${batch.stage1.packaging || 'N/A'} KGs</p>
                <p><strong>Package Quantity:</strong> ${batch.stage1.packageQuantity || 'N/A'}</p>
                <p><strong>Completed:</strong> ${formatDateTime(batch.stage1.completedAt)}</p>
                ${batch.stage1.bagQRCode ? `<p><img src="${batch.stage1.bagQRCode}" alt="Bag QR" class="qr-image mt-3"></p>` : ''}
            </div>
        `;
    } else {
        html += `<div class="stage-info incomplete"><h4>⋯ Stage 1: Seed Procurement (Pending)</h4></div>`;
    }

    if (stage2Complete) {
        html += `
            <div class="stage-info complete">
                <h4>✓ Stage 2: Oil Extraction (Complete)</h4>
                <p><strong>Worker:</strong> ${batch.stage2.workerName}</p>
                <p><strong>Machine Number:</strong> ${batch.stage2.machineNumber}</p>
                <p><strong>Extraction Date:</strong> ${formatDateTime(batch.stage2.extractionDateTime)}</p>
                <p><strong>Completed:</strong> ${formatDateTime(batch.stage2.completedAt)}</p>
                ${batch.stage2.containerQRCode ? `<p><img src="${batch.stage2.containerQRCode}" alt="Container QR" class="qr-image mt-3"></p>` : ''}
            </div>
        `;
    } else {
        html += `<div class="stage-info incomplete"><h4>⋯ Stage 2: Oil Extraction (Pending)</h4></div>`;
    }

    if (stage3Complete) {
        html += `
            <div class="stage-info complete">
                <h4>✓ Stage 3: Packaging (Complete)</h4>
                <p><strong>Packaging Worker:</strong> ${batch.stage3.packagingWorkerName}</p>
                <p><strong>Packaging Date:</strong> ${formatDateTime(batch.stage3.packagingDateTime)}</p>
                <p><strong>Bottle Capacity:</strong> ${batch.stage3.bottleCapacity || 'N/A'}</p>
                <p><strong>Completed:</strong> ${formatDateTime(batch.stage3.completedAt)}</p>
                <div class="info-row">
                    <div>
                        <h5>Customer QR Code</h5>
                        ${batch.stage3.customerQRCode ? `<img src="${batch.stage3.customerQRCode}" alt="Customer QR" class="qr-image mt-3">` : ''}
                    </div>
                    <div>
                        <h5>Internal QR Code</h5>
                        ${batch.stage3.internalQRCode ? `<img src="${batch.stage3.internalQRCode}" alt="Internal QR" class="qr-image mt-3">` : ''}
                    </div>
                </div>
            </div>
        `;
    } else {
        html += `<div class="stage-info incomplete"><h4>⋯ Stage 3: Packaging (Pending)</h4></div>`;
    }

    trackingContent.innerHTML = html;
    document.getElementById('tracking-result').style.display = 'block';
    document.getElementById('tracking-result').scrollIntoView({ behavior: 'smooth' });
}

function showAlert(message, type = 'info') {
    const alertBox = document.getElementById('alert-box');
    alertBox.className = `alert-box ${type}`;
    alertBox.style.display = 'flex';
    document.getElementById('alert-message').textContent = message;

    setTimeout(() => {
        closeAlert();
    }, 5000);
}

function closeAlert() {
    document.getElementById('alert-box').style.display = 'none';
}

function downloadQR(imageId, fileName) {
    const qrImage = document.getElementById(imageId);
    const link = document.createElement('a');
    link.href = qrImage.src;
    link.download = `${fileName}_${Date.now()}.png`;
    link.click();
}

function downloadFile(url, fileName) {
    try {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        link.remove();
        showAlert('Download started successfully.', 'success');
    } catch (error) {
        console.error(error);
        showAlert(error.message, 'error');
    }
}
