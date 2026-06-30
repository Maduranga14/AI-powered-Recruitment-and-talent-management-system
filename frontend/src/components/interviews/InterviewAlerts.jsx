import { useState } from "react";
import ToggleSwitch from "../ui/ToggleSwitch";

const DEFAULT_ALERTS = [
    { key: "email", label: "Email Notifications", description: "Full details & attachments", defaultOn: true },
    { key: "sms", label: "SMS Reminders", description: "30-min window alerts", defaultOn: false },
    { key: "push", label: "Push Notifications", description: "Immediate status updates", defaultOn: true },
];

export default function InterviewAlerts() {
    const [alerts, setAlerts] = useState(Object.fromEntries(DEFAULT_ALERTS.map(a => [a.key, a.defaultOn])));
    const toggle = key => setAlerts(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
                <span>🔔</span>
                <h3 className="text-base font-bold text-gray-900">Interview Alerts</h3>
            </div>
            <div className="flex flex-col gap-3.5 mb-1">
                {DEFAULT_ALERTS.map(alert => (
                    <ToggleSwitch key={alert.key} label={alert.label} description={alert.description}
                        value={alerts[alert.key]} onChange={() => toggle(alert.key)} />
                ))}
            </div>
            <button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-4 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
                Calendar Sync
            </button>
        </div>
    );
}
