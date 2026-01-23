import { PCBRecord } from '../App';
import './Dashboard.css';
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, limitToLast, query } from 'firebase/database';

interface DashboardProps {
  currentPCB: PCBRecord | null;
}

function Dashboard({ currentPCB }: DashboardProps) {
  const [machineAlert, setMachineAlert] = useState<{ defect_type: string, alert_msg: string } | null>(null);
  // --- NEW LOGIC: State for Load Cell Packaging Status ---
  const [isPackageReady, setIsPackageReady] = useState<boolean>(false);

  useEffect(() => {
    const db = getDatabase();
    
    // 1. Existing Logic: Listen for Machine Faults (5 consecutive)
    const alertRef = query(ref(db, 'machine_alerts'), limitToLast(1));
    const unsubscribeAlerts = onValue(alertRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const keys = Object.keys(data);
        const latestAlert = data[keys[0]];
        setMachineAlert(latestAlert);
      } else {
        setMachineAlert(null);
      }
    });

    // 2. NEW LOGIC: Listen for Packaging Status from ESP32/Pi
    const pkgRef = ref(db, 'packaging_status/is_ready');
    const unsubscribePkg = onValue(pkgRef, (snapshot) => {
      const readyStatus = snapshot.val();
      setIsPackageReady(!!readyStatus); // Ensure it's a boolean
    });

    return () => {
      unsubscribeAlerts();
      unsubscribePkg();
    };
  }, []);

  if (!currentPCB) {
    return (
      <div className="dashboard">
        <div className="status-card loading">
          <h2>Initializing System...</h2>
          <p>Waiting for data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <style>
        {`
          @keyframes blink-red {
            0% { opacity: 1; border-color: red; }
            50% { opacity: 0.5; border-color: transparent; }
            100% { opacity: 1; border-color: red; }
          }
          .machine-error-alert {
            animation: blink-red 1s infinite;
            background-color: #fffafa;
            border: 3px solid red;
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 8px;
          }
        `}
      </style>

      <div className="dashboard-header">
        <h2>Packaging Status</h2>
        <div className="live-indicator">
          <span className="pulse"></span>
          LIVE
        </div>
      </div>

      {/* 🔴 ONLY APPEARS IF PI DETECTS 5 CONSECUTIVE DEFECTS */}
      {machineAlert && (
        <div className="status-card defective machine-error-alert">
          <div className="status-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="3">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div className="status-content">
            <h3 style={{ color: 'red', margin: 0 }}>⚠️ CRITICAL MACHINE FAULT</h3>
            <p style={{ fontWeight: 'bold', margin: '5px 0' }}>Line 01: REPEATED FAILURE</p>
            <p style={{ margin: 0 }}>
              Type: <span style={{ color: 'red', fontWeight: 'bold' }}>{machineAlert.defect_type.toUpperCase()}</span>
            </p>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>Triggered after 5 consecutive detections</p>
          </div>
        </div>
      )}

      {/* 🔹 DYNAMIC PACKAGING STATUS (Updates based on Load Cell) */}
      <div className={`status-card ${isPackageReady ? 'normal' : 'defective'}`}>
        <div className="status-icon">
          {isPackageReady ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          )}
        </div>

        <div className="status-content">
          <h3>Packaging Alert</h3>
          <div className={`status-badge ${isPackageReady ? 'normal' : 'defective'}`}>
            {isPackageReady ? 'READY TO PACKAGE' : 'WAITING FOR TARGET WEIGHT'}
          </div>

          <div className="status-details">
            <div className="detail-row">
              <span className="label">Load Cell Status:</span>
              <span className="value">
                {isPackageReady ? 'Target weight reached (Above 38g)' : 'Below threshold (Empty/Filling)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;