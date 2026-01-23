import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ServoCalibration from './pages/ServoCalibration';
import './App.css';

/* 🔹 Firebase imports (added) */
import { ref, set } from "firebase/database";
import { db } from "./firebase";

type DefectCategory =
  | 'Normal'
  | 'Mouse_bite'
  | 'Open_circuit'
  | 'Short'
  | 'Spur'
  | 'Spurious_copper';

export interface PCBRecord {
  id: string;
  category: DefectCategory;
  status: 'Normal' | 'Defective';
  timestamp: Date;
}

type Page = 'dashboard' | 'history' | 'servo';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [pcbHistory, setPcbHistory] = useState<PCBRecord[]>([]);
  const [currentPCB, setCurrentPCB] = useState<PCBRecord | null>(null);

  const defectCategories: DefectCategory[] = [
    'Normal',
    'Mouse_bite',
    'Open_circuit',
    'Short',
    'Spur',
    'Spurious_copper'
  ];

  const generateRandomPCB = (): PCBRecord => {
    const category =
      defectCategories[Math.floor(Math.random() * defectCategories.length)];
    const status = category === 'Normal' ? 'Normal' : 'Defective';
    const id = `PCB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      id,
      category,
      status,
      timestamp: new Date()
    };
  };

  useEffect(() => {
    set(ref(db, "test/connection"), {
      status: "connected",
      time: Date.now()
    });
  }, []);

  useEffect(() => {
    const newPCB = generateRandomPCB();
    setCurrentPCB(newPCB);
    setPcbHistory(prev => [newPCB, ...prev].slice(0, 50));

    const interval = setInterval(() => {
      const pcb = generateRandomPCB();
      setCurrentPCB(pcb);
      setPcbHistory(prev => [pcb, ...prev].slice(0, 50));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard currentPCB={currentPCB} />;
      case 'history':
        return <History />;
      case 'servo':
        return <ServoCalibration />;
      default:
        return <Dashboard currentPCB={currentPCB} />;
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>PCB Defect Detection System</h1>
          <span className="nav-subtitle">AI-Powered Quality Control</span>
        </div>

        <div className="nav-links">
          <button
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentPage('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={currentPage === 'history' ? 'active' : ''}
            onClick={() => setCurrentPage('history')}
          >
            History
          </button>
        </div>

        {/* 🔹 SERVO BUTTON (RIGHT CORNER) */}
        <button
          className="servo-icon-btn"
          onClick={() => setCurrentPage('servo')}
          title="Servo Control"
        >
          ⚙️
        </button>
      </nav>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
