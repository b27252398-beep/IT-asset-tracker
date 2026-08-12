const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Fake secret for mock JWT
const MOCK_TOKEN = "mock-jwt-token-123";

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
};

// --- AUTH ENDPOINTS ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    return res.json({ 
      success: true, 
      message: "Login successful", 
      data: { token: MOCK_TOKEN, user: { name: username, role: "ADMIN" } } 
    });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// Protect all /api/assets routes
app.use('/api/assets', authMiddleware);

// In-memory data stores
let assets = [
  {
    id: uuidv4(),
    assetTag: 'ASSET-001',
    name: 'MacBook Pro M2',
    category: 'LAPTOP',
    status: 'ASSIGNED',
    currentUser: 'Alice Smith',
    location: 'London Office',
    notes: 'Standard dev machine',
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    assetTag: 'ASSET-002',
    name: 'Dell UltraSharp 27',
    category: 'MONITOR',
    status: 'AVAILABLE',
    currentUser: null,
    location: 'IT Storeroom',
    notes: '',
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    assetTag: 'ASSET-003',
    name: 'Lenovo ThinkPad X1',
    category: 'LAPTOP',
    status: 'IN_REPAIR',
    currentUser: null,
    location: 'Repair Shop',
    notes: 'Keyboard replacement',
    createdAt: new Date().toISOString()
  }
];

let logs = [];

// Helper to add logs
function addLog(assetId, action, assignedTo, performedBy, notes) {
  logs.push({
    id: uuidv4(),
    asset: { id: assetId },
    action,
    assignedTo,
    performedBy,
    notes,
    createdAt: new Date().toISOString()
  });
}

const employees = [
  { id: "e1", name: "John Doe", email: "john@example.com", department: "Engineering", role: "Software Engineer", status: "Active" },
  { id: "e2", name: "Jane Smith", email: "jane@example.com", department: "Design", role: "Product Designer", status: "Active" },
  { id: "e3", name: "Mike Johnson", email: "mike@example.com", department: "HR", role: "HR Manager", status: "Active" },
  { id: "e4", name: "Sarah Williams", email: "sarah@example.com", department: "Engineering", role: "DevOps Engineer", status: "On Leave" },
];

// 1. GET /api/assets/dashboard
app.get('/api/assets/dashboard', (req, res) => {
  const metrics = {
    AVAILABLE: assets.filter(a => a.status === 'AVAILABLE').length,
    ASSIGNED: assets.filter(a => a.status === 'ASSIGNED').length,
    IN_REPAIR: assets.filter(a => a.status === 'IN_REPAIR').length,
    RETIRED: assets.filter(a => a.status === 'RETIRED').length
  };
  metrics.TOTAL = metrics.AVAILABLE + metrics.ASSIGNED + metrics.IN_REPAIR + metrics.RETIRED;
  res.json({ success: true, message: "Metrics retrieved successfully", data: metrics });
});

// GET /api/employees
app.get('/api/employees', (req, res) => {
  res.json({ success: true, message: "Employees retrieved successfully", data: employees });
});

// 2. GET /api/assets
app.get('/api/assets', (req, res) => {
  const { status } = req.query;
  if (status) {
    const filtered = assets.filter(a => a.status === status.toUpperCase());
    return res.json({ success: true, message: "Assets retrieved successfully", data: filtered });
  }
  res.json({ success: true, message: "Assets retrieved successfully", data: assets });
});

// 3. GET /api/assets/:id
app.get('/api/assets/:id', (req, res) => {
  const asset = assets.find(a => a.id === req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json(asset);
});

// 4. GET /api/assets/:id/logs
app.get('/api/assets/:id/logs', (req, res) => {
  const assetLogs = logs
    .filter(l => l.asset.id === req.params.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(assetLogs);
});

// 5. POST /api/assets
app.post('/api/assets', (req, res) => {
  const newAsset = {
    ...req.body,
    id: uuidv4(),
    status: 'AVAILABLE',
    currentUser: null,
    createdAt: new Date().toISOString()
  };
  assets.push(newAsset);
  addLog(newAsset.id, 'CREATED', null, 'SYSTEM', 'Asset registered in inventory');
  res.status(201).json(newAsset);
});

// 6. PUT /api/assets/:id/assign
app.put('/api/assets/:id/assign', (req, res) => {
  const { assignedTo, performedBy = 'SYSTEM' } = req.body;
  const asset = assets.find(a => a.id === req.params.id);
  
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  if (asset.status !== 'AVAILABLE') return res.status(409).json({ error: 'Asset is not available' });
  
  asset.status = 'ASSIGNED';
  asset.currentUser = assignedTo;
  
  addLog(asset.id, 'ASSIGNED', assignedTo, performedBy, `Asset assigned to ${assignedTo}`);
  res.json(asset);
});

// 7. PUT /api/assets/:id/status
app.put('/api/assets/:id/status', (req, res) => {
  const { status, performedBy = 'SYSTEM', notes = '' } = req.body;
  const asset = assets.find(a => a.id === req.params.id);
  
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  
  const oldStatus = asset.status;
  asset.status = status.toUpperCase();
  
  if (['AVAILABLE', 'IN_REPAIR', 'RETIRED'].includes(asset.status)) {
    asset.currentUser = null;
  }
  
  const logAction = asset.status === 'AVAILABLE' ? 'MARKED_AVAILABLE' : 
                    asset.status === 'IN_REPAIR' ? 'MARKED_REPAIR' : 
                    asset.status === 'RETIRED' ? 'RETIRED' : 'STATUS_CHANGED';
                    
  addLog(asset.id, logAction, null, performedBy, `Status changed from ${oldStatus} to ${asset.status}${notes ? ': ' + notes : ''}`);
  res.json(asset);
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Node.js backend running on http://localhost:${PORT}`);
});
