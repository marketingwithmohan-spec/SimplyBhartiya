```
Simply Bhartiya [ROOT DIRECTORY]
│
├── 📄 README.md                    [MAIN PROJECT DOCUMENTATION]
│   └─ Overview, features, architecture, quick links
│
├── 📄 QUICK_START.txt              [5-MINUTE QUICK START]
│   └─ Immediate setup instructions for impatient users
│
├── 📄 SETUP_GUIDE.md               [DETAILED STEP-BY-STEP SETUP]
│   └─ Comprehensive installation with MongoDB & testing
│
├── 📄 API_REFERENCE.md             [API EXAMPLES & TESTING]
│   └─ CURL examples, Postman collection, testing guides
│
├── 📄 QR_CODE_GUIDE.md             [QR CODE DEEP DIVE]
│   └─ QR data structures, payloads, generation process
│
├── 📄 PROJECT_SUMMARY.md           [THIS PROJECT OVERVIEW]
│   └─ Complete architecture, decisions, statistics
│
├── 📄 .gitignore                   [GIT IGNORE RULES]
│   └─ Excludes node_modules, .env, build outputs
│
├── 📁 backend/                     [BACKEND APPLICATION]
│   │
│   ├── 📄 server.js                [EXPRESS SERVER SETUP]
│   │   └─ Main server entry point, middleware, routes
│   │
│   ├── 📄 package.json             [DEPENDENCIES & SCRIPTS]
│   │   └─ npm packages, start/dev scripts
│   │
│   ├── 📄 .env                     [ENVIRONMENT CONFIGURATION]
│   │   └─ PORT, MONGODB_URI, NODE_ENV
│   │
│   ├── 📄 README.md                [BACKEND DOCUMENTATION]
│   │   └─ API endpoints, database schema, setup
│   │
│   ├── 📁 models/
│   │   └── 📄 Batch.js             [MONGODB SCHEMA]
│   │       └─ Batch document structure with 3 stages
│   │
│   ├── 📁 routes/
│   │   └── 📄 batchRoutes.js        [API ENDPOINT HANDLERS]
│   │       └─ 6 main routes for CRUD operations
│   │
│   ├── 📁 utilities/
│   │   └── 📄 qrUtils.js            [QR CODE UTILITIES]
│   │       └─ Batch number generation, QR code creation
│   │
│   └── 📁 middleware/               [API MIDDLEWARE]
│       └─ (Can add error handlers, auth here)
│
├── 📁 frontend/                    [FRONTEND APPLICATION]
│   │
│   ├── 📄 index.html               [MAIN HTML STRUCTURE]
│   │   ├─ Header with branding
│   │   ├─ Navigation tabs (4 tabs)
│   │   ├─ Form sections (3 stages + tracking)
│   │   ├─ QR scanner containers
│   │   ├─ Result display areas
│   │   └─ Alert/notification system
│   │
│   ├── 📄 styles.css               [RESPONSIVE STYLING]
│   │   ├─ Color scheme (purple gradient)
│   │   ├─ Tab navigation styling
│   │   ├─ Form styling
│   │   ├─ QR code display
│   │   ├─ Responsive breakpoints
│   │   └─ Alert/notification styles
│   │
│   ├── 📄 app.js                   [JAVASCRIPT APPLICATION LOGIC]
│   │   ├─ Event listeners
│   │   ├─ Tab switching
│   │   ├─ Stage 1 form handler
│   │   ├─ Stage 2 QR scanner + form
│   │   ├─ Stage 3 QR scanner + form
│   │   ├─ Batch tracking
│   │   ├─ API communication
│   │   ├─ QR code display
│   │   ├─ Download functionality
│   │   └─ Utility functions
│   │
│   └── 📄 README.md                [FRONTEND DOCUMENTATION]
│       └─ Features, setup, usage, customization
│
└── 📁 (Currently empty, ready for expansion)
    ├── models/                     [Additional models if needed]
    ├── tests/                      [Test files location]
    ├── docs/                       [Additional documentation]
    └── deployment/                 [Deployment configs]
```

## File Purpose Reference

### Core Application Files (11 files)

| File | Size | Purpose | Technology |
|------|------|---------|-----------|
| backend/server.js | ~40 lines | Express server setup | Node.js |
| backend/models/Batch.js | ~60 lines | Database schema | Mongoose |
| backend/routes/batchRoutes.js | ~180 lines | API endpoints | Express |
| backend/utilities/qrUtils.js | ~100 lines | QR generation utility | JavaScript |
| frontend/index.html | ~260 lines | Page structure | HTML5 |
| frontend/styles.css | ~380 lines | Visual styling | CSS3 |
| frontend/app.js | ~400 lines | Application logic | JavaScript |
| backend/package.json | ~15 lines | Dependencies list | JSON |
| backend/.env | ~3 lines | Configuration | ENV |
| frontend/.gitignore | ~15 lines | Git ignore | Text |

### Documentation Files (8 files)

