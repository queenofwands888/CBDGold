import React, { useState } from 'react';
import ClaimManager from './ClaimManager';
import ProductManager from './ProductManager';
import Analytics from './Analytics';
import GovernanceManager from './GovernanceManager';
import AuditLog from './AuditLog';

const AdminDashboard: React.FC = () => {
  const [section, setSection] = useState('claims');
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex space-x-4 mb-6">
        <button className={`btn ${section === 'claims' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSection('claims')}>Prize Claims</button>
        <button className={`btn ${section === 'products' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSection('products')}>Products</button>
        <button className={`btn ${section === 'analytics' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSection('analytics')}>Analytics</button>
        <button className={`btn ${section === 'governance' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSection('governance')}>Governance</button>
        <button className={`btn ${section === 'audit' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSection('audit')}>Audit Log</button>
      </div>
      {section === 'claims' && <ClaimManager />}
      {section === 'products' && <ProductManager />}
      {section === 'analytics' && <Analytics />}
      {section === 'governance' && <GovernanceManager />}
      {section === 'audit' && <AuditLog />}
    </div>
  );
};

export default AdminDashboard;
