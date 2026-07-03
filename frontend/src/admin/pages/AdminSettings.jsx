import { useState } from 'react';

const settingSections = [
  {
    id: 'general',
    label: 'General',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Security',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
];

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [orgName, setOrgName] = useState('TalentAI Global Holding');
  const [timezone, setTimezone] = useState('UTC-5 (Eastern Time)');
  const [language, setLanguage] = useState('English (US)');
  const [twoFA, setTwoFA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">Settings</h1>
        <p className="text-[13px] text-gray-500 mt-1">Manage platform configuration, security, and integrations.</p>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-6 items-start">
        {/* Side nav */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {settingSections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={`flex items-center gap-3 w-full px-4 py-3.5 text-[13px] font-medium transition-colors border-b border-gray-50 last:border-0 ${
                activeTab === s.id
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className={activeTab === s.id ? 'text-blue-600' : 'text-gray-400'}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'general' && (
            <div className="flex flex-col gap-5">
              <div className="font-semibold text-gray-900 text-[15px] pb-3 border-b border-gray-100">General Settings</div>

              {[
                { label: 'Organization Name', value: orgName, setter: setOrgName, placeholder: 'Enter organization name' },
                { label: 'Default Timezone', value: timezone, setter: setTimezone, placeholder: 'Select timezone' },
                { label: 'Platform Language', value: language, setter: setLanguage, placeholder: 'Select language' },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">{field.label}</label>
                  <input
                    type="text"
                    value={field.value}
                    onChange={e => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13.5px] text-gray-800 outline-none focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
              ))}

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50">Discard</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-semibold hover:bg-blue-700 transition-colors">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="flex flex-col gap-5">
              <div className="font-semibold text-gray-900 text-[15px] pb-3 border-b border-gray-100">Security Settings</div>
              {[
                { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin accounts.', state: twoFA, toggle: () => setTwoFA(p => !p) },
                { label: 'Session Timeout', desc: 'Automatically log out inactive users after 30 minutes.', state: sessionTimeout, toggle: () => setSessionTimeout(p => !p) },
                { label: 'Login Alert Emails', desc: 'Send an email alert on each new login.', state: loginAlerts, toggle: () => setLoginAlerts(p => !p) },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="text-[13.5px] font-semibold text-gray-800">{item.label}</div>
                    <div className="text-[12px] text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                  <Toggle enabled={item.state} onChange={item.toggle} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="flex flex-col gap-5">
              <div className="font-semibold text-gray-900 text-[15px] pb-3 border-b border-gray-100">Notification Preferences</div>
              {[
                { label: 'Email Notifications', desc: 'Receive admin alerts via email.', state: emailNotifs, toggle: () => setEmailNotifs(p => !p) },
                { label: 'Slack Integration Alerts', desc: 'Push notifications to your Slack workspace.', state: slackNotifs, toggle: () => setSlackNotifs(p => !p) },
                { label: 'Weekly Summary Digest', desc: 'Receive a weekly report of platform activity.', state: weeklyDigest, toggle: () => setWeeklyDigest(p => !p) },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="text-[13.5px] font-semibold text-gray-800">{item.label}</div>
                    <div className="text-[12px] text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                  <Toggle enabled={item.state} onChange={item.toggle} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="flex flex-col gap-4">
              <div className="font-semibold text-gray-900 text-[15px] pb-3 border-b border-gray-100">Connected Integrations</div>
              {[
                { name: 'LinkedIn Recruiter', status: 'Connected', statusColor: 'text-green-600 bg-green-50' },
                { name: 'Slack Workspace', status: 'Connected', statusColor: 'text-green-600 bg-green-50' },
                { name: 'Google Workspace', status: 'Disconnected', statusColor: 'text-gray-500 bg-gray-100' },
                { name: 'BambooHR', status: 'Disconnected', statusColor: 'text-gray-500 bg-gray-100' },
              ].map(int => (
                <div key={int.name} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
                  <span className="text-[13.5px] font-semibold text-gray-800">{int.name}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${int.statusColor}`}>{int.status}</span>
                    <button className="text-[12.5px] text-blue-600 font-semibold hover:underline">
                      {int.status === 'Connected' ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="flex flex-col gap-5">
              <div className="font-semibold text-gray-900 text-[15px] pb-3 border-b border-gray-100">Billing &amp; Subscription</div>
              <div className="bg-blue-50 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[16px] text-blue-900">Enterprise Plan</div>
                  <div className="text-[12.5px] text-blue-700 mt-0.5">Renews on Jan 1, 2025 · $2,400 / month</div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-semibold hover:bg-blue-700 transition-colors">Manage Plan</button>
              </div>
              <div>
                <div className="text-[12.5px] font-semibold text-gray-700 mb-3">Payment Method</div>
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                  <svg width="24" height="16" viewBox="0 0 38 24" fill="none"><rect width="38" height="24" rx="4" fill="#1434CB"/><text x="8" y="16" fontSize="10" fill="white" fontWeight="bold">VISA</text></svg>
                  <span className="text-[13px] text-gray-700">•••• •••• •••• 4242</span>
                  <span className="ml-auto text-[12px] text-gray-400">Expires 12/26</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