| File | Audience | Length | Content |
|------|----------|--------|---------|
| README.md | Everyone | ~600 lines | Project overview |
| QUICK_START.txt | Impatient users | ~200 lines | 5-min setup |
| SETUP_GUIDE.md | New developers | ~350 lines | Detailed setup |
| API_REFERENCE.md | API consumers | ~350 lines | API examples |
| QR_CODE_GUIDE.md | Tech users | ~300 lines | QR details |
| PROJECT_SUMMARY.md | Project managers | ~600 lines | Overview |
| backend/README.md | Backend devs | ~400 lines | Backend docs |
| frontend/README.md | Frontend devs | ~400 lines | Frontend docs |

## Directory Organization

### Backend Structure
```
backend/
├── Server & Config
│   ├── server.js          (Express setup)
│   ├── package.json       (Dependencies)
│   └── .env               (Configuration)
│
├── Database Layer
│   └── models/
│       └── Batch.js       (MongoDB schema)
│
├── API Layer
│   └── routes/
│       └── batchRoutes.js (6 endpoints)
│
└── Utility Layer
    └── utilities/
        └── qrUtils.js     (QR functions)
```

### Frontend Structure
```
frontend/
├── Structure
│   └── index.html         (HTML5 markup)
│
├── Presentation
│   └── styles.css         (CSS3 styling)
│
└── Behavior
    └── app.js             (JavaScript logic)
```

## Database Schema Hierarchy

```
MongoDB (oil-traceability)
│
└── batches collection
    │
    └── document (one batch)
        ├── _id (auto-generated)
        ├── batchNumber (unique, indexed)
        ├── seedType (BM, WS, GN, CO, AL)
        │
        ├── stage1 (Seed Procurement)
        │   ├── vendorName
        │   ├── purchasePlace
        │   ├── pincode
        │   ├── purchaseDate
        │   ├── completedAt
        │   └── bagQRCode (base64 image)
        │
        ├── stage2 (Oil Extraction)
        │   ├── workerName
        │   ├── extractionDateTime
        │   ├── machineNumber
        │   ├── completedAt
        │   └── containerQRCode (base64 image)
        │
        ├── stage3 (Packaging)
        │   ├── packagingWorkerName
        │   ├── packagingDateTime
        │   ├── completedAt
        │   ├── customerQRCode (base64 image)
        │   └── internalQRCode (base64 image)
        │
        ├── createdAt (timestamp)
        └── updatedAt (timestamp)
```

## API Endpoint Hierarchy

```
http://localhost:5000/api
│
├── /health
│   └── GET → Check API status
│
├── /batches
│   ├── POST /create-seed
│   │   └─ Create batch (Stage 1)
│   │
│   ├── GET (no ID)
│   │   └─ List all batches
│   │
│   ├── /:batchNumber
│   │   ├── GET
│   │   │   └─ Get batch details
│   │   │
│   │   ├── /extract-oil (PUT)
│   │   │   └─ Update extraction (Stage 2)
│   │   │
│   │   └── /package (PUT)
│   │       └─ Complete packaging (Stage 3)
│   │
│   └── /stats/overview
│       └── GET → Production statistics
```

## Frontend Component Hierarchy

```
index.html
│
├── header
│   └─ Title & description
│
├── nav.tabs
│   ├─ Stage 1 Seed Procurement
│   ├─ Stage 2 Oil Extraction
│   ├─ Stage 3 Packaging
│   └─ Track Batch
│
├── section#stage1.tab-content
│   ├─ Form for batch creation
│   └─ Result display
│
├── section#stage2.tab-content
│   ├─ QR scanner
│   ├─ Existing data display
│   ├─ Extraction form
│   └─ Result display
│
├── section#stage3.tab-content
│   ├─ QR scanner
│   ├─ Existing data display
│   ├─ Packaging form
│   └─ Dual result display
│
├── section#tracking.tab-content
│   ├─ Search form
│   ├─ Results display
│   └─ Complete history
│
└── #alert-box
    └─ Notification system
```

## JavaScript Function Hierarchy

```
app.js

├── Setup & Initialization
│   ├── setupEventListeners()
│   └── setDefaultDateTime()
│
├── Tab Navigation
│   └── switchTab(tabName)
│
├── Stage 1 Functions
│   ├── handleStage1Submit()
│   └── displayStage1Result()
│
├── Stage 2 Functions
│   ├── startScanner2()
│   ├── stopScanner2()
│   ├── onScanSuccess2()
│   ├── loadBatchDataForStage2()
│   ├── handleStage2Submit()
│   └── displayStage2Result()
│
├── Stage 3 Functions
│   ├── startScanner3()
│   ├── stopScanner3()
│   ├── onScanSuccess3()
│   ├── loadBatchDataForStage3()
│   ├── handleStage3Submit()
│   └── displayStage3Result()
│
├── Batch Tracking Functions
│   ├── searchBatch()
│   └── displayBatchTracking()
│
├── Utility Functions
│   ├── showAlert()
│   ├── closeAlert()
│   ├── downloadQR()
│   ├── formatDateTime()
│   └── toggleScanner()
│
└── Event Handlers
    └── Various form & button handlers
```

