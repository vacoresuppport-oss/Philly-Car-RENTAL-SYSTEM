/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LiveMap from './components/LiveMap';
import AddCustomer from './components/AddCustomer';
import FleetInventory from './components/FleetInventory';
import RentalAgreement from './components/RentalAgreement';
import Login from './components/Login';
import { NotificationProvider } from './context/NotificationContext';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeView, setActiveView] = React.useState('dashboard');

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'fleet-map':
        return <LiveMap />;
      case 'contacts-customers':
        return <AddCustomer />;
      case 'fleet-inventory':
        return <FleetInventory />;
      case 'agreement':
        return <RentalAgreement onBack={() => setActiveView('ops-reservations')} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500">
              <span className="text-2xl font-bold italic">?</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">View Under Construction</h2>
              <p className="text-slate-500 text-sm">We are currently building this section of VoltDrive HQ.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans selection:bg-blue-600 selection:text-white">
        <Sidebar activeView={activeView} setView={setActiveView} />
        
        <main className="ml-16 lg:ml-64 min-h-screen transition-all duration-300 flex flex-col h-screen">
          <Header activeView={activeView} />
          
          <div className="flex-1 overflow-auto bg-[#09090b]">
            <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
              {renderView()}
            </div>
          </div>
        </main>

        <div className="fixed inset-0 pointer-events-none opacity-[0.03] contrast-150 brightness-150 z-[100] grain" />
      </div>
    </NotificationProvider>
  );
}

