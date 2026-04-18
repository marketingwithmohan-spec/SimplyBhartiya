# Cold-Pressed Oil Inventory & Traceability System - Frontend

## Overview
A modern, responsive web interface for managing the 3-stage cold-pressed oil production workflow with QR code scanning capabilities.

## Features

### Stage 1: Seed Procurement
- Form to register new seed batches
- Automatic batch number generation based on seed type and timestamp
- Generates and displays Bag QR Code
- Download capability for printed labels

### Stage 2: Oil Extraction
- QR code scanner to retrieve existing batch data
- Display of seed procurement details
- Form to add extraction worker, date/time, and machine number
- Generates and displays Container QR Code

### Stage 3: Packaging
- QR code scanner for container tracking
- Display of complete batch history
- Form to add packaging worker and date/time
- Generates two distinct QR codes:
  - **Customer QR**: Limited information for retail packaging
  - **Internal QR**: Complete audit trail for internal use

### Batch Tracking
- Search batches by batch number
- View complete production history
- Display QR codes at each stage
- Visual progress indicators

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Responsive design
- **JavaScript (ES6+)** - Frontend logic
- **html5-qrcode** - QR code scanning library

## File Structure

```
frontend/
├── index.html          # Main HTML structure with all 3 stages + tracking
├── styles.css          # Complete styling and responsive design
├── app.js              # All JavaScript logic and API interactions
└── README.md          # This file
```

## Installation & Setup

### Prerequisites
- Modern web browser with camera access
- Backend API running on http://localhost:5000
- Internet connection for CDN libraries

### Quick Start

1. **Simple File Serving**
   - Open `index.html` in a web browser (Chrome, Firefox, Edge, Safari)
   - Or use Python: `python -m http.server 8000`
   - Or use VS Code Live Server extension

2. **Using Live Server (VS Code)**
   - Install "Live Server" extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

3. **Using Python HTTP Server**
   ```bash
   cd frontend
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000`

4. **Using Node.js with http-server**
   ```bash
   npm install -g http-server
   http-server
   ```

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 90+     | ✓ Full  |
| Firefox | 88+     | ✓ Full  |
| Safari  | 14+     | ✓ Full  |
| Edge    | 90+     | ✓ Full  |

## API Configuration

The frontend communicates with the backend API at:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

To change the API endpoint, modify this variable in `app.js`.

## QR Code Scanning

### How Scanning Works

1. Click "Show Scanner" button
2. Allow camera permission when prompted
3. Point camera at QR code
4. System automatically reads and loads batch data
5. Form appears showing existing data
6. Fill in new details and submit

### Supported QR Code Formats

- **Stage 1 & 2**: Simple text (batch number)
- **Stage 3**: JSON data for customer and internal tracking

### Camera Permission

The application requires camera access:
- First use prompts browser permission
- Can be changed in browser settings
- HTTPS recommended for production

## Usage Guide

### Stage 1: Register Seed Batch

1. Click "Stage 1: Seed Procurement" tab
2. Fill in form fields:
   - **Vendor Name**: Supplier name
   - **Purchase Place**: City/location
   - **Pincode**: 6-digit postal code
   - **Seed Type**: Select from dropdown (BM, WS, GN, CO, AL)
   - **Purchase Date**: Date and time of purchase
3. Click "Create Batch & Generate Bag QR"
4. Batch number is auto-generated in format: `BM20260413143025-500001`
5. Download and print the Bag QR Code
6. Paste QR code label on seed bag

### Stage 2: Record Oil Extraction

1. Click "Stage 2: Oil Extraction" tab
2. Click "Show Scanner"
3. Scan the Bag QR code from the seed container
4. System loads existing batch data
5. Fill in extraction details:
   - **Worker Name**: Person extracting oil
   - **Machine Number**: ID of extraction machine
   - **Extraction Date & Time**: When extraction happened
6. Click "Update Extraction & Generate Container QR"
7. Download and print the Container QR Code
8. Paste QR code label on oil container

### Stage 3: Package and Finalize

1. Click "Stage 3: Packaging" tab
2. Click "Show Scanner"
3. Scan the Container QR code from oil container
4. System loads complete batch history
5. Fill in packaging details:
   - **Packaging Worker Name**: Person packaging product
   - **Packaging Date & Time**: When packaging occurred
6. Click "Complete Packaging & Generate Final QR Codes"
7. Two QR codes are generated:
   - **Customer QR**: For retail/customer display
   - **Internal QR**: For business audit trail
8. Download both QR codes for labels

### Track Batch History

1. Click "Track Batch" tab
2. Enter Batch Number
3. Click "Search"
4. View complete production timeline
5. See all QR codes at each stage
6. Visual indicators show completion status

## User Interface