## Data Flow Architecture

```
STAGE 1: SEED PROCUREMENT
  User Input (HTML Form)
    ↓
  JavaScript Validation (app.js)
    ↓
  API Call (fetch POST)
    ↓
  Express Handler (batchRoutes.js)
    ↓
  Generate Batch Number (qrUtils.js)
    ↓
  Validate Input (middleware)
    ↓
  Create Document (Batch.js model)
    ↓
  Generate QR Code (qrUtils.js)
    ↓
  Save to MongoDB (Batch collection)
    ↓
  Return Base64 Image (API response)
    ↓
  Display in Frontend (index.html img tag)
    ↓
  Download to Computer (app.js download function)
    ↓
  Print & Apply to Seed Bag


STAGE 2: OIL EXTRACTION
  QR Scanner (html5-qrcode library)
    ↓
  Batch Number Extraction (app.js)
    ↓
  Fetch Existing Data (API GET)
    ↓
  Display Previous Stage Info (index.html)
    ↓
  User Input (extraction form)
    ↓
  JavaScript Validation
    ↓
  API Call (fetch PUT)
    ↓
  Express Handler (batchRoutes.js)
    ↓
  Update Document (add stage2 data)
    ↓
  Generate QR Code (qrUtils.js)
    ↓
  Save to MongoDB
    ↓
  Return Base64 Image
    ↓
  Display in Frontend
    ↓
  Download to Computer
    ↓
  Print & Apply to Oil Container


STAGE 3: PACKAGING
  Similar to Stage 2, but generates TWO QR codes
    ├─ Customer QR (limited JSON payload)
    └─ Internal QR (complete JSON payload)


TRACKING
  User Input (batch number)
    ↓
  API Call (fetch GET)
    ↓
  Express Handler (batch lookup)
    ↓
  MongoDB Query (by batchNumber)
    ↓
  Return Complete Document
    ↓
  Frontend Display (formatted timeline)
```

## Library Dependencies

```
backend/package.json
├── express@^4.18.2          [Web framework]
├── mongoose@^7.0.0          [MongoDB ODM]
├── cors@^2.8.5              [CORS middleware]
├── qrcode@^1.5.3            [QR generation]
├── dotenv@^16.0.3           [Environment config]
└── uuid@^9.0.0              [ID generation]

frontend/index.html
├── html5-qrcode (CDN)       [QR scanning]
└── No other dependencies    [Vanilla JavaScript]
```

## File Sizes & Complexity

```
Backend Files:
├── server.js              ~1 KB   (Simple)
├── Batch.js              ~2 KB   (Simple)
├── batchRoutes.js        ~6 KB   (Complex)
├── qrUtils.js            ~4 KB   (Complex)
└── Total                ~13 KB

Frontend Files:
├── index.html           ~10 KB   (Medium)
├── styles.css           ~15 KB   (Medium)
├── app.js               ~16 KB   (Complex)
└── Total               ~41 KB

Documentation:
├── Multiple .md files   ~200 KB  (Comprehensive)

Total Project Size: ~250 KB (without node_modules)
```

## Setup & Deployment Checklist

```
LOCAL DEVELOPMENT
├── ✅ Backend setup
├── ✅ Frontend setup
├── ✅ MongoDB connection
├── ✅ API testing
└── ✅ QR functionality

DOCUMENTATION
├── ✅ README.md          (Project overview)
├── ✅ SETUP_GUIDE.md     (Step-by-step)
├── ✅ API_REFERENCE.md   (API examples)
├── ✅ QR_CODE_GUIDE.md   (QR details)
├── ✅ QUICK_START.txt    (5-minute guide)
├── ✅ backend/README.md  (Backend docs)
├── ✅ frontend/README.md (Frontend docs)
└── ✅ PROJECT_SUMMARY.md (This overview)

PRODUCTION READY
├── Code structure      ✅ Complete
├── Error handling      ✅ Implemented
├── Validation          ✅ Implemented
├── Documentation       ✅ Complete
├── Security review     ⚠️ Recommended
├── Performance testing ⚠️ Recommended
├── Deployment setup    ⚠️ Configuration needed
└── Monitoring setup    ⚠️ Configuration needed
```

---

## How to Navigate This Project

1. **Quick Start**: Read `QUICK_START.txt` (5 minutes)
2. **Full Setup**: Read `SETUP_GUIDE.md` (30 minutes)
3. **Understanding Code**: Read `README.md` (15 minutes)
4. **API Integration**: Read `API_REFERENCE.md` (20 minutes)
5. **QR Details**: Read `QR_CODE_GUIDE.md` (15 minutes)
6. **Specific Implementation**:
   - Backend → Read `backend/README.md`
   - Frontend → Read `frontend/README.md`
7. **Project Overview**: Read `PROJECT_SUMMARY.md` (this file)

---

**Project Structure Complete!** 🎉
All files are organized and documented.
Ready for development and deployment.
