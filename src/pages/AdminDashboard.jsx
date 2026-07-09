import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Building, 
  BarChart3, 
  Settings, 
  LogOut, 
  Trash2,
  Lock,
  Download
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  // Mock Data
  const stats = [
    { label: "Total Users", value: "12,450", icon: Users },
    { label: "Total Hotels", value: "342", icon: Building },
    { label: "Monthly Revenue", value: "$1.2M", icon: BarChart3 },
    { label: "Active Admins", value: "4", icon: ShieldAlert },
  ];

  const usersList = [
    { id: "U-1001", name: "Alex Johnson", email: "alex@example.com", role: "Customer", status: "Active" },
    { id: "U-1002", name: "Maria Garcia", email: "maria@example.com", role: "Owner", status: "Active" },
    { id: "U-1003", name: "David Smith", email: "david@example.com", role: "Customer", status: "Banned" },
  ];

  const hotelsList = [
    { id: "H-402", name: "Grand Ocean Resort", owner: "Maria Garcia", location: "Maldives", status: "Verified" },
    { id: "H-403", name: "Alpine Ski Lodge", owner: "John Doe", location: "Swiss Alps", status: "Pending Verification" },
  ];

  const reports = [
    { title: "Monthly Financial Summary", date: "June 2024", size: "2.4 MB" },
    { title: "User Activity & Growth", date: "Q2 2024", size: "4.1 MB" },
    { title: "System Error Logs", date: "Last 30 Days", size: "1.2 MB" },
  ];

  return (
    <div className="admin-dashboard">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <ShieldAlert size={28} />
          <span>LuxStay Admin</span>
        </div>
        
        <nav className="admin-nav">
          <div 
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            <span>User Management</span>
          </div>
          <div 
            className={`admin-nav-item ${activeTab === 'hotels' ? 'active' : ''}`}
            onClick={() => setActiveTab('hotels')}
          >
            <Building size={20} />
            <span>Hotel Management</span>
          </div>
          <div 
            className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <BarChart3 size={20} />
            <span>Reports & Analytics</span>
          </div>
          <div className="admin-nav-item" style={{ marginTop: 'auto' }}>
            <Settings size={20} />
            <span>System Settings</span>
          </div>
          <div className="admin-nav-item text-rose-400">
            <LogOut size={20} />
            <span>Sign Out</span>
          </div>
        </nav>
      </aside>

//