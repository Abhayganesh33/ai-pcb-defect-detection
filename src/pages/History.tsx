import { useEffect, useState } from 'react';
import './History.css';

/* 🔹 Firebase imports */
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

interface HistoryItem {
  pcb_image_state?: string;
  defect_name?: string;
  detailed_status?: string;
  timestamp?: string;
  image_url?: string;
}

function History() {
  const [records, setRecords] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const historyRef = ref(db, "pcb_inspection");
    onValue(historyRef, (snapshot) => {
      if (!snapshot.exists()) {
        setRecords([]);
        return;
      }

      const data = snapshot.val();
      const list = Object.values(data) as HistoryItem[];
      setRecords(list.reverse()); // latest first
    });
  }, []);

  return (
    <div className="history">
      <div className="history-header">
        <h2>PCB Inspection History</h2>
        <div className="history-stats">
          <span className="stat">
            Total Records: <strong>{records.length}</strong>
          </span>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="no-data">
          <p>No inspection records available</p>
        </div>
      ) : (
        <div className="history-list">
          {records.map((item, index) => {
            const isGood = item.pcb_image_state === "GOOD";

            return (
              <div
                key={index}
                className={`history-card ${isGood ? 'normal' : 'defective'}`}
              >
                <div className="history-info">
                  <h3 className={isGood ? 'normal-text' : 'defective-text'}>
                    {isGood
                      ? 'GOOD PCB'
                      : `DEFECT: ${item.defect_name ?? 'UNKNOWN'}`}
                  </h3>

                  <p>
                    <strong>Status:</strong>{" "}
                    {item.detailed_status ?? item.pcb_image_state ?? 'N/A'}
                  </p>

                  <p>
                    <strong>Time:</strong>{" "}
                    {item.timestamp ?? 'N/A'}
                  </p>

                  {item.image_url && (
                    <a
                      href={item.image_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                      Download Image
                    </a>
                  )}
                </div>

                <div className="history-image">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt="PCB"
                      style={{
                        width: "120px",
                        height: "auto",
                        borderRadius: "6px"
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;
