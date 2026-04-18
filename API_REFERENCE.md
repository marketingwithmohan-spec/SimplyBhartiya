# API Reference & CURL Examples

Quick reference for testing the Oil Traceability API endpoints using curl commands.

## 🔌 API Base URL

```
http://localhost:5000/api
```

## 📋 Health Check

**Test if API is running**

```bash
curl http://localhost:5000/api/health
```

**Response**:
```json
{
  "status": "OK",
  "message": "Oil Traceability API is running"
}
```

---

## Stage 1: Create Seed Procurement Record

**Endpoint**: `POST /api/batches/create-seed`

### CURL Example

```bash
curl -X POST http://localhost:5000/api/batches/create-seed \
  -H "Content-Type: application/json" \
  -d '{
    "vendorName": "ABC Seeds Company",
    "purchasePlace": "Hyderabad",
    "pincode": "500001",
    "purchaseDate": "2026-04-13T14:30:00",
    "seedType": "BM"
  }'
```

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| vendorName | String | Yes | Name of seed supplier |
| purchasePlace | String | Yes | City/location of purchase |
| pincode | String | Yes | 6-digit postal code |
| purchaseDate | ISO DateTime | Yes | Date and time of purchase |
| seedType | String | Yes | BM, WS, GN, CO, or AL |

### Response

```json
{
  "success": true,
  "message": "Seed Procurement record created successfully",
  "batchNumber": "BM20260413143025-500001",
  "bagQRCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "batch": {
    "_id": "6447a1b...",
    "batchNumber": "BM20260413143025-500001",
    "seedType": "BM",
    "stage1": {
      "vendorName": "ABC Seeds Company",
      "purchasePlace": "Hyderabad",
      "pincode": "500001",
      "purchaseDate": "2026-04-13T14:30:00Z",
      "completedAt": "2026-04-13T14:30:25Z",
      "bagQRCode": "data:image/png;base64,iVBORw0KGgo..."
    },
    "createdAt": "2026-04-13T14:30:25Z",
    "updatedAt": "2026-04-13T14:30:25Z"
  }
}
```

### Error Response

```json
{
  "error": "All fields are required"
}
```

---

## Get Batch Details

**Endpoint**: `GET /api/batches/:batchNumber`

### CURL Example

```bash
curl http://localhost:5000/api/batches/BM20260413143025-500001
```

### Response

```json
{
  "success": true,
  "batch": {
    "_id": "6447a1b...",
    "batchNumber": "BM20260413143025-500001",
    "seedType": "BM",
    "stage1": { ... },
    "stage2": null,
    "stage3": null,
    "createdAt": "2026-04-13T14:30:25Z",
    "updatedAt": "2026-04-13T14:30:25Z"
  }
}
```

---

## Stage 2: Update Oil Extraction Record

**Endpoint**: `PUT /api/batches/:batchNumber/extract-oil`

### CURL Example

```bash
curl -X PUT http://localhost:5000/api/batches/BM20260413143025-500001/extract-oil \
  -H "Content-Type: application/json" \
  -d '{
    "workerName": "Raj Kumar",
    "extractionDateTime": "2026-04-14T09:00:00",
    "machineNumber": "EXT-M001"
  }'
```

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| workerName | String | Yes | Name of extraction worker |
| extractionDateTime | ISO DateTime | Yes | When extraction occurred |
| machineNumber | String | Yes | ID of extraction machine |

### Response

```json
{
  "success": true,
  "message": "Oil Extraction record updated successfully",
  "containerQRCode": "data:image/png;base64,iVBORw0KGgo...",
  "batch": {
    "_id": "6447a1b...",
    "batchNumber": "BM20260413143025-500001",
    "seedType": "BM",
    "stage1": { ... },
    "stage2": {
      "workerName": "Raj Kumar",
      "extractionDateTime": "2026-04-14T09:00:00Z",
      "machineNumber": "EXT-M001",
      "completedAt": "2026-04-14T09:00:15Z",
      "containerQRCode": "data:image/png;base64,iVBORw0KGgo..."
    },
    "stage3": null,
    "createdAt": "2026-04-13T14:30:25Z",
    "updatedAt": "2026-04-14T09:00:15Z"
  }
}
```

---

## Stage 3: Complete Packaging and Generate QR Codes

**Endpoint**: `PUT /api/batches/:batchNumber/package`

### CURL Example

```bash
curl -X PUT http://localhost:5000/api/batches/BM20260413143025-500001/package \
  -H "Content-Type: application/json" \
  -d '{
    "packagingWorkerName": "Priya Singh",
    "packagingDateTime": "2026-04-15T15:30:00"
  }'
```

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| packagingWorkerName | String | Yes | Name of packaging worker |
| packagingDateTime | ISO DateTime | Yes | When packaging occurred |

### Response

```json
{
  "success": true,
  "message": "Packaging record completed successfully with QR codes generated",
  "customerQRCode": "data:image/png;base64,iVBORw0KGgo...",
  "internalQRCode": "data:image/png;base64,iVBORw0KGgo...",
  "batch": {
    "_id": "6447a1b...",
    "batchNumber": "BM20260413143025-500001",
    "seedType": "BM",
    "stage1": { ... },
    "stage2": { ... },
    "stage3": {
      "packagingWorkerName": "Priya Singh",
      "packagingDateTime": "2026-04-15T15:30:00Z",
      "completedAt": "2026-04-15T15:30:20Z",
      "customerQRCode": "data:image/png;base64,iVBORw0KGgo...",
      "internalQRCode": "data:image/png;base64,iVBORw0KGgo..."
    },
    "createdAt": "2026-04-13T14:30:25Z",
    "updatedAt": "2026-04-15T15:30:20Z"
  }
}
```

