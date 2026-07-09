import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${enabled ? 'bg-teal-500' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

export default function OrganizationDepartments() {
  const [corporateStructure, setCorporateStructure] = useState({ name: '', sub: '' });
  const [departments, setDepartments] = useState([]);
  const [globalPolicies, setGlobalPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', badge: '', head: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDepartmentDashboard();
      setCorporateStructure(data.corporateStructure || { name: 'TalentAI Global Holding', sub: 'Principal Entity' });
      setDepartments(data.departments || []);
      setGlobalPolicies(data.globalPolicies || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load department dashboard:', err);
      setError(err.message || 'Failed to load department configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleTogglePolicy = async (id) => {
    try {
      const updatedPolicy = await adminApi.togglePolicy(id);
      setGlobalPolicies(prev =>
        prev.map(p => p.id === id ? { ...p, enabled: updatedPolicy.enabled } : p)
      );
    } catch (err) {
      alert(err.message || 'Failed to update policy status.');
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      await adminApi.deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete department.');
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDept.name || !newDept.head) {
      setSubmitError('Department Name and Head Name are required.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      const created = await adminApi.createDepartment({
        name: newDept.name,
        badge: newDept.badge || 'NEW',
        head: newDept.head
      });
      setDepartments(prev => [...prev, created]);
      setShowAddModal(false);
      setNewDept({ name: '', badge: '', head: '' });
    } catch (err) {
      setSubmitError(err.message || 'Failed to create department.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <svg className="animate-spin text-blue-600" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span className="text-[13px] text-gray-500 font-medium">Loading organization structure...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center max-w-lg mx-auto mt-10">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </div>
        <h3 className="font-semibold text-gray-900 text-base">Error Loading Dashboard</h3>
        <p className="text-[13px] text-gray-500 mt-1 mb-4">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[13px] font-semibold hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Organization &amp; Departments</h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Manage corporate details, department heads, and global recruitment policies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-[13px] font-semibold hover:bg-gray-800 transition-colors" onClick={() => setShowAddModal(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Department
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6 items-start">
        <div className="flex flex-col gap-6">

          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <span className="font-semibold text-gray-900 text-[15px]">Corporate Structure</span>
            </div>

            
            <div className="bg-[#1e3a5f] text-white rounded-xl px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-[14px]">{corporateStructure.name}</div>
                  <div className="text-[11.5px] text-blue-200">{corporateStructure.sub}</div>
                </div>
              </div>
            </div>
          </div>

          
          <div>
            <div className="font-semibold text-gray-900 text-[15px] mb-4">Department Directory</div>
            {departments.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 border-dashed p-8 text-center">
                <p className="text-[13px] text-gray-400">No departments configured. Click "Add Department" to create one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {departments.map(dept => (
                  <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow relative group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2">
                        {dept.badge && (
                          <span
                            className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded"
                            style={{ color: dept.badgeColor, backgroundColor: `${dept.badgeColor}15` }}
                          >
                            {dept.badge}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-1 duration-150"
                          title="Delete Department"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="font-bold text-[15px] text-gray-900 mb-2">{dept.name}</div>
                    <div className="flex items-center gap-2 pt-1">
                      <div
                        className="w-6 h-6 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                        style={{ backgroundColor: dept.headColor }}
                      >
                        {dept.headInitials}
                      </div>
                      <span className="text-[12px] text-gray-600 font-medium">Head: {dept.head}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        
        <div className="flex flex-col gap-4">
          <div className="bg-[#1e3a5f] rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              <span className="font-bold text-[14px]">Global Recruitment Policies</span>
            </div>
            <div className="text-[11.5px] text-blue-200 font-medium">AI-Driven Optimization Active</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {globalPolicies.map((policy, idx) => (
              <div
                key={policy.id}
                className={`px-5 py-4 ${idx < globalPolicies.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <span className="font-semibold text-[13.5px] text-gray-800 leading-tight">{policy.label}</span>
                  <Toggle enabled={policy.enabled} onChange={() => handleTogglePolicy(policy.id)} />
                </div>
                <p className="text-[12px] text-gray-500 leading-snug">{policy.desc}</p>
              </div>
            ))}
          </div>

          
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <div className="text-[11.5px] font-bold text-gray-500 uppercase tracking-wider mb-2">AI Insights</div>
            <p className="text-[12.5px] text-gray-700 italic leading-relaxed">
              "Enabling 'Diversity Bias Shield' for the Engineering division last quarter resulted in a 24% increase in candidate pool diversity without affecting time-to-hire."
            </p>
          </div>
        </div>
      </div>

      
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Department</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g., Engineering"
                  value={newDept.name}
                  onChange={e => setNewDept(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13.5px] focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Badge (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., HIGH VOLUME, STRATEGIC"
                  value={newDept.badge}
                  onChange={e => setNewDept(prev => ({ ...prev, badge: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13.5px] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Department Head Name</label>
                <input
                  type="text"
                  placeholder="e.g., Sarah Jenkins"
                  value={newDept.head}
                  onChange={e => setNewDept(prev => ({ ...prev, head: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13.5px] focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {submitError && (
                <div className="text-[12.5px] text-red-600 font-semibold">{submitError}</div>
              )}

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[13px] font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
