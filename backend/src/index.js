const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Models
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Transaction = require('./models/Transaction');
const ServiceRequest = require('./models/ServiceRequest');
const User = require('./models/User');
const SalesLog = require('./models/SalesLog');
const PartLog = require('./models/PartLog');
const Vendor = require('./models/Vendor');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Main Dynamic Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/warehouses', require('./routes/warehouses'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/services', require('./routes/services'));
app.use('/api/partlogs', require('./routes/partlogs'));
app.use('/api/saleslogs', require('./routes/saleslogs'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

async function startServer() {
  try {
    console.log('Connecting to Production MongoDB Atlas Cluster...');
    const mongoURI = 'mongodb://mmaadil_786:aadilarshad1422@ac-uat4jfl-shard-00-00.ocm1whp.mongodb.net:27017,ac-uat4jfl-shard-00-01.ocm1whp.mongodb.net:27017,ac-uat4jfl-shard-00-02.ocm1whp.mongodb.net:27017/ar-associate-erp?ssl=true&replicaSet=atlas-143qko-shard-0&authSource=admin&appName=ar-associate-cluster';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB Atlas successfully!');

    // Check if database is already seeded
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (!adminExists) {
      console.log('First-time setup: Seeding initial data...');
      const p1 = new Product({ name: 'Aquaguard Aura RO+UV', brand: 'Eureka Forbes', price: 16500, category: 'Water Purifier', serialNumber: 'FORBES-1001', quantity: 12, itemType: 'UNIT' });
      const p2 = new Product({ name: 'Ecovacs Deebot N8 PRO', brand: 'Ecovacs', price: 29999, category: 'Vacuum Robot', serialNumber: 'ECO-9921', quantity: 8, itemType: 'UNIT' });
      const s_p1 = new Product({ name: 'RO Filter Membrane', brand: 'Eureka Forbes', price: 1200, category: 'Filter Spares', serialNumber: 'SPARE-001', quantity: 150, itemType: 'SPARE' });
      const s_p2 = new Product({ name: 'Deebot Side Brush (Pair)', brand: 'Ecovacs', price: 450, category: 'Brush Spares', serialNumber: 'SPARE-002', quantity: 95, itemType: 'SPARE' });
      
      await p1.save(); await p2.save(); await s_p1.save(); await s_p2.save();

      const c1 = new Customer({ name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@example.com', address: '123 Bangalore, KA' });
      const c2 = new Customer({ name: 'Priya Patel', phone: '8765432109', email: 'priya@example.com', address: '456 Mumbai, MH' });
      await c1.save(); await c2.save();

      const v1 = new Vendor({ name: 'Global Components Ltd', phone: '080-22334455', email: 'sales@globalcomp.com', address: 'Whitefield, Bangalore', gstNumber: '29AAAAA0000A1Z5' });
      const v2 = new Vendor({ name: 'Eureka Spares Distribution', phone: '011-99887766', email: 'orders@eurekaspares.in', address: 'Industrial Area, New Delhi', gstNumber: '07BBBBB1111B1Z2' });
      await v1.save(); await v2.save();

      const sr1 = new ServiceRequest({ customerId: c1._id, productId: p1._id, description: 'Intermittent leakage from the main tank.', status: 'PENDING', areaSector: 'Sector 15, Urban Area' });
      const sr2 = new ServiceRequest({ customerId: c2._id, productId: p2._id, description: 'Vacuum mapped wrongly, needs resetting.', status: 'IN_PROGRESS', areaSector: 'Downtown Hub', assignedTechnicianName: 'Ravi Verma' });
      await sr1.save(); await sr2.save();
      
      await User.create([
        { name: 'System Admin', username: 'admin', password: 'password123', role: 'ADMIN' },
        { name: 'Vikram Singh', username: 'sales01', password: 'salespassword', role: 'SALESMAN' },
        { name: 'Ravi Verma', username: 'tech01', password: 'techpassword', role: 'TECHNICIAN' },
        { name: 'Aruna Sharma', username: 'staff01', password: 'staffpassword', role: 'STAFF' }
      ]);

      await SalesLog.create([
        { salesPersonName: 'Vikram Singh', unitName: 'Aquaguard Aura', action: 'OUT_FOR_DELIVERY', quantity: 2, syncedFromMobile: true },
        { salesPersonName: 'Vikram Singh', unitName: 'Samsung Jet 75', action: 'OUT_FOR_DELIVERY', quantity: 1, syncedFromMobile: false }
      ]);
      
      await PartLog.create([
        { technicianName: 'Ravi Verma', partName: 'RO Filter Membrane', action: 'ISSUED', quantity: 5, syncedFromMobile: true },
        { technicianName: 'Anil Kumar', partName: 'Eureka Filter Set A', action: 'ISSUED', quantity: 2, syncedFromMobile: true }
      ]);

      await Transaction.create([
        { type: 'ORDER', transactionId: 'SO-00001', customerName: 'Nexus Enterprises', amount: 45000, orderStatus: 'CONFIRMED', invoicedStatus: 'Fully Invoiced', salesmanName: 'Vikram Singh' },
        { type: 'INVOICE', transactionId: 'INV-10045', customerName: 'Nexus Enterprises', amount: 45000, invoiceStatus: 'PAID', balanceDue: 0, relatedOrder: 'SO-00001', salesmanName: 'Vikram Singh' },
        { type: 'INVOICE', transactionId: 'INV-10044', customerName: 'Priya Patel', amount: 8900, invoiceStatus: 'OVERDUE', balanceDue: 8900, salesmanName: 'Vikram Singh' },
        { type: 'PAYMENT', transactionId: 'PAY-8832', customerName: 'Nexus Enterprises', amount: 45000, paymentMode: 'Bank Remittance', referenceInfo: 'Bank Transfer - INV-10045', salesmanName: 'Vikram Singh' }
      ]);
      console.log('Seed data successfully injected!');
    } else {
      console.log('Database already populated. Skipping seed.');
    }

    app.listen(PORT, () => console.log(`Backend fully online on port ${PORT}!`));
  } catch (error) {
    console.error('Failed to start server', error);
  }
}

startServer();
