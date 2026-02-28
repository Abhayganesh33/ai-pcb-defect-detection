import { useEffect, useState } from 'react';
import './History.css';

/* 🔹 Firebase imports */
import { ref, onValue, remove } from "firebase/database";
import { db } from "../firebase";
import { getStorage, ref as sRef, deleteObject } from "firebase/storage";

interface HistoryItem {
  pcb_image_state?: string;
  defect_name?: string;
  detailed_status?: string;
  timestamp?: string;
  image_url?: string;
}

function History() {
  const [records, setRecords] = useState<HistoryItem[]>([]);
  const storage = getStorage();

  useEffect(() => {
    const historyRef = ref(db, "pcb_inspection");
    onValue(historyRef, (snapshot) => {
      if (!snapshot.exists()) {
        setRecords([]);
        return;
      }

      const data = snapshot.val();
      const list = Object.entries(data).map(([key, value]) => ({
        key,
        ...(value as HistoryItem),
      }));
      setRecords(list.reverse());
    });
  }, []);

  const handleDelete = async (key: string, imageUrl?: string) => {
    try {
      // 🔹 delete image from storage
      if (imageUrl) {
        const imgRef = sRef(storage, imageUrl);
        await deleteObject(imgRef);
      }

      // 🔹 delete record from database
      await remove(ref(db, `pcb_inspection/${key}`));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

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
          {records.map((item: any, index) => {
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

                  {/* 🔴 DELETE BUTTON */}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.key, item.image_url)}
                  >
                    Delete
                  </button>
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
