# Cold-Pressed Oil Inventory & Traceability System

A comprehensive web application for managing a 3-stage cold-pressed oil production workflow with QR code tracking. This system provides complete traceability from seed procurement through oil extraction to final packaging.

## 🌱 Project Overview

This system tracks cold-pressed oil production through three critical stages:

1. **Stage 1: Seed Procurement** - Register seed batches and generate tracking QR codes
2. **Stage 2: Oil Extraction** - Record extraction process and generate container QR codes
3. **Stage 3: Packaging** - Finalize packaging and generate dual QR codes (customer & internal)

Each stage builds upon the previous one, creating an immutable audit trail suitable for regulatory compliance and customer transparency.

## ✨ Key Features

### Production Workflow
- ✅ 3-stage sequential production tracking
- ✅ Automatic batch number generation with unique identifiers
- ✅ QR code-based linking between stages
- ✅ Complete audit trail from seed to product

### QR Code System
- ✅ Stage 1: Bag QR Code (seed container tracking)
- ✅ Stage 2: Container QR Code (oil container tracking)
- ✅ Stage 3: Dual QR Codes
  - Customer QR: Limited info for retail transparency
  - Internal QR: Complete audit trail for business records

### User Interface
- ✅ Clean, intuitive web interface
- ✅ Real-time QR code scanning with camera integration
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Batch search and history tracking
- ✅ Download QR codes for printing

### Technical Features
- ✅ RESTful API backend
- ✅ MongoDB database with document versioning
- ✅ CORS-enabled for cross-origin requests
- ✅ Error handling and validation
- ✅ Performance optimized

## 🏗️ Architecture

```
Cold-Pressed Oil Traceability System
│
├── Frontend (HTML/CSS/JavaScript)
│   ├── Stage 1: Seed Procurement Form
│   ├── Stage 2: Oil Extraction Form with QR Scanner
│   ├── Stage 3: Packaging Form with QR Scanner
│   └── Batch Tracking & History
│
├── Backend API (Node.js/Express)
│   ├── Batch Management Routes
│   ├── QR Code Generation Service
│   ├── Batch Number Generation Service
│   └── MongoDB Database
│
└── External Libraries
    ├── html5-qrcode (Frontend QR scanning)
    └── qrcode (Backend QR generation)
```

## 📋 Batch Number Format

Batches are identified by a unique number combining seed type, timestamp, and location:

**Format**: `[Prefix][YYYYMMDDHHMMSS]-[Pincode]`

**Example**: `BM20260413143025-500001`

**Seed Type Prefixes**:
- `BM` - Black Mustard
- `WS` - White Sesame
- `GN` - Groundnut
- `CO` - Coconut
- `AL` - Almond

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+ (local or Atlas)
- Modern web browser with camera support
- Git (optional)

### Installation

#### 1. Clone or Download the Project
```bash
git clone <repository-url>
cd Simply\ Bhartiya
```

#### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure MongoDB connection
# Edit .env file:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/oil-traceability
NODE_ENV=development

# Start the server
npm start
```

Backend will be available at: `http://localhost:5000`

#### 3. Setup Frontend

```bash
# In a new terminal, navigate to frontend
cd frontend

# Option A: Use Python HTTP Server (if Python is installed)
python -m http.server 8000

# Option B: Open index.html directly in browser
# Option C: Use VS Code Live Server extension
```

Frontend will be available at: `http://localhost:8000` (or your chosen port)

### Verify Setup

1. **Backend Health Check**
   - Open `http://localhost:5000/api/health` in browser
   - Should return: `{"status":"OK","message":"Oil Traceability API is running"}`

2. **Frontend UI**
   - Open `http://localhost:8000` (or wherever frontend is hosted)
   - Should see the application with 4 tabs

## 📖 Usage Guide

### Creating a New Seed Batch (Stage 1)

1. Navigate to **"Stage 1: Seed Procurement"** tab
2. Fill in the form:
   - Vendor Name: e.g., "John's Seeds Ltd"
   - Purchase Place: e.g., "Hyderabad"
   - Pincode: e.g., "500001"
   - Seed Type: Select from dropdown
   - Purchase Date: Date and time of purchase
