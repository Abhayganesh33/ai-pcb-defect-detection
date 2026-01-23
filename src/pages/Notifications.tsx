import { PCBRecord } from '../App';
import './Notifications.css';

interface NotificationsProps {
  history: PCBRecord[];
}

interface Alert {
  defect: string;
  count: number;
  timestamp: Date;
}

function Notifications({ history }: NotificationsProps) {
  const detectRepeatedDefects = (): Alert[] => {
    const alerts: Alert[] = [];

    if (history.length < 2) return alerts;

    let currentDefect = history[0].category;
    let count = 1;

    for (let i = 1; i < history.length; i++) {
      if (history[i].category === currentDefect && currentDefect !== 'Normal') {
        count++;
      } else {
        if (count >= 2 && currentDefect !== 'Normal') {
          alerts.push({
            defect: currentDefect,
            count: count,
            timestamp: history[i - 1].timestamp
          });
        }
        currentDefect = history[i].category;
        count = 1;
      }
    }

    if (count >= 2 && currentDefect !== 'Normal') {
      alerts.push({
        defect: currentDefect,
        count: count,
        timestamp: history[0].timestamp
      });
    }

    return alerts;
  };

  const alerts = detectRepeatedDefects();

  return (
    <div className="notifications">
      <div className="notifications-header">
        <h2>System Notifications</h2>
        <div className="alert-count">
          {alerts.length > 0 ? (
            <span className="has-alerts">{alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}</span>
          ) : (
            <span className="no-alerts">No Alerts</span>
          )}
        </div>
      </div>

      <div className="notifications-content">
        {alerts.length === 0 ? (
          <div className="no-alerts-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h3>All Systems Normal</h3>
            <p>No repeated defects detected in the current production run</p>
          </div>
        ) : (
          <div className="alerts-list">
            {alerts.map((alert, index) => (
              <div key={index} className="alert-card">
                <div className="alert-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div className="alert-content">
                  <h3>Repeated Defect Detected</h3>
                  <p className="alert-message">
                    <strong>{alert.defect}</strong> detected <strong>{alert.count}</strong> times consecutively
                  </p>
                  <p className="alert-timestamp">
                    Last occurrence: {alert.timestamp.toLocaleString()}
                  </p>
                  <div className="alert-action">
                    <span>Action Required: Inspect production line and calibrate detection system</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