---

## Get All Batches

**Endpoint**: `GET /api/batches`

### CURL Example

```bash
curl http://localhost:5000/api/batches
```

### Response

```json
{
  "success": true,
  "count": 3,
  "batches": [
    {
      "_id": "6447a1b...",
      "batchNumber": "BM20260413143025-500001",
      "seedType": "BM",
      ...
    },
    {
      "_id": "6447a2c...",
      "batchNumber": "WS20260413150200-400001",
      "seedType": "WS",
      ...
    }
  ]
}
```

---

## Get Statistics Overview

**Endpoint**: `GET /api/batches/stats/overview`

### CURL Example

```bash
curl http://localhost:5000/api/batches/stats/overview
```

### Response

```json
{
  "success": true,
  "stats": {
    "totalBatches": 10,
    "stage1Complete": 10,
    "stage2Complete": 8,
    "stage3Complete": 5,
    "stage1Percentage": 100,
    "stage2Percentage": 80,
    "stage3Percentage": 50
  }
}
```

---

## Testing with Postman

### Import Collection

1. Open Postman
2. Click "Import"
3. Use the raw JSON below

### Postman Collection

```json
{
  "info": {
    "name": "Oil Traceability API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Create Seed Batch",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"vendorName\": \"ABC Seeds\", \"purchasePlace\": \"Hyderabad\", \"pincode\": \"500001\", \"purchaseDate\": \"2026-04-13T14:30:00\", \"seedType\": \"BM\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/batches/create-seed",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "batches", "create-seed"]
        }
      }
    },
    {
      "name": "Get Batch",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:5000/api/batches/BM20260413143025-500001",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "batches", "BM20260413143025-500001"]
        }
      }
    },
    {
      "name": "Update Extraction",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"workerName\": \"Raj Kumar\", \"extractionDateTime\": \"2026-04-14T09:00:00\", \"machineNumber\": \"EXT-M001\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/batches/BM20260413143025-500001/extract-oil",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "batches", "BM20260413143025-500001", "extract-oil"]
        }
      }
    },
    {
      "name": "Complete Packaging",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"packagingWorkerName\": \"Priya Singh\", \"packagingDateTime\": \"2026-04-15T15:30:00\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/batches/BM20260413143025-500001/package",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "batches", "BM20260413143025-500001", "package"]
        }
      }
    },
    {
      "name": "Get All Batches",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:5000/api/batches",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "batches"]
        }
      }
    },
    {
      "name": "Get Statistics",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:5000/api/batches/stats/overview",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "batches", "stats", "overview"]
        }
      }
    }
  ]
}
```

---

## Error Codes

| Status | Code | Meaning |
|--------|------|---------|
| 200 | OK | Request successful, data returned |
| 201 | Created | New resource successfully created |
| 400 | Bad Request | Invalid input or missing required fields |
| 404 | Not Found | Batch not found in database |
| 500 | Server Error | Internal server error |

## Common Error Messages

```json
{
  "error": "All fields are required"
}
```

```json
{
  "error": "Batch not found"
}
```

```json
{
  "error": "Batch already exists"
}
```

```json
{
  "error": "Failed to generate QR code: [reason]"
}
```

---

## Testing Workflow

1. **Create Batch**: Stage 1
2. **Get Batch**: Verify creation
3. **Update Extraction**: Stage 2
4. **Get Batch**: Verify update
5. **Complete Packaging**: Stage 3
6. **Get Statistics**: View progress

Use the batch number returned from Step 1 in all subsequent requests.

---

## Advanced Testing

### Test with Variables

Save batch number from response:
```bash
BATCH_NUM=$(curl -X POST http://localhost:5000/api/batches/create-seed \
  -H "Content-Type: application/json" \
  -d '{"vendorName":"Test","purchasePlace":"City","pincode":"500001","purchaseDate":"2026-04-13T14:30:00","seedType":"BM"}' | jq -r '.batchNumber')

echo $BATCH_NUM

# Use in next request
curl http://localhost:5000/api/batches/$BATCH_NUM
```

### Load Testing

Use Apache Bench:
```bash
ab -n 100 -c 10 http://localhost:5000/api/health
```

---

## Integration Examples

### JavaScript Fetch

```javascript
// Create batch
const response = await fetch('http://localhost:5000/api/batches/create-seed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    vendorName: "Test Vendor",
    purchasePlace: "Hyderabad",
    pincode: "500001",
    purchaseDate: new Date().toISOString(),
    seedType: "BM"
  })
});
const data = await response.json();
console.log(data.batchNumber);
```

### Python Requests

```python
import requests
import json

url = 'http://localhost:5000/api/batches/create-seed'
payload = {
    'vendorName': 'Test Vendor',
    'purchasePlace': 'Hyderabad',
    'pincode': '500001',
    'purchaseDate': '2026-04-13T14:30:00',
    'seedType': 'BM'
}

response = requests.post(url, json=payload)
data = response.json()
print(data['batchNumber'])
```

---

## Response Time Guidelines

| Endpoint | Expected Time |
|----------|----------------|
| Health Check | < 10ms |
| Create Batch | 100-500ms (QR generation: 200-300ms) |
| Get Batch | 50-100ms |
| Update Extraction | 200-600ms (QR generation) |
| Complete Packaging | 400-800ms (2 QR codes) |
| Get Statistics | 50-100ms |

---

**Happy API Testing!** 🚀