3. Click **"Create Batch & Generate Bag QR"**
4. Batch number is generated automatically
5. Download the Bag QR Code and print it
6. Paste the QR code on the seed bag

### Recording Oil Extraction (Stage 2)

1. Navigate to **"Stage 2: Oil Extraction"** tab
2. Click **"Show Scanner"**
3. Allow camera permission if prompted
4. Scan the Bag QR Code from the seed container
5. System loads existing batch data
6. Fill in extraction details:
   - Worker Name: e.g., "Raj Kumar"
   - Machine Number: e.g., "EXT-001"
   - Extraction Date & Time
7. Click **"Update Extraction & Generate Container QR"**
8. Download the Container QR Code
9. Paste the QR code on the oil container

### Completing Packaging (Stage 3)

1. Navigate to **"Stage 3: Packaging"** tab
2. Click **"Show Scanner"**
3. Scan the Container QR Code
4. System loads complete batch history with all stages
5. Fill in packaging details:
   - Packaging Worker Name: e.g., "Priya Singh"
   - Packaging Date & Time
6. Click **"Complete Packaging & Generate Final QR Codes"**
7. Two QR codes are generated:
   - **Customer QR**: Contains limited info (dates, pincode, batch number)
   - **Internal QR**: Contains complete production history
8. Download both QR codes for product labels

### Tracking Batch History

1. Navigate to **"Track Batch"** tab
2. Enter the Batch Number (e.g., "BM20260413143025-500001")
3. Click **"Search"**
4. View complete production timeline with:
   - Seed procurement details
   - Extraction information
   - Packaging information
   - All generated QR codes
   - Visual progress indicators

## 📁 Project Structure

```
Simply Bhartiya/
│
├── backend/
│   ├── models/
│   │   └── Batch.js               # MongoDB Batch schema
│   ├── routes/
│   │   └── batchRoutes.js         # API endpoints
│   ├── utilities/
│   │   └── qrUtils.js             # QR code and batch number logic
│   ├── server.js                  # Express server setup
│   ├── package.json               # Backend dependencies
│   ├── .env                       # Environment configuration
│   └── README.md                  # Backend documentation
│
├── frontend/
│   ├── index.html                 # Main HTML structure
│   ├── styles.css                 # Responsive styling
│   ├── app.js                     # Frontend logic and API calls
│   └── README.md                  # Frontend documentation
│
└── README.md                      # This file
```

## 🔌 API Endpoints

### Create Seed Batch
```
POST /api/batches/create-seed
Content-Type: application/json

{
  "vendorName": "vendor",
  "purchasePlace": "city",
  "pincode": "500001",
  "purchaseDate": "2026-04-13T14:30:00",
  "seedType": "BM"
}
```

### Get Batch Details
```
GET /api/batches/:batchNumber
```

### Update Oil Extraction
```
PUT /api/batches/:batchNumber/extract-oil
Content-Type: application/json

{
  "workerName": "worker",
  "extractionDateTime": "2026-04-14T09:00:00",
  "machineNumber": "EXT-001"
}
```

### Complete Packaging
```
PUT /api/batches/:batchNumber/package
Content-Type: application/json

{
  "packagingWorkerName": "worker",
  "packagingDateTime": "2026-04-15T15:30:00"
}
```

### Get All Batches
```
GET /api/batches
```

### Get Statistics
```
GET /api/batches/stats/overview
```

## 🗄️ Database Schema

