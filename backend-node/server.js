const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const emailService = require('./emailService');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Setup uploads directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

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

// ==========================================
// PHASE 19: DOCUMENT & IMAGE UPLOADS
// ==========================================

// GET /api/assets/:id/documents
app.get('/api/assets/:id/documents', async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { assetId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/assets/:id/documents
app.post('/api/assets/:id/documents', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const document = await prisma.document.create({
      data: {
        assetId: req.params.id,
        filename: req.file.originalname,
        filepath: `/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// PHASE 6: MAINTENANCE & REPAIR MODULE
// ==========================================

// GET /api/assets/:id/maintenance
app.get('/api/assets/:id/maintenance', async (req, res) => {
  try {
    const records = await prisma.maintenance.findMany({
      where: { assetId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/assets/:id/maintenance
app.post('/api/assets/:id/maintenance', async (req, res) => {
  try {
    const { issueDescription, cost, status } = req.body;
    const record = await prisma.maintenance.create({
      data: {
        assetId: req.params.id,
        issueDescription,
        cost: cost ? parseFloat(cost) : null,
        status: status || 'PENDING'
      }
    });

    // Automatically update asset status to IN_REPAIR if this is a new repair ticket
    if (status !== 'COMPLETED') {
      await prisma.asset.update({
        where: { id: req.params.id },
        data: { status: 'IN_REPAIR' }
      });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/maintenance/:id
app.put('/api/maintenance/:id', async (req, res) => {
  try {
    const { status, cost, assetId } = req.body;
    const record = await prisma.maintenance.update({
      where: { id: req.params.id },
      data: {
        status,
        cost: cost !== undefined ? parseFloat(cost) : undefined
      }
    });

    // If completed, move asset back to AVAILABLE
    if (status === 'COMPLETED' && assetId) {
      await prisma.asset.update({
        where: { id: assetId },
        data: { status: 'AVAILABLE' }
      });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- AUTH ENDPOINTS ---
// Credentials per portal:
//   admin / admin123  → ADMIN
//   staff / staff123  → EMPLOYEE
//   tech  / tech123   → TECH_TEAM
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const PORTAL_CREDENTIALS = {
    admin: { password: 'admin123', role: 'ADMIN',     name: 'IT Administrator' },
    staff: { password: 'staff123', role: 'EMPLOYEE',  name: 'Staff Member'     },
    tech:  { password: 'tech123',  role: 'TECH_TEAM', name: 'Tech Support'     },
  };

  const cred = PORTAL_CREDENTIALS[username?.toLowerCase()];
  if (cred && cred.password === password) {
    return res.json({
      success: true,
      message: 'Login successful',
      data: { token: MOCK_TOKEN, user: { name: cred.name, role: cred.role } }
    });
  }

  // Fallback: any credentials work (backward compatibility with old Login.tsx)
  if (username && password) {
    return res.json({
      success: true,
      message: 'Login successful',
      data: { token: MOCK_TOKEN, user: { name: username, role: 'ADMIN' } }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Protect all /api/assets routes
app.use('/api/assets', authMiddleware);
app.use('/api/employees', authMiddleware);

// --- SEED DATABASE ON STARTUP IF EMPTY ---
async function seedDatabase() {
  // ── 1. EMPLOYEES ──────────────────────────────────────────
  const empCount = await prisma.employee.count();
  if (empCount === 0) {
    await prisma.employee.createMany({
      data: [
        { id: 'emp-001', name: 'Raj Patel',      email: 'raj.patel@acmetech.com',      department: 'Engineering', role: 'Software Engineer',    status: 'Active',   systemRole: 'EMPLOYEE' },
        { id: 'emp-002', name: 'Sarah Johnson',  email: 'sarah.j@acmetech.com',        department: 'Design',      role: 'Product Designer',      status: 'Active',   systemRole: 'EMPLOYEE' },
        { id: 'emp-003', name: 'Mike Chen',      email: 'mike.chen@acmetech.com',      department: 'Engineering', role: 'DevOps Engineer',        status: 'Active',   systemRole: 'EMPLOYEE' },
        { id: 'emp-004', name: 'Emma Williams',  email: 'emma.w@acmetech.com',         department: 'HR',          role: 'HR Manager',             status: 'Active',   systemRole: 'EMPLOYEE' },
        { id: 'emp-005', name: 'David Kumar',    email: 'david.k@acmetech.com',        department: 'Engineering', role: 'Backend Developer',      status: 'Active',   systemRole: 'EMPLOYEE' },
        { id: 'emp-006', name: 'Lisa Park',      email: 'lisa.park@acmetech.com',      department: 'Finance',     role: 'Finance Manager',        status: 'Active',   systemRole: 'EMPLOYEE' },
        { id: 'emp-007', name: 'James Wilson',   email: 'james.w@acmetech.com',        department: 'Engineering', role: 'Frontend Developer',     status: 'Active',   systemRole: 'EMPLOYEE' },
        { id: 'emp-008', name: 'Priya Sharma',   email: 'priya.s@acmetech.com',        department: 'Design',      role: 'UX Researcher',          status: 'On Leave', systemRole: 'EMPLOYEE' },
        { id: 'emp-009', name: 'Tom Anderson',   email: 'tom.anderson@acmetech.com',   department: 'IT',          role: 'IT Support Specialist',  status: 'Active',   systemRole: 'IT_SUPPORT' },
        { id: 'emp-010', name: 'Alex Martinez',  email: 'alex.m@acmetech.com',         department: 'Engineering', role: 'QA Engineer',            status: 'Active',   systemRole: 'EMPLOYEE' },
      ]
    });
  }

  // ── 2. ASSETS ─────────────────────────────────────────────
  const assetCount = await prisma.asset.count();
  if (assetCount === 0) {
    await prisma.asset.createMany({
      data: [
        { id: 'ast-001', name: 'MacBook Pro 14" M3',       assetTag: 'ACM-LAP-001', serialNumber: 'C02XG2ABMD6R', category: 'LAPTOP',      status: 'ASSIGNED',   location: 'New York HQ',      employeeId: 'emp-001', warrantyExpiry: new Date('2026-12-31') },
        { id: 'ast-002', name: 'Dell XPS 15 9530',          assetTag: 'ACM-LAP-002', serialNumber: 'DXPS15-8823K', category: 'LAPTOP',      status: 'ASSIGNED',   location: 'New York HQ',      employeeId: 'emp-002', warrantyExpiry: new Date('2025-08-15') },
        { id: 'ast-003', name: 'ThinkPad X1 Carbon Gen 11', assetTag: 'ACM-LAP-003', serialNumber: 'TPXC11-9912A', category: 'LAPTOP',      status: 'ASSIGNED',   location: 'London Office',    employeeId: 'emp-003', warrantyExpiry: new Date('2026-03-20') },
        { id: 'ast-004', name: 'MacBook Air M2',             assetTag: 'ACM-LAP-004', serialNumber: 'C02YK0ABMD6T', category: 'LAPTOP',      status: 'AVAILABLE',  location: 'New York HQ',      warrantyExpiry: new Date('2027-01-15') },
        { id: 'ast-005', name: 'HP EliteBook 840 G10',       assetTag: 'ACM-LAP-005', serialNumber: 'HPEB840-4421', category: 'LAPTOP',      status: 'AVAILABLE',  location: 'Bangalore Office', warrantyExpiry: new Date('2026-06-30') },
        { id: 'ast-006', name: 'Dell UltraSharp 27" 4K',    assetTag: 'ACM-MON-001', serialNumber: 'DLUS27-1192B', category: 'DESKTOP',     status: 'ASSIGNED',   location: 'New York HQ',      employeeId: 'emp-004' },
        { id: 'ast-007', name: 'LG 32" 4K UHD Monitor',     assetTag: 'ACM-MON-002', serialNumber: 'LG32UK-8821',  category: 'DESKTOP',     status: 'AVAILABLE',  location: 'London Office' },
        { id: 'ast-008', name: 'Samsung 24" FHD Monitor',   assetTag: 'ACM-MON-003', serialNumber: 'SMNG24-3312', category: 'DESKTOP',     status: 'IN_REPAIR',  location: 'IT Storage' },
        { id: 'ast-009', name: 'iPhone 15 Pro',              assetTag: 'ACM-MOB-001', serialNumber: 'IP15P-77231A', category: 'MOBILE',      status: 'ASSIGNED',   location: 'New York HQ',      employeeId: 'emp-005' },
        { id: 'ast-010', name: 'Samsung Galaxy S24 Ultra',   assetTag: 'ACM-MOB-002', serialNumber: 'SGS24-6612C',  category: 'MOBILE',      status: 'ASSIGNED',   location: 'London Office',    employeeId: 'emp-006' },
        { id: 'ast-011', name: 'Google Pixel 8 Pro',         assetTag: 'ACM-MOB-003', serialNumber: 'GPX8P-4421B',  category: 'MOBILE',      status: 'AVAILABLE',  location: 'IT Storage' },
        { id: 'ast-012', name: 'iPad Pro 12.9" M2',          assetTag: 'ACM-TAB-001', serialNumber: 'IPADP-9921X',  category: 'MOBILE',      status: 'ASSIGNED',   location: 'New York HQ',      employeeId: 'emp-007' },
        { id: 'ast-013', name: 'HP LaserJet Pro M404dn',     assetTag: 'ACM-PRN-001', serialNumber: 'HPLJ-5521PR',  category: 'PRINTER',     status: 'IN_REPAIR',  location: 'Floor 3' },
        { id: 'ast-014', name: 'Epson WorkForce Pro WF-7840',assetTag: 'ACM-PRN-002', serialNumber: 'EPWF-8812PR',  category: 'PRINTER',     status: 'AVAILABLE',  location: 'Floor 1' },
        { id: 'ast-015', name: 'Dell PowerEdge R750',         assetTag: 'ACM-SRV-001', serialNumber: 'DLPE-R750-01', category: 'SERVER',      status: 'AVAILABLE',  location: 'Server Room' },
        { id: 'ast-016', name: 'Cisco Catalyst 2960-X',       assetTag: 'ACM-NET-001', serialNumber: 'CISCO-CAT-01', category: 'NETWORKING',  status: 'AVAILABLE',  location: 'Server Room' },
        { id: 'ast-017', name: 'MacBook Pro 16" Intel 2019',  assetTag: 'ACM-LAP-006', serialNumber: 'C02ZDOLD9999', category: 'LAPTOP',      status: 'RETIRED',    location: 'Storage' },
        { id: 'ast-018', name: 'Logitech MX Keys Keyboard',   assetTag: 'ACM-PER-001', serialNumber: 'LOGI-MXK-221', category: 'PERIPHERAL',  status: 'AVAILABLE',  location: 'IT Storage' },
      ]
    });
  }

  // ── 3. SOFTWARE LICENSES ──────────────────────────────────
  const swCount = await prisma.softwareLicense.count();
  if (swCount === 0) {
    await prisma.softwareLicense.createMany({
      data: [
        { name: 'Microsoft 365 Business', publisher: 'Microsoft',  licenseKey: 'M365-XXXX-XXXX-1001', seatsTotal: 50, seatsAllocated: 47, status: 'ACTIVE',   expiryDate: new Date('2025-12-31') },
        { name: 'Adobe Creative Cloud',   publisher: 'Adobe',       licenseKey: 'ADCC-XXXX-XXXX-2002', seatsTotal: 10, seatsAllocated: 10, status: 'ACTIVE',   expiryDate: new Date('2025-09-30') },
        { name: 'GitHub Enterprise',      publisher: 'GitHub',      licenseKey: 'GHEP-XXXX-XXXX-3003', seatsTotal: 25, seatsAllocated: 18, status: 'ACTIVE',   expiryDate: new Date('2026-01-15') },
        { name: 'Slack Business+',        publisher: 'Salesforce',  licenseKey: 'SLBP-XXXX-XXXX-4004', seatsTotal: 50, seatsAllocated: 45, status: 'ACTIVE',   expiryDate: new Date('2025-11-30') },
        { name: 'Figma Professional',     publisher: 'Figma Inc.',  licenseKey: 'FIGP-XXXX-XXXX-5005', seatsTotal: 5,  seatsAllocated: 5,  status: 'ACTIVE',   expiryDate: new Date('2025-10-15') },
        { name: 'Zoom Pro',               publisher: 'Zoom',        licenseKey: 'ZMPRO-XXXX-XXXX-6006',seatsTotal: 20, seatsAllocated: 12, status: 'EXPIRED',  expiryDate: new Date('2024-06-30') },
      ]
    });
  }

  // ── 4. VENDORS ────────────────────────────────────────────
  const vendorCount = await prisma.vendor.count();
  if (vendorCount === 0) {
    await prisma.vendor.createMany({
      data: [
        { name: 'Apple Inc.',         contactName: 'Tim Retail',    email: 'enterprise@apple.com',       phone: '+1-800-275-2273', status: 'ACTIVE'   },
        { name: 'Dell Technologies',  contactName: 'Mark Sullivan',  email: 'enterprise@dell.com',        phone: '+1-800-289-3355', status: 'ACTIVE'   },
        { name: 'Microsoft Corp.',    contactName: 'Satya Sales',    email: 'licensing@microsoft.com',    phone: '+1-800-642-7676', status: 'ACTIVE'   },
        { name: 'Logitech',           contactName: 'Anne Dubois',    email: 'b2b@logitech.com',           phone: '+1-646-454-3200', status: 'ACTIVE'   },
        { name: 'HP Inc.',            contactName: 'Sandra Brown',   email: 'enterprise@hp.com',          phone: '+1-800-752-0900', status: 'INACTIVE' },
      ]
    });
  }

  // ── 5. CONSUMABLES ────────────────────────────────────────
  const consCount = await prisma.consumable.count();
  if (consCount === 0) {
    await prisma.consumable.createMany({
      data: [
        { name: 'A4 Paper Reams (500 sheets)', category: 'Office Supplies', quantity: 45, reorderPoint: 20, cost: 5.99  },
        { name: 'HP Ink Cartridge (Black)',     category: 'Printer Supplies', quantity: 4,  reorderPoint: 10, cost: 24.99 },
        { name: 'USB-C to USB-A Cable 2m',      category: 'Cables',          quantity: 23, reorderPoint: 15, cost: 12.99 },
        { name: 'AA Batteries (Pack of 4)',      category: 'Electronics',     quantity: 6,  reorderPoint: 10, cost: 3.49  },
        { name: 'Screen Cleaning Wipes',         category: 'Office Supplies', quantity: 50, reorderPoint: 25, cost: 8.99  },
        { name: 'Cat6 Ethernet Cable 5m',        category: 'Cables',          quantity: 12, reorderPoint: 8,  cost: 9.99  },
      ]
    });
  }

  // ── 6. PURCHASE ORDERS ────────────────────────────────────
  const poCount = await prisma.purchaseOrder.count();
  if (poCount === 0) {
    await prisma.purchaseOrder.createMany({
      data: [
        { poNumber: 'PO-2024-001', vendorName: 'Dell Technologies', status: 'DELIVERED',  totalAmount: 4500.00,  orderDate: new Date('2024-01-15') },
        { poNumber: 'PO-2024-002', vendorName: 'Apple Inc.',         status: 'APPROVED',   totalAmount: 12000.00, orderDate: new Date('2024-03-01') },
        { poNumber: 'PO-2024-003', vendorName: 'Logitech',           status: 'PENDING',    totalAmount: 850.00,   orderDate: new Date('2024-06-10') },
        { poNumber: 'PO-2024-004', vendorName: 'Microsoft Corp.',    status: 'DELIVERED',  totalAmount: 2400.00,  orderDate: new Date('2024-02-20') },
        { poNumber: 'PO-2024-005', vendorName: 'HP Inc.',            status: 'CANCELLED',  totalAmount: 3200.00,  orderDate: new Date('2024-04-05') },
      ]
    });
  }

  // ── 7. LOCATIONS ──────────────────────────────────────────
  const locCount = await prisma.location.count();
  if (locCount === 0) {
    await prisma.location.createMany({
      data: [
        { name: 'New York HQ',       address: '350 Fifth Avenue',   city: 'New York',   state: 'NY',  zip: '10118', status: 'ACTIVE'   },
        { name: 'London Office',     address: '30 St Mary Axe',     city: 'London',     state: 'ENG', zip: 'EC3A 8BF', status: 'ACTIVE' },
        { name: 'Bangalore Office',  address: '1 MG Road, Unit 12', city: 'Bangalore',  state: 'KA',  zip: '560001',status: 'ACTIVE'   },
        { name: 'Remote / WFH',      address: 'N/A',                city: 'Various',    state: 'N/A', zip: 'N/A',   status: 'ACTIVE'   },
      ]
    });
  }

  // ── 8. MAINTENANCE SCHEDULES ──────────────────────────────
  const schedCount = await prisma.maintenanceSchedule.count();
  if (schedCount === 0) {
    await prisma.maintenanceSchedule.createMany({
      data: [
        { title: 'Quarterly Laptop Health Check',  description: 'Full diagnostic on all laptops — battery, storage, OS updates.',    frequency: 'QUARTERLY', nextDueDate: new Date('2025-09-01'), status: 'ACTIVE'  },
        { title: 'Monthly Printer Service',         description: 'Clean print heads, check toner levels, test print quality.',         frequency: 'MONTHLY',   nextDueDate: new Date('2025-08-20'), status: 'ACTIVE'  },
        { title: 'Annual Server Audit',             description: 'Full hardware and software audit of all server infrastructure.',      frequency: 'ANNUALLY',  nextDueDate: new Date('2025-12-01'), status: 'ACTIVE'  },
        { title: 'Weekly Backup Verification',      description: 'Verify all automated backups completed successfully overnight.',      frequency: 'WEEKLY',    nextDueDate: new Date('2025-08-15'), status: 'ACTIVE'  },
        { title: 'Bi-Annual Software License Audit',description: 'Reconcile software seat usage vs. allocated licenses across teams.', frequency: 'ANNUALLY',  nextDueDate: new Date('2026-01-15'), status: 'PAUSED'  },
      ]
    });
  }

  // ── 9. APPROVAL REQUESTS ──────────────────────────────────
  const approvalCount = await prisma.approvalRequest.count();
  if (approvalCount === 0) {
    await prisma.approvalRequest.createMany({
      data: [
        { title: 'New MacBook Pro Request',      requestorName: 'Raj Patel',     requestedItem: 'MacBook Pro 16" M3',    status: 'PENDING',  comments: 'Current laptop is 4 years old and struggling with dev environments.' },
        { title: 'Additional Monitor Approval',  requestorName: 'Sarah Johnson', requestedItem: 'Dell UltraSharp 27"',   status: 'APPROVED', comments: 'Approved — improves design productivity significantly.' },
        { title: 'Standing Desk Request',        requestorName: 'Emma Williams', requestedItem: 'Ergonomic Standing Desk',status: 'REJECTED', comments: 'Outside IT asset scope. Please raise with Facilities team.' },
        { title: 'iPad for Field Visits',        requestorName: 'Lisa Park',     requestedItem: 'iPad Pro 11" M4',       status: 'PENDING',  comments: 'Required for client presentations and field data collection.' },
        { title: 'Adobe License Expansion',      requestorName: 'Priya Sharma',  requestedItem: 'Adobe CC — 2 extra seats',status: 'APPROVED',comments: 'Approved — all existing seats are in use.' },
        { title: 'Noise-Cancelling Headset',     requestorName: 'James Wilson',  requestedItem: 'Sony WH-1000XM5',       status: 'PENDING',  comments: 'Open office environment is affecting concentration.' },
      ]
    });
  }

  // ── 10. HELPDESK TICKETS (full workflow demo) ─────────────
  const issueCount = await prisma.issueTicket.count();
  if (issueCount === 0) {
    await prisma.issueTicket.createMany({
      data: [
        {
          title: 'Laptop keyboard not responding',
          description: 'Several keys on my laptop keyboard have stopped working — specifically R, T, and Y. Tried restarting but issue persists.',
          priority: 'HIGH', status: 'OPEN',
          assetId: 'ast-001', employeeId: 'emp-001'
        },
        {
          title: 'Screen flickering when on battery',
          description: 'The screen flickers intermittently whenever the laptop is unplugged from power. Only happens on battery mode.',
          priority: 'MEDIUM', status: 'ACCEPTED',
          assetId: 'ast-002', employeeId: 'emp-002'
        },
        {
          title: 'Unable to connect to company VPN',
          description: 'Cannot connect to the Bangalore VPN endpoint since yesterday. Error: "Authentication timeout". Other office VPNs work fine.',
          priority: 'CRITICAL', status: 'ASSIGNED',
          techNote: 'Check VPN server certificate on Bangalore endpoint — may have expired. Coordinate with network team. Asset location: London Office.',
          assetId: 'ast-003', employeeId: 'emp-003'
        },
        {
          title: 'HP Printer offline — Floor 3',
          description: 'The HP LaserJet on Floor 3 shows "Offline" on all workstations. Print jobs are queuing but not printing.',
          priority: 'HIGH', status: 'IN_PROGRESS',
          techNote: 'Printer has paper jam in rear tray and low toner. Ordered replacement cartridges.',
          assetId: 'ast-013', employeeId: 'emp-004'
        },
        {
          title: 'iPhone battery draining within 3 hours',
          description: 'Company iPhone battery drains to 0% in under 3 hours with normal usage. Battery health shows 71% in settings.',
          priority: 'MEDIUM', status: 'RESOLVED',
          techNote: 'Battery health below 80% threshold — eligible for replacement.',
          resolvedNote: 'Battery replaced at authorized Apple service center. Device returned to employee. New battery health: 100%.',
          assetId: 'ast-009', employeeId: 'emp-005'
        },
        {
          title: 'Mouse cursor jumping randomly',
          description: 'Mouse.',
          priority: 'LOW', status: 'REJECTED',
          rejectionReason: 'Insufficient information provided. Please resubmit with: asset tag, operating system, and a detailed description of when the issue occurs.',
          assetId: 'ast-018', employeeId: 'emp-007'
        },
      ]
    });
  }

  // ── 11. AUDIT LOGS (Activity Chart Data) ──────────────────
  const logCount = await prisma.auditLog.count();
  if (logCount === 0) {
    const today = new Date();
    const d1 = new Date(today); d1.setDate(today.getDate() - 1);
    const d2 = new Date(today); d2.setDate(today.getDate() - 2);
    const d3 = new Date(today); d3.setDate(today.getDate() - 3);
    const d4 = new Date(today); d4.setDate(today.getDate() - 4);
    const d5 = new Date(today); d5.setDate(today.getDate() - 5);

    await prisma.auditLog.createMany({
      data: [
        // ASSIGNS
        { action: 'ASSIGN', performedBy: 'System', assetId: 'ast-001', timestamp: d1 },
        { action: 'ASSIGN', performedBy: 'System', assetId: 'ast-002', timestamp: d1 },
        { action: 'ASSIGN', performedBy: 'System', assetId: 'ast-003', timestamp: d2 },
        { action: 'ASSIGN', performedBy: 'System', assetId: 'ast-006', timestamp: d3 },
        { action: 'ASSIGN', performedBy: 'System', assetId: 'ast-009', timestamp: d4 },
        { action: 'ASSIGN', performedBy: 'System', assetId: 'ast-010', timestamp: d4 },
        { action: 'ASSIGN', performedBy: 'System', assetId: 'ast-012', timestamp: d5 },
        // UNASSIGNS (Returns)
        { action: 'UNASSIGN', performedBy: 'System', assetId: 'ast-004', timestamp: d1 },
        { action: 'UNASSIGN', performedBy: 'System', assetId: 'ast-005', timestamp: d2 },
        { action: 'UNASSIGN', performedBy: 'System', assetId: 'ast-007', timestamp: d3 },
        { action: 'UNASSIGN', performedBy: 'System', assetId: 'ast-008', timestamp: d5 },
        { action: 'UNASSIGN', performedBy: 'System', assetId: 'ast-011', timestamp: d5 },
      ]
    });
  }

  console.log('✅ Database seeded with Acme Technologies mock data.');
}
seedDatabase();

// 1. GET /api/assets/dashboard
app.get('/api/assets/dashboard', async (req, res) => {
  try {
    const [available, assigned, inRepair, retired, total] = await Promise.all([
      prisma.asset.count({ where: { status: 'AVAILABLE' } }),
      prisma.asset.count({ where: { status: 'ASSIGNED' } }),
      prisma.asset.count({ where: { status: 'IN_REPAIR' } }),
      prisma.asset.count({ where: { status: 'RETIRED' } }),
      prisma.asset.count()
    ]);

    // 1. Category Data
    const categoryGroup = await prisma.asset.groupBy({
      by: ['category'],
      _count: { category: true }
    });
    
    const categoryColors = {
      'LAPTOP': '#4f46e5',
      'DESKTOP': '#06b6d4',
      'MONITOR': '#8b5cf6',
      'SERVER': '#f59e0b',
      'PERIPHERAL': '#ec4899',
      'OTHER': '#64748b'
    };

    const categoryData = categoryGroup.map(c => ({
      name: c.category.charAt(0) + c.category.slice(1).toLowerCase(), // Capitalize
      value: c._count.category,
      color: categoryColors[c.category] || categoryColors['OTHER']
    }));

    // 2. Activity Data (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await prisma.auditLog.findMany({
      where: {
        timestamp: { gte: sevenDaysAgo },
        action: { in: ['ASSIGN', 'UNASSIGN'] }
      }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activityMap = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      // Use date string as key to handle duplicate day names if spanning > 1 week (though it's only 7 days)
      const dateKey = d.toISOString().split('T')[0];
      activityMap[dateKey] = { name: dayName, assignments: 0, returns: 0, date: dateKey };
    }

    // Populate data
    logs.forEach(log => {
      const dateKey = log.timestamp.toISOString().split('T')[0];
      if (activityMap[dateKey]) {
        if (log.action === 'ASSIGN') {
          activityMap[dateKey].assignments += 1;
        } else if (log.action === 'UNASSIGN') {
          activityMap[dateKey].returns += 1;
        }
      }
    });

    // Sort by date and map to array
    const activityData = Object.values(activityMap).sort((a, b) => a.date.localeCompare(b.date));

    const metrics = { 
      AVAILABLE: available, 
      ASSIGNED: assigned, 
      IN_REPAIR: inRepair, 
      RETIRED: retired, 
      TOTAL: total,
      categoryData,
      activityData
    };
    
    res.json({ success: true, message: "Metrics retrieved successfully", data: metrics });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// EXPORTING ENGINE MODULE
// ==========================================

// GET /api/reports/assets/csv
app.get('/api/reports/assets/csv', async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (assets.length === 0) {
      return res.status(404).send('No assets found');
    }

    // Define CSV Headers
    const headers = ['ID,Asset_Tag,Name,Category,Status,Location,Warranty_Expiry,Created_At\n'];
    
    // Map data to CSV rows
    const rows = assets.map(a => {
      // Escape commas and quotes for CSV format
      const escapeCSV = (str) => {
        if (!str) return '""';
        const stringified = String(str);
        if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
          return `"${stringified.replace(/"/g, '""')}"`;
        }
        return stringified;
      };

      return [
        escapeCSV(a.id),
        escapeCSV(a.assetTag),
        escapeCSV(a.name),
        escapeCSV(a.category),
        escapeCSV(a.status),
        escapeCSV(a.location),
        escapeCSV(a.warrantyExpiry ? new Date(a.warrantyExpiry).toISOString().split('T')[0] : 'N/A'),
        escapeCSV(new Date(a.createdAt).toISOString())
      ].join(',');
    });

    const csvContent = headers.concat(rows).join('\n');

    // Set headers to trigger file download in browser
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="IT_Assets_Inventory_Report.csv"');
    
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/assets/import
app.post('/api/assets/import', async (req, res) => {
  try {
    const { assets } = req.body;
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or empty asset data' });
    }

    // Clean and validate data before insert
    const validAssets = assets.map(a => ({
      name: a.name || 'Imported Asset',
      assetTag: a.assetTag || `IMP-${Math.floor(Math.random() * 10000)}`,
      category: a.category || 'OTHER',
      status: a.status || 'AVAILABLE',
      location: a.location || 'HQ',
    }));

    // Bulk insert using Prisma
    const result = await prisma.asset.createMany({
      data: validAssets,
      skipDuplicates: true // Will skip if assetTag is duplicated assuming it's unique
    });

    res.status(201).json({ success: true, count: result.count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/employees
app.get('/api/employees', async (req, res) => {
  const employees = await prisma.employee.findMany();
  res.json({ success: true, message: "Employees retrieved successfully", data: employees });
});

// POST /api/employees
app.post('/api/employees', async (req, res) => {
  const newEmp = await prisma.employee.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      department: req.body.department,
      role: req.body.role,
      status: 'Active'
    }
  });
  res.status(201).json({ success: true, message: "Employee created", data: newEmp });
});

// 2. GET /api/assets
app.get('/api/assets', async (req, res) => {
  const assets = await prisma.asset.findMany();
  // We need to inject the currentUser logic if assigned
  const enhancedAssets = await Promise.all(assets.map(async asset => {
    if (asset.status === 'ASSIGNED' && asset.employeeId) {
      const emp = await prisma.employee.findUnique({ where: { id: asset.employeeId } });
      return { ...asset, currentUser: emp ? emp.name : null };
    }
    return { ...asset, currentUser: null };
  }));
  res.json({ success: true, data: enhancedAssets });
});

// GET /api/assets/warranty-alerts
app.get('/api/assets/warranty-alerts', async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const now = new Date();

    const alerts = await prisma.asset.findMany({
      where: {
        warrantyExpiry: {
          not: null,
          gte: now,
          lte: thirtyDaysFromNow
        }
      },
      orderBy: { warrantyExpiry: 'asc' }
    });

    const expired = await prisma.asset.findMany({
      where: {
        warrantyExpiry: {
          not: null,
          lt: now
        }
      },
      orderBy: { warrantyExpiry: 'desc' },
      take: 10
    });

    res.json({ success: true, data: { expiringSoon: alerts, expired: expired } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. GET /api/assets/:id
app.get('/api/assets/:id', async (req, res) => {
  const asset = await prisma.asset.findUnique({
    where: { id: req.params.id },
    include: { employee: true }
  });
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  asset.currentUser = asset.employee ? asset.employee.name : null;
  res.json(asset);
});

// 4. GET /api/assets/:id/logs
app.get('/api/assets/:id/logs', async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    where: { assetId: req.params.id },
    orderBy: { timestamp: 'desc' }
  });
  res.json(logs);
});

// 5. POST /api/assets
app.post('/api/assets', async (req, res) => {
  try {
    const { name, category, assetTag, serialNumber, location, warrantyExpiry } = req.body;
    const newAsset = await prisma.asset.create({
      data: {
        name,
        category,
        assetTag,
        serialNumber,
        location,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        status: 'AVAILABLE'
      }
    });
    
    await prisma.auditLog.create({
      data: {
        action: 'CREATED',
        performedBy: 'SYSTEM',
        details: 'Asset registered in inventory',
        assetId: newAsset.id
      }
    });
    
    res.status(201).json(newAsset);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. PUT /api/assets/:id/assign (Check-Out)
app.put('/api/assets/:id/assign', async (req, res) => {
  const { employeeId, performedBy = 'Admin' } = req.body;
  const asset = await prisma.asset.findUnique({ where: { id: req.params.id } });
  
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  if (asset.status !== 'AVAILABLE') return res.status(409).json({ error: 'Asset is not available' });
  
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) return res.status(404).json({ error: 'Employee not found' });
  
  const updatedAsset = await prisma.asset.update({
    where: { id: req.params.id },
    data: { 
      status: 'ASSIGNED',
      employeeId: employeeId
    }
  });
  
  await prisma.auditLog.create({
    data: {
      action: 'CHECK_OUT',
      performedBy: performedBy,
      details: `Asset checked out to ${employee.name}`,
      assetId: asset.id
    }
  });
  
  // Fire email asynchronously (does not block the response)
  const emailHtml = `
    <h2>Asset Assignment Notification</h2>
    <p>Hello ${employee.name},</p>
    <p>A new asset has been assigned to you:</p>
    <ul>
      <li><strong>Asset Tag:</strong> ${asset.assetTag}</li>
      <li><strong>Name:</strong> ${asset.name}</li>
      <li><strong>Category:</strong> ${asset.category}</li>
    </ul>
    <p>Please log in to the ITAM portal to view more details.</p>
  `;
  emailService.sendNotificationEmail(
    employee.email, 
    "New Asset Assigned - ITAM", 
    emailHtml
  );

  res.json(updatedAsset);
});

// Check-In Asset
app.put('/api/assets/:id/checkin', async (req, res) => {
  const { performedBy = 'Admin', notes = '' } = req.body;
  const asset = await prisma.asset.findUnique({ 
    where: { id: req.params.id },
    include: { employee: true }
  });
  
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  if (asset.status !== 'ASSIGNED') return res.status(409).json({ error: 'Asset is not assigned' });
  
  const employeeName = asset.employee ? asset.employee.name : 'Unknown';
  
  const updatedAsset = await prisma.asset.update({
    where: { id: req.params.id },
    data: { 
      status: 'AVAILABLE',
      employeeId: null
    }
  });
  
  await prisma.auditLog.create({
    data: {
      action: 'CHECK_IN',
      performedBy: performedBy,
      details: `Asset checked in from ${employeeName}${notes ? '. Notes: ' + notes : ''}`,
      assetId: asset.id
    }
  });
  
  res.json(updatedAsset);
});

// ==========================================
// SOFTWARE LICENSES MODULE
// ==========================================

// GET /api/software
app.get('/api/software', async (req, res) => {
  try {
    const licenses = await prisma.softwareLicense.findMany();
    res.json({ success: true, data: licenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/software
app.post('/api/software', async (req, res) => {
  try {
    const { name, publisher, licenseKey, seatsTotal, expiryDate } = req.body;
    const newLicense = await prisma.softwareLicense.create({
      data: {
        name,
        publisher,
        licenseKey,
        seatsTotal: parseInt(seatsTotal) || 1,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });
    res.status(201).json(newLicense);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/software/:id
app.put('/api/software/:id', async (req, res) => {
  try {
    const { name, publisher, licenseKey, seatsTotal, seatsAllocated, expiryDate, status } = req.body;
    const updated = await prisma.softwareLicense.update({
      where: { id: req.params.id },
      data: {
        name,
        publisher,
        licenseKey,
        seatsTotal: seatsTotal !== undefined ? parseInt(seatsTotal) : undefined,
        seatsAllocated: seatsAllocated !== undefined ? parseInt(seatsAllocated) : undefined,
        status,
        expiryDate: expiryDate !== undefined ? (expiryDate ? new Date(expiryDate) : null) : undefined
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/software/:id
app.delete('/api/software/:id', async (req, res) => {
  try {
    await prisma.softwareLicense.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'License deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// VENDORS MODULE
// ==========================================

// GET /api/vendors
app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany();
    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/vendors
app.post('/api/vendors', async (req, res) => {
  try {
    const { name, contactName, email, phone } = req.body;
    const newVendor = await prisma.vendor.create({
      data: { name, contactName, email, phone }
    });
    res.status(201).json(newVendor);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/vendors/:id
app.put('/api/vendors/:id', async (req, res) => {
  try {
    const { name, contactName, email, phone, status } = req.body;
    const updated = await prisma.vendor.update({
      where: { id: req.params.id },
      data: { name, contactName, email, phone, status }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/vendors/:id
app.delete('/api/vendors/:id', async (req, res) => {
  try {
    await prisma.vendor.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Vendor deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// CONSUMABLES MODULE
// ==========================================

// GET /api/consumables
app.get('/api/consumables', async (req, res) => {
  try {
    const consumables = await prisma.consumable.findMany();
    res.json({ success: true, data: consumables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/consumables
app.post('/api/consumables', async (req, res) => {
  try {
    const { name, category, quantity, reorderPoint, cost } = req.body;
    const newItem = await prisma.consumable.create({
      data: {
        name,
        category,
        quantity: parseInt(quantity) || 0,
        reorderPoint: parseInt(reorderPoint) || 5,
        cost: cost ? parseFloat(cost) : null
      }
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/consumables/:id
app.put('/api/consumables/:id', async (req, res) => {
  try {
    const { name, category, quantity, reorderPoint, cost } = req.body;
    const updated = await prisma.consumable.update({
      where: { id: req.params.id },
      data: {
        name,
        category,
        quantity: quantity !== undefined ? parseInt(quantity) : undefined,
        reorderPoint: reorderPoint !== undefined ? parseInt(reorderPoint) : undefined,
        cost: cost !== undefined ? (cost ? parseFloat(cost) : null) : undefined
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/consumables/:id
app.delete('/api/consumables/:id', async (req, res) => {
  try {
    await prisma.consumable.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Consumable deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// PURCHASE ORDERS MODULE
// ==========================================

// GET /api/purchase-orders
app.get('/api/purchase-orders', async (req, res) => {
  try {
    const pos = await prisma.purchaseOrder.findMany();
    res.json({ success: true, data: pos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/purchase-orders
app.post('/api/purchase-orders', async (req, res) => {
  try {
    const { poNumber, vendorName, status, totalAmount, orderDate } = req.body;
    const newPO = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorName,
        status: status || 'PENDING',
        totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
        orderDate: orderDate ? new Date(orderDate) : null
      }
    });
    res.status(201).json(newPO);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/purchase-orders/:id
app.put('/api/purchase-orders/:id', async (req, res) => {
  try {
    const { poNumber, vendorName, status, totalAmount, orderDate } = req.body;
    const updated = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: {
        poNumber,
        vendorName,
        status,
        totalAmount: totalAmount !== undefined ? parseFloat(totalAmount) : undefined,
        orderDate: orderDate !== undefined ? (orderDate ? new Date(orderDate) : null) : undefined
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/purchase-orders/:id
app.delete('/api/purchase-orders/:id', async (req, res) => {
  try {
    await prisma.purchaseOrder.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'PO deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// LOCATIONS MODULE
// ==========================================

// GET /api/locations
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await prisma.location.findMany();
    res.json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/locations
app.post('/api/locations', async (req, res) => {
  try {
    const { name, address, city, state, zip } = req.body;
    const newLocation = await prisma.location.create({
      data: { name, address, city, state, zip }
    });
    res.status(201).json(newLocation);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/locations/:id
app.put('/api/locations/:id', async (req, res) => {
  try {
    const { name, address, city, state, zip, status } = req.body;
    const updated = await prisma.location.update({
      where: { id: req.params.id },
      data: { name, address, city, state, zip, status }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/locations/:id
app.delete('/api/locations/:id', async (req, res) => {
  try {
    await prisma.location.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Location deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// MAINTENANCE SCHEDULES MODULE
// ==========================================

// GET /api/maintenance-schedules
app.get('/api/maintenance-schedules', async (req, res) => {
  try {
    const schedules = await prisma.maintenanceSchedule.findMany();
    res.json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/maintenance-schedules
app.post('/api/maintenance-schedules', async (req, res) => {
  try {
    const { title, description, frequency, nextDueDate, status } = req.body;
    const newSchedule = await prisma.maintenanceSchedule.create({
      data: {
        title,
        description,
        frequency: frequency || 'MONTHLY',
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        status: status || 'ACTIVE'
      }
    });
    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/maintenance-schedules/:id
app.put('/api/maintenance-schedules/:id', async (req, res) => {
  try {
    const { title, description, frequency, nextDueDate, status } = req.body;
    const updated = await prisma.maintenanceSchedule.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        frequency,
        nextDueDate: nextDueDate !== undefined ? (nextDueDate ? new Date(nextDueDate) : null) : undefined,
        status
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/maintenance-schedules/:id
app.delete('/api/maintenance-schedules/:id', async (req, res) => {
  try {
    await prisma.maintenanceSchedule.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// APPROVAL WORKFLOWS MODULE
// ==========================================

// GET /api/approvals
app.get('/api/approvals', async (req, res) => {
  try {
    const approvals = await prisma.approvalRequest.findMany();
    res.json({ success: true, data: approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/approvals
app.post('/api/approvals', async (req, res) => {
  try {
    const { title, requestorName, requestedItem, status, comments } = req.body;
    const newApproval = await prisma.approvalRequest.create({
      data: {
        title,
        requestorName,
        requestedItem,
        status: status || 'PENDING',
        comments
      }
    });
    res.status(201).json(newApproval);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/approvals/:id
app.put('/api/approvals/:id', async (req, res) => {
  try {
    const { title, requestorName, requestedItem, status, comments } = req.body;
    const updated = await prisma.approvalRequest.update({
      where: { id: req.params.id },
      data: {
        title,
        requestorName,
        requestedItem,
        status,
        comments
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/approvals/:id
app.delete('/api/approvals/:id', async (req, res) => {
  try {
    await prisma.approvalRequest.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Approval deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// AUDIT LOGS MODULE
// ==========================================

// GET /api/audit-logs
app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' }
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/audit-logs
app.post('/api/audit-logs', async (req, res) => {
  try {
    const { action, entityId, assetId, performedBy, details } = req.body;
    const newLog = await prisma.auditLog.create({
      data: {
        action,
        assetId: assetId || entityId, // Fallback if someone sends entityId
        performedBy: performedBy || "SystemAdmin",
        details
      }
    });
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Edit general asset details
app.put('/api/assets/:id/edit', async (req, res) => {
  const { name, assetTag, category, location, status, warrantyExpiry } = req.body;
  const asset = await prisma.asset.findUnique({ where: { id: req.params.id } });
  if (!asset) return res.status(404).json({ message: 'Asset not found' });
  
  const updatedAsset = await prisma.asset.update({
    where: { id: req.params.id },
    data: { 
      name, assetTag, category, location, status,
      warrantyExpiry: warrantyExpiry !== undefined ? (warrantyExpiry ? new Date(warrantyExpiry) : null) : undefined
    }
  });
  
  await prisma.auditLog.create({
    data: {
      action: 'EDIT',
      performedBy: 'Admin',
      details: `Asset details updated`,
      assetId: asset.id
    }
  });
  
  res.json({ message: 'Asset updated', data: updatedAsset });
});
// 7. PUT /api/assets/:id/status
app.put('/api/assets/:id/status', async (req, res) => {
  const { status, performedBy = 'SYSTEM', notes = '' } = req.body;
  const asset = await prisma.asset.findUnique({ where: { id: req.params.id } });
  
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  
  const oldStatus = asset.status;
  const newStatus = status.toUpperCase();
  
  const data = { status: newStatus };
  if (['AVAILABLE', 'IN_REPAIR', 'RETIRED'].includes(newStatus)) {
    data.employeeId = null; // Unassign employee if not ASSIGNED
  }
  
  const updatedAsset = await prisma.asset.update({
    where: { id: req.params.id },
    data
  });
  
  const logAction = newStatus === 'AVAILABLE' ? 'MARKED_AVAILABLE' : 
                    newStatus === 'IN_REPAIR' ? 'MARKED_REPAIR' : 
                    newStatus === 'RETIRED' ? 'RETIRED' : 'STATUS_CHANGED';
                    
  await prisma.auditLog.create({
    data: {
      action: logAction,
      performedBy: performedBy,
      details: `Status changed from ${oldStatus} to ${newStatus}${notes ? ': ' + notes : ''}`,
      assetId: asset.id
    }
  });
  
  res.json(updatedAsset);
});

// ==========================================
// ISSUE TICKETING MODULE (Helpdesk)
// ==========================================

// 1. GET /api/issues - returns all tickets with asset & employee info
app.get('/api/issues', async (req, res) => {
  try {
    const issues = await prisma.issueTicket.findMany({
      include: { asset: true, employee: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST /api/issues - employee submits a new ticket
app.post('/api/issues', async (req, res) => {
  try {
    const { title, description, priority, assetId, employeeId } = req.body;
    const newIssue = await prisma.issueTicket.create({
      data: { title, description, priority, assetId, employeeId },
      include: { asset: true, employee: true }
    });
    res.status(201).json(newIssue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. PATCH /api/issues/:id/accept - Admin accepts the ticket
app.patch('/api/issues/:id/accept', async (req, res) => {
  try {
    const updated = await prisma.issueTicket.update({
      where: { id: req.params.id },
      data: { status: 'ACCEPTED' },
      include: { asset: true, employee: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. PATCH /api/issues/:id/reject - Admin rejects ticket with reason
app.patch('/api/issues/:id/reject', async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const updated = await prisma.issueTicket.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED', rejectionReason },
      include: { asset: true, employee: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. PATCH /api/issues/:id/forward - Admin forwards ticket to tech team with a note
app.patch('/api/issues/:id/forward', async (req, res) => {
  try {
    const { techNote } = req.body;
    const updated = await prisma.issueTicket.update({
      where: { id: req.params.id },
      data: { status: 'ASSIGNED', techNote },
      include: { asset: true, employee: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. PATCH /api/issues/:id/progress - Tech team marks ticket as In Progress
app.patch('/api/issues/:id/progress', async (req, res) => {
  try {
    const updated = await prisma.issueTicket.update({
      where: { id: req.params.id },
      data: { status: 'IN_PROGRESS' },
      include: { asset: true, employee: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. PATCH /api/issues/:id/resolve - Tech team resolves the ticket
app.patch('/api/issues/:id/resolve', async (req, res) => {
  try {
    const { resolvedNote } = req.body;
    const updated = await prisma.issueTicket.update({
      where: { id: req.params.id },
      data: { status: 'RESOLVED', resolvedNote },
      include: { asset: true, employee: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. PUT /api/issues/:id - generic update (kept for compatibility)
app.put('/api/issues/:id', async (req, res) => {
  try {
    const updated = await prisma.issueTicket.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. DELETE /api/issues/:id - Admin deletes a ticket
app.delete('/api/issues/:id', async (req, res) => {
  try {
    await prisma.issueTicket.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Node.js backend running on http://localhost:${PORT}`));
