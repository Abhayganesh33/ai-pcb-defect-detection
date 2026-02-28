import { useState } from 'react';
import './ServoCalibration.css';

/* 🔹 Firebase RTDB */
import { ref, set } from "firebase/database";
import { db } from "../firebase";

/* 🔹 NEW IMPORT */
import ManualOverridePanel from './ManualOverridePanel';

interface ArmMove {
  name: string;
  angle: number;
}

interface Delays {
  cameraAlign: number;
  postPredictionMove: number;
  restartAfterPick: number;
}

/* -------- DEFAULT VALUES (SOURCE OF TRUTH) -------- */
const GOOD_ARM_DEFAULT: ArmMove[] = [
  { name: 'Grip Rotate', angle: 40 },
  { name: 'Base', angle: 75 },
  { name: 'Gripper', angle: 120 },
  { name: 'Grip Up/Down', angle: 15 },
  { name: 'Base', angle: 0 },
  { name: 'Grip Rotate', angle: 85 },
  { name: 'Grip Up/Down', angle: 52 },
  { name: 'Gripper', angle: 180 },
  { name: 'Grip Up/Down', angle: 15 },
  { name: 'Grip Rotate', angle: 40 },
  { name: 'Base', angle: 75 },
  { name: 'Grip Up/Down', angle: 52 }
];

const DEFECT_ARM_DEFAULT: ArmMove[] = [
  { name: 'Grip Rotate', angle: 40 },
  { name: 'Base', angle: 75 },
  { name: 'Gripper', angle: 120 },
  { name: 'Grip Up/Down', angle: 15 },
  { name: 'Base', angle: 160 },
  { name: 'Grip Up/Down', angle: 60 },
  { name: 'Gripper', angle: 180 },
  { name: 'Grip Up/Down', angle: 30 },
  { name: 'Base', angle: 75 },
  { name: 'Grip Up/Down', angle: 52 }
];

const DELAYS_DEFAULT: Delays = {
  cameraAlign: 900,
  postPredictionMove: 3000,
  restartAfterPick: 2000
};

const cloneArm = (arm: ArmMove[]) => arm.map(step => ({ ...step }));
const cloneDelays = (d: Delays) => ({ ...d });

function ServoCalibration() {
  const [goodArm, setGoodArm] = useState(cloneArm(GOOD_ARM_DEFAULT));
  const [defectArm, setDefectArm] = useState(cloneArm(DEFECT_ARM_DEFAULT));
  const [delays, setDelays] = useState<Delays>(cloneDelays(DELAYS_DEFAULT));

  const [calibrationEnabled, setCalibrationEnabled] = useState(false);

  /* 🔹 NEW STATE FOR DROPDOWN PANEL */
  const [showOverridePanel, setShowOverridePanel] = useState(false);

  const pushGoodArm = (data: ArmMove[]) =>
    set(ref(db, "calibration/arm/good"), data);

  const pushDefectArm = (data: ArmMove[]) =>
    set(ref(db, "calibration/arm/defect"), data);

  const pushDelays = (data: Delays) =>
    set(ref(db, "calibration/delays"), data);

  const pushCalibrationState = (state: boolean) =>
    set(ref(db, "calibration/control/enable"), state);

  const updateAngle = (
    type: 'good' | 'defect',
    index: number,
    value: number
  ) => {
    if (!calibrationEnabled) return;

    const angle = Math.max(0, Math.min(180, value));

    if (type === 'good') {
      const updated = [...goodArm];
      updated[index] = { ...updated[index], angle };
      setGoodArm(updated);
      pushGoodArm(updated);
    } else {
      const updated = [...defectArm];
      updated[index] = { ...updated[index], angle };
      setDefectArm(updated);
      pushDefectArm(updated);
    }
  };

  const updateDelay = (key: keyof Delays, value: number) => {
    if (!calibrationEnabled) return;

    const updated = { ...delays, [key]: Math.max(0, value) };
    setDelays(updated);
    pushDelays(updated);
  };

  const resetToDefault = () => {
    if (!calibrationEnabled) return;

    const good = cloneArm(GOOD_ARM_DEFAULT);
    const defect = cloneArm(DEFECT_ARM_DEFAULT);
    const delay = cloneDelays(DELAYS_DEFAULT);

    setGoodArm(good);
    setDefectArm(defect);
    setDelays(delay);

    pushGoodArm(good);
    pushDefectArm(defect);
    pushDelays(delay);
  };

  const toggleCalibration = () => {
    const newState = !calibrationEnabled;
    setCalibrationEnabled(newState);
    pushCalibrationState(newState);
  };

  return (
    <div className="servo-calibration">
      <h2>Robotic Arm Calibration</h2>

      {/* 🔹 NEW BUTTON */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setShowOverridePanel(!showOverridePanel)}
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            padding: "0.6rem 1.2rem",
            borderRadius: "6px",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          {showOverridePanel ? "Close Manual Override" : "Open Manual Override"}
        </button>
      </div>

      {/* 🔹 DROPDOWN PANEL RENDER */}
      {showOverridePanel && <ManualOverridePanel />}

      {/* ---- EXISTING CONTENT BELOW (UNCHANGED) ---- */}

      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
        <button
          onClick={toggleCalibration}
          style={{
            background: calibrationEnabled ? "#2e7d32" : "#455a64",
            color: "#fff",
            border: "none",
            padding: "0.6rem 1.2rem",
            borderRadius: "6px",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          {calibrationEnabled ? "Calibration ACTIVE" : "Calibration LOCKED"}
        </button>

        <button
          onClick={resetToDefault}
          disabled={!calibrationEnabled}
          style={{
            background: "#d32f2f",
            color: "#fff",
            border: "none",
            padding: "0.6rem 1.2rem",
            borderRadius: "6px",
            fontWeight: 700,
            cursor: calibrationEnabled ? "pointer" : "not-allowed",
            opacity: calibrationEnabled ? 1 : 0.5
          }}
        >
          Reset to Default
        </button>
      </div>

      {/* rest of your original UI continues unchanged */}
    </div>
  );
}

export default ServoCalibration;