### Batch Document Structure
```javascript
{
  _id: ObjectId,
  batchNumber: String,           // Unique identifier
  seedType: String,              // BM, WS, GN, CO, AL
  
  stage1: {
    vendorName: String,
    purchasePlace: String,
    pincode: String,
    purchaseDate: Date,
    completedAt: Date,
    bagQRCode: String             // Base64 PNG image
  },
  
  stage2: {
    workerName: String,
    extractionDateTime: Date,
    machineNumber: String,
    completedAt: Date,
    containerQRCode: String        // Base64 PNG image
  },
  
  stage3: {
    packagingWorkerName: String,
    packagingDateTime: Date,
    completedAt: Date,
    customerQRCode: String,        // Base64 PNG image
    internalQRCode: String         // Base64 PNG image
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Considerations

### Current Implementation
- Input validation on both client and server
- CORS protection enabled
- Error messages don't expose sensitive system info
- MongoDB injection prevention via Mongoose

### Production Recommendations
1. **Enable HTTPS**: Use SSL/TLS certificates
2. **Authentication**: Implement JWT-based authentication
3. **Authorization**: Add role-based access control (Admin, Worker, Customer)
4. **API Rate Limiting**: Prevent abuse with rate limits
5. **Database Security**: Use MongoDB authentication and encryption
6. **Environment Variables**: Keep secrets (DB credentials) secure
7. **Input Sanitization**: Enhanced validation and sanitization
8. **Logging**: Implement comprehensive audit logging

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Test API endpoints using curl
curl http://localhost:5000/api/health

# Or use Postman/Insomnia to test API endpoints
```

### Frontend Testing
1. Open browser DevTools (F12)
2. Check Console tab for error messages
3. Check Network tab to monitor API calls
4. Test QR scanning with sample QR codes
5. Test batch creation and tracking workflow

## 🎨 Customization

### Change Seed Types
Edit `backend/models/Batch.js` and `frontend/index.html` to add more seed types.

### Modify QR Code Size
Edit in `frontend/app.js`:
```javascript
{ fps: 10, qrbox: 250 }  // Change 250 to desired size
```

### Update Color Scheme
Edit CSS variables in `frontend/styles.css`

### Change API Endpoint
Edit in `frontend/app.js`:
```javascript
const API_BASE_URL = 'https://your-api-domain.com/api';
```

## 🐛 Troubleshooting

### Backend Won't Start
- Check if port 5000 is in use
- Verify MongoDB is running: `mongosh` or MongoDB Compass
- Check `.env` file configuration
- Review console error messages

### Frontend API Calls Fail
- Verify backend is running on correct port
- Check browser console for CORS errors
- Ensure API URL is correct in `app.js`
- Check network tab in browser DevTools

### QR Scanner Not Working
- Grant camera permission to browser
- Use HTTPS in production (http://localhost is exception)
- Try different browser
- Check if device has camera

### Database Connection Issues
- Verify MongoDB service is running
- Check connection string in `.env`
- Use MongoDB Atlas for cloud option
- Review MongoDB logs

## 📊 Database Statistics

View production statistics:
```
GET /api/batches/stats/overview
```

Returns:
- Total batches created
- Batches completed at each stage
- Percentage completion rates

## 📚 Documentation

- **Backend**: See [backend/README.md](backend/README.md)
- **Frontend**: See [frontend/README.md](frontend/README.md)

## 🚀 Deployment

### Deploy Backend
```bash
# Using Heroku
heroku create your-app-name
git push heroku main

# Using AWS/Digital Ocean
# Follow provider's Node.js deployment guide
```

### Deploy Frontend
```bash
# Using Netlify
netlify deploy --dir frontend

# Using GitHub Pages
# Push frontend folder to gh-pages branch

# Using AWS S3 + CloudFront
# Upload files to S3 bucket
```

## 📝 License

This project is created for cold-pressed oil manufacturers seeking production traceability.

## 👥 Contributors

- Senior Full-Stack Developer

## 📧 Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend/frontend README files
3. Check browser console for error messages
4. Verify all services are running correctly

## 🎯 Future Enhancements

1. **Authentication**: User accounts and login
2. **Real-time Notifications**: Email/SMS alerts at each stage
3. **Advanced Analytics**: Production dashboards and reports
4. **Blockchain Integration**: Immutable audit trail
5. **Mobile App**: Native iOS/Android applications
6. **Barcode Support**: In addition to QR codes
7. **Image Capture**: Photo documentation at each stage
8. **API Documentation**: Swagger/OpenAPI specs
9. **Localization**: Multi-language support
10. **Dark Mode**: Theme preferences

## ✅ System Requirements Summary

### Backend
- Node.js 16.x or higher
- MongoDB 4.4 or higher
- 512MB RAM minimum
- 100MB disk space

### Frontend
- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Camera access for QR scanning
- Internet connectivity

---

**Ready to track your cold-pressed oil production with complete transparency!** 🌱