### Color Scheme
- **Primary**: Purple gradient (#667eea to #764ba2)
- **Success**: Green (#28a745, #155724)
- **Warning**: Yellow (#ffc107)
- **Info**: Blue (#0275d8)
- **Error**: Red (#dc3545)

### Responsive Design
- Desktop: Multi-column layouts
- Tablet: Adjusted spacing and sizing
- Mobile: Single column, optimized touch targets

### Alert Messages
- Info alerts: Blue background with spinner
- Success alerts: Green background with checkmark
- Error alerts: Red background
- Auto-dismiss after 5 seconds

## JavaScript Functions

### Tab Management
```javascript
switchTab(tabName)  // Switch between stage tabs
```

### Stage 1
```javascript
handleStage1Submit()      // Submit seed procurement form
displayStage1Result(data) // Show success and QR code
```

### Stage 2
```javascript
startScanner2()               // Initialize camera scanner
stopScanner2()                // Stop the scanner
loadBatchDataForStage2()      // Load existing batch data
handleStage2Submit()          // Submit extraction form
onScanSuccess2(decodedText)   // Handle QR scan
```

### Stage 3
```javascript
startScanner3()               // Initialize camera scanner
stopScanner3()                // Stop the scanner
loadBatchDataForStage3()      // Load existing batch data
handleStage3Submit()          // Submit packaging form
onScanSuccess3(decodedText)   // Handle QR scan
```

### Batch Tracking
```javascript
searchBatch()            // Search for batch by number
displayBatchTracking()   // Show complete batch history
```

### Utilities
```javascript
showAlert(message, type)     // Display alert notification
downloadQR(imageId, name)    // Download QR code image
formatDateTime(dateString)   // Format dates for display
```

## API Endpoints Used

- `POST /api/batches/create-seed` - Create new batch
- `GET /api/batches/:batchNumber` - Get batch details
- `PUT /api/batches/:batchNumber/extract-oil` - Update extraction
- `PUT /api/batches/:batchNumber/package` - Complete packaging
- `GET /api/health` - Health check

## Customization Guide

### Change API Endpoint
Edit in `app.js` (line ~2):
```javascript
const API_BASE_URL = 'https://api.example.com';
```

### Modify Seed Types
Edit in `index.html` (Stage 1 form):
```html
<option value="BM">Black Mustard (BM)</option>
<option value="WS">White Sesame (WS)</option>
<!-- Add more types as needed -->
```

### Update Color Scheme
Edit CSS variables in `styles.css`:
```css
body {
    color: #667eea; /* Change primary color here */
}
```

### Adjust Scanner Size
Edit in `app.js`:
```javascript
{ fps: 10, qrbox: 250 }  // Change 250 to desired size in pixels
```

## Troubleshooting

### Camera Not Working
- Check browser permissions (Settings → Privacy → Camera)
- Ensure HTTPS is used (http://localhost is exception)
- Try different browser
- Check if device has camera hardware

### QR Code Scanner Not Starting
- Verify camera permissions are enabled
- Check browser console for errors
- Ensure backend API is running
- Clear browser cache and reload

### API Connection Failed
- Verify backend is running on http://localhost:5000
- Check browser console for CORS errors
- Add backend URL to CORS whitelist
- Ensure both frontend and backend are on same machine or network

### QR Code Display Issues
- Check if QR codes are embedded as base64
- Verify image format is PNG
- Try saving as different image format
- Check file permissions if saving locally

### Form Not Submitting
- Verify all required fields are filled
- Check browser console for JavaScript errors
- Ensure date/time format is correct
- Try refreshing the page

## Performance Optimization

1. **QR Code Generation**: Uses optimized qrcode library
2. **Image Compression**: QR codes are PNG format (small file size)
3. **Lazy Loading**: Forms only show when needed
4. **Event Delegation**: Single event handlers for multiple elements
5. **Caching**: Browser caches static assets

## Security Considerations

1. **API Calls**: Uses standard HTTP (use HTTPS in production)
2. **Input Validation**: Client-side validation prevents malformed requests
3. **CORS**: Restricted to API domain in production
4. **Camera Permissions**: User must explicitly grant access
5. **Data Storage**: QR codes are not stored locally, generated on demand

## Browser DevTools

### Console Errors
Open DevTools (F12) → Console tab to see any errors

### Network Monitoring
DevTools → Network tab monitors API calls

### Performance
DevTools → Performance tab shows load times

## Mobile Considerations

- Touch-friendly button sizes (min 44x44 pixels)
- Responsive scanner layout
- Portrait and landscape support
- Optimized for iOS and Android

## Future Enhancements

1. Offline support with service workers
2. Real-time batch collaboration
3. Advanced analytics dashboard
4. Batch history export (PDF/CSV)
5. Multiple language support (i18n)
6. Dark mode theme
7. Barcode scanning in addition to QR
8. Image upload at each stage
9. Notes/comments functionality
10. Webhook notifications
