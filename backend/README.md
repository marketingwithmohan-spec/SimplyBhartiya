# Cold-Pressed Oil Inventory & Traceability System - Backend

## Overview
The backend API for the Cold-Pressed Oil Inventory & Traceability System manages a 3-stage production workflow with QR code tracking.

## Technology Stack
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB
- **QR Code Generation**: qrcode library
- **Runtime**: Node.js 16+

## Project Structure

```
backend/
├── models/
│   └── Batch.js              # MongoDB schema for batch data
├── routes/
│   └── batchRoutes.js        # API endpoints for batch operations
├── utilities/
│   └── qrUtils.js            # QR code generation and batch number logic
├── server.js                 # Express server setup
├── package.json              # Dependencies
└── .env                       # Environment variables
```

## Installation

### Prerequisites
- Node.js 16.x or higher
- MongoDB 4.4 or higher (local or Atlas)

### Setup Steps

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Edit `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/oil-traceability
NODE_ENV=development
```

4. **Start the server:**
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### 1. Stage 1: Create Seed Procurement Record
**Endpoint**: `POST /api/batches/create-seed`

**Request Body**:
```json
{
  "vendorName": "John's Seeds",
  "purchasePlace": "Hyderabad",
  "pincode": "500001",
  "purchaseDate": "2026-04-13T14:30:00",
  "seedType": "BM"
}
```

**Response**:
```json
{
  "success": true,
  "batchNumber": "BM20260413143025-500001",
  "bagQRCode": "data:image/png;base64,iVBORw0...",
  "batch": { ... }
}
```

**Seed Type Prefixes**:
- BM = Black Mustard
- WS = White Sesame
- GN = Groundnut
- CO = Coconut
- AL = Almond

### 2. Get Batch Details
**Endpoint**: `GET /api/batches/:batchNumber`

**Response**:
```json
{
  "success": true,
  "batch": { ... }
}
```

### 3. Stage 2: Update Oil Extraction Record
**Endpoint**: `PUT /api/batches/:batchNumber/extract-oil`

**Request Body**:
```json
{
  "workerName": "Raj Kumar",
  "extractionDateTime": "2026-04-14T09:00:00",
  "machineNumber": "EXT-001"
}
```

**Response**:
```json
{
  "success": true,
  "containerQRCode": "data:image/png;base64,iVBORw0...",
  "batch": { ... }
}
```

### 4. Stage 3: Complete Packaging and Generate Final QR Codes
**Endpoint**: `PUT /api/batches/:batchNumber/package`

**Request Body**:
```json
{
  "packagingWorkerName": "Priya Singh",
  "packagingDateTime": "2026-04-15T15:30:00"
}
```

**Response**:
```json
{
  "success": true,
  "customerQRCode": "data:image/png;base64,iVBORw0...",
  "internalQRCode": "data:image/png;base64,iVBORw0...",
  "batch": { ... }
}
```

### 5. Get All Batches
**Endpoint**: `GET /api/batches`

**Response**:
```json
{
  "success": true,
  "count": 10,
  "batches": [ ... ]
}
```

### 6. Get Statistics Overview
**Endpoint**: `GET /api/batches/stats/overview`

**Response**:
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

## Batch Number Generation Format

Format: `[Prefix][YYYYMMDDHHMMSS]-[Pincode]`

Example: `BM20260413143025-500001`

Where:
- BM = Black Mustard (seed type prefix)
- 2026 = Year
- 04 = Month
- 13 = Day
- 14 = Hour
- 30 = Minute
- 25 = Second
- 500001 = Pincode

## QR Code Data Payloads

### Stage 1 & 2: Simple QR Code
Contains only the batch number for easy tracking.

### Stage 3 - Customer QR Code
Contains limited customer-facing information:
```json
{
  "type": "customer",
  "batchNumber": "BM20260413143025-500001",
  "seedProcurementDate": "2026-04-13T14:30:00",
  "pincode": "500001",
  "extractionDate": "2026-04-14T09:00:00",
  "packagingDate": "2026-04-15T15:30:00"
}
```

### Stage 3 - Internal/Business QR Code
Contains complete audit trail:
```json
{
  "type": "internal",
  "batchNumber": "BM20260413143025-500001",
  "seedType": "BM",
  "stage1": {
    "vendorName": "John's Seeds",
    "purchasePlace": "Hyderabad",
    "pincode": "500001",
    "purchaseDate": "2026-04-13T14:30:00"
  },
  "stage2": {
    "workerName": "Raj Kumar",
    "extractionDateTime": "2026-04-14T09:00:00",
    "machineNumber": "EXT-001"
  },
  "stage3": {
    "packagingWorkerName": "Priya Singh",
    "packagingDateTime": "2026-04-15T15:30:00"
  }
}
```

## Database Schema

### Batch Collection

```javascript
{
  _id: ObjectId,
  batchNumber: String (unique),
  seedType: String (enum: BM, WS, GN, CO, AL),
  
  // Stage 1: Seed Procurement
  stage1: {
    vendorName: String,
    purchasePlace: String,
    pincode: String,
    purchaseDate: Date,
    completedAt: Date,
    bagQRCode: String
  },
  
  // Stage 2: Oil Extraction
  stage2: {
    workerName: String,
    extractionDateTime: Date,
    machineNumber: String,
    completedAt: Date,
    containerQRCode: String
  },
  
  // Stage 3: Packaging
  stage3: {
    packagingWorkerName: String,
    packagingDateTime: Date,
    completedAt: Date,
    customerQRCode: String,
    internalQRCode: String
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message description"
}
```

Common HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## CORS Configuration

The backend is configured to accept requests from any origin. For production, update the CORS configuration in `server.js`:

```javascript
app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true
}));
```

## Health Check

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "OK",
  "message": "Oil Traceability API is running"
}
```

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - Cross-Origin Resource Sharing
- **qrcode** - QR code generation
- **dotenv** - Environment variable management

## Future Enhancements

1. Add authentication and authorization (JWT)
2. Implement role-based access control (Admin, Worker, Customer)
3. Add batch filtering and advanced search
4. Implement data export (CSV, PDF reports)
5. Add email notifications at each stage
6. Integrate with blockchain for immutable records
7. Add image capture at each stage
8. Implement batch splitting/merging logic
