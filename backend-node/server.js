const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

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
app.post('/api/auth/login', async (req, res) => {
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
app.use('/api/employees', authMiddleware);

// --- SEED DATABASE ON STARTUP IF EMPTY ---
async function seedDatabase() {
  const empCount = await prisma.employee.count();
  if (empCount === 0) {
    await prisma.employee.createMany({
      data: [
        { name: "John Doe", email: "john@example.com", department: "Engineering", role: "Software Engineer", status: "Active" },
        { name: "Jane Smith", email: "jane@example.com", department: "Design", role: "Product Designer", status: "Active" },
        { name: "Mike Johnson", email: "mike@example.com", department: "HR", role: "HR Manager", status: "Active" },
        { name: "Sarah Williams", email: "sarah@example.com", department: "Engineering", role: "DevOps Engineer", status: "On Leave" },
      ]
    });
  }

  const assetCount = await prisma.asset.count();
  if (assetCount === 0) {
    await prisma.asset.createMany({
      data: [
        { name: "MacBook Pro M3", assetTag: "TAG-2024-001", category: "LAPTOP", status: "AVAILABLE", location: "NY Office", serialNumber: "C02DG543" },
        { name: "Dell XPS 15", assetTag: "TAG-2024-002", category: "LAPTOP", status: "AVAILABLE", location: "London Office", serialNumber: "5KG12" },
        { name: "iPhone 15 Pro", assetTag: "TAG-2024-003", category: "MOBILE", status: "AVAILABLE", location: "NY Office", serialNumber: "F12GH4" },
        { name: "LG UltraFine 5K", assetTag: "TAG-2024-004", category: "DESKTOP", status: "IN_REPAIR", location: "Remote", serialNumber: "LGUF009" }
      ]
    });
  }
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
    const { action, entityType, entityId, userName, details } = req.body;
    const newLog = await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userName,
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

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Node.js backend running on http://localhost:${PORT}`);
});
