import { useState } from "react";
import { ref, set } from "firebase/database";
import { db } from "../firebase";

function ManualOverridePanel() {
  const [selectedDefect, setSelectedDefect] = useState<string>("");
  const [overrideEnabled, setOverrideEnabled] = useState<boolean>(false);

  const defectOptions = [
    "Normal",
    "Short",
    "Open_circuit",
    "Spur",
    "Mouse_bite",
    "Spurious_copper"
  ];

  const applyOverride = async () => {
    if (!selectedDefect) return;

    await set(ref(db, "override/control"), {
      enabled: true,
      selected_defect: selectedDefect,
      timestamp: Date.now()
    });

    setOverrideEnabled(true);
  };

  const disableOverride = async () => {
    await set(ref(db, "override/control"), {
      enabled: false,
      selected_defect: null,
      timestamp: Date.now()
    });

    setOverrideEnabled(false);
  };

  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "1rem",
        borderRadius: "8px",
        background: "#f5f5f5",
        border: "2px solid #1976d2"
      }}
    >
      <h3 style={{ marginBottom: "1rem" }}>
        Manual Defect Override (Demo Mode)
      </h3>

      {/* Defect Dropdown */}
      <div style={{ marginBottom: "1rem" }}>
        <select
          value={selectedDefect}
          onChange={(e) => setSelectedDefect(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "6px",
            width: "200px"
          }}
        >
          <option value="">Select Defect</option>
          {defectOptions.map((defect) => (
            <option key={defect} value={defect}>
              {defect}
            </option>
          ))}
        </select>
      </div>

      {/* Override Button */}
      <div>
        <button
          onClick={overrideEnabled ? disableOverride : applyOverride}
          style={{
            background: overrideEnabled ? "#2e7d32" : "#d32f2f",
            color: "#fff",
            border: "none",
            padding: "0.6rem 1.2rem",
            borderRadius: "6px",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          {overrideEnabled ? "Disable Override" : "Apply Override"}
        </button>
      </div>

      {/* Status Display */}
      {overrideEnabled && selectedDefect && (
        <div style={{ marginTop: "1rem", fontWeight: "bold" }}>
          Selected Defect: {selectedDefect}
        </div>
      )}
    </div>
  );
}

export default ManualOverridePanel;