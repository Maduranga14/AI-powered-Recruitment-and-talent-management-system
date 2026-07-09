import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';

function RoleIcon({ type }) {
  const icons = {
    admin: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    dept: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
        <rect x="2" y="2" width="8" height="6" rx="1" /><rect x="8" y="16" width="8" height="6" rx="1" />
        <line x1="6" y1="8" x2="6" y2="13" /><line x1="18" y1="8" x2="18" y2="13" />
        <line x1="6" y1="13" x2="18" y2="13" /><rect x="14" y="2" width="8" height="6" rx="1" />
        <line x1="12" y1="13" x2="12" y2="16" />
      </svg>
    ),
    recruiter: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    interviewer: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
    analyst: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
  };
  return icons[type] || icons.admin;
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-teal-500' : 'bg-gray-200'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}

export default function RolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('global-admin');
  const [roleDetails, setRoleDetails] = useState(null);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  // Permission Edit States
  const [aiToggles, setAiToggles] = useState({});
  const [sysToggles, setSysToggles] = useState({});
  const [opsMatrix, setOpsMatrix] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', icon: 'admin', tags: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const fetchRoles = async (selectId = null) => {
    try {
      setLoadingRoles(true);
      const list = await adminApi.getRoles();
      setRoles(list || []);
      if (list && list.length > 0) {
        const nextId = selectId || list[0].id;
        setSelectedRole(nextId);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setError('Failed to load active roles listing.');
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchRoleDetails = async (roleId) => {
    try {
      setLoadingDetails(true);
      const details = await adminApi.getRoleDetails(roleId);
      setRoleDetails(details);
      
      // Initialize edit states
      const ai = {};
      details.permissions.aiInsights.forEach(item => {
        ai[item.id] = item.enabled;
      });
      setAiToggles(ai);

      const sys = {};
      details.permissions.systemManagement.forEach(item => {
        sys[item.id] = item.enabled;
      });
      setSysToggles(sys);

      const ops = {};
      details.permissions.recruitmentOps.forEach(item => {
        ops[item.id] = { view: item.view, edit: item.edit, delete: item.delete };
      });
      setOpsMatrix(ops);
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to load role details:', err);
      alert('Failed to load role permission settings.');
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchRoleDetails(selectedRole);
    }
  }, [selectedRole]);

  const toggleAI = id => {
    setAiToggles(p => ({ ...p, [id]: !p[id] }));
    setIsDirty(true);
  };
  const toggleSys = id => {
    setSysToggles(p => ({ ...p, [id]: !p[id] }));
    setIsDirty(true);
  };
  const toggleOps = (id, col) => {
    setOpsMatrix(p => ({ ...p, [id]: { ...p[id], [col]: !p[id][col] } }));
    setIsDirty(true);
  };

  const handleDiscard = () => {
    if (roleDetails) {
      const ai = {};
      roleDetails.permissions.aiInsights.forEach(item => {
        ai[item.id] = item.enabled;
      });
      setAiToggles(ai);

      const sys = {};
      roleDetails.permissions.systemManagement.forEach(item => {
        sys[item.id] = item.enabled;
      });
      setSysToggles(sys);

      const ops = {};
      roleDetails.permissions.recruitmentOps.forEach(item => {
        ops[item.id] = { view: item.view, edit: item.edit, delete: item.delete };
      });
      setOpsMatrix(ops);
      setIsDirty(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const permissions = [
        ...Object.entries(aiToggles).map(([id, val]) => ({ permissionId: id, enabled: val })),
        ...Object.entries(sysToggles).map(([id, val]) => ({ permissionId: id, enabled: val })),
        ...Object.entries(opsMatrix).map(([id, matrix]) => ({ permissionId: id, view: matrix.view, edit: matrix.edit, delete: matrix.delete }))
      ];

      await adminApi.updateRolePermissions(selectedRole, { permissions });
      setIsDirty(false);
      alert('Permissions saved successfully!');
      
      // Update details cache
      if (roleDetails) {
        const updatedDetails = { ...roleDetails };
        updatedDetails.permissions.aiInsights = updatedDetails.permissions.aiInsights.map(p => ({ ...p, enabled: aiToggles[p.id] }));
        updatedDetails.permissions.systemManagement = updatedDetails.permissions.systemManagement.map(p => ({ ...p, enabled: sysToggles[p.id] }));
        updatedDetails.permissions.recruitmentOps = updatedDetails.permissions.recruitmentOps.map(p => ({ 
          ...p, 
          view: opsMatrix[p.id].view,
          edit: opsMatrix[p.id].edit,
          delete: opsMatrix[p.id].delete
        }));
        setRoleDetails(updatedDetails);
      }
    } catch (err) {
      alert(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRole.name) {
      setCreateError('Role Name is required.');
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);
      const created = await adminApi.createRole(newRole);
      setRoles(prev => [...prev, created]);
      setShowCreateModal(false);
      setSelectedRole(created.id);
      setNewRole({ name: '', description: '', icon: 'admin', tags: '' });
    } catch (err) {
      setCreateError(err.message || 'Failed to create role profile.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!confirm('Are you sure you want to delete this role profile? This action cannot be undone.')) return;

    try {
      await adminApi.deleteRole(selectedRole);
      alert('Role profile deleted successfully.');
      const list = roles.filter(r => r.id !== selectedRole);
      setRoles(list);
      if (list.length > 0) {
        setSelectedRole(list[0].id);
      } else {
        setSelectedRole('');
        setRoleDetails(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete role profile.');
    }
  };

  if (loadingRoles) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <svg className="animate-spin text-blue-600" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span className="text-[13px] text-gray-500 font-medium">Loading active roles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center max-w-lg mx-auto mt-10">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </div>
        <h3 className="font-semibold text-gray-900 text-base">Error Loading Roles</h3>
        <p className="text-[13px] text-gray-500 mt-1 mb-4">{error}</p>
        <button onClick={() => fetchRoles()} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[13px] font-semibold hover:bg-gray-800 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-gray-900">Roles &amp; Permissions</h1>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-[13px] font-semibold hover:bg-gray-800 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Create New Role
        </button>
      </div>

      <div className="grid grid-cols-[340px_1fr] gap-6 items-start">

        {/* Left: Role List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <span className="text-[13px] font-semibold text-gray-700">Active Roles ({roles.length})</span>
          </div>
          <div className="flex flex-col">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex items-start gap-3.5 px-5 py-4 text-left transition-colors border-b border-gray-50 last:border-0 ${
                  selectedRole === role.id ? 'bg-blue-50/60' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <RoleIcon type={role.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold text-gray-800 mb-0.5">{role.name}</div>
                  <div className="text-[12px] text-gray-500 leading-snug mb-2">{role.description}</div>
                  <div className="flex flex-wrap gap-1">
                    {role.tags.map(tag => (
                      <span key={tag} className="text-[10.5px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
                {selectedRole === role.id && (
                  <div className="w-1 self-stretch rounded-full bg-blue-600 ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Permission Detail */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[450px] relative">
          {loadingDetails ? (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <svg className="animate-spin text-blue-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
          ) : null}

          {roleDetails ? (
            <>
              {/* Role header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-[16px] font-bold text-gray-900">{selectedRoleData?.name}</span>
                  {selectedRoleData?.isDefault && (
                    <span className="text-[10.5px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded tracking-wide">SYSTEM DEFAULT</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={!isDirty || saving}
                    onClick={handleDiscard}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Discard
                  </button>
                  <button
                    disabled={!isDirty || saving}
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="px-6 py-5 flex flex-col gap-6">

                {/* AI & Intelligence Insights */}
                {roleDetails.permissions.aiInsights.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                      </div>
                      <span className="font-semibold text-[14px] text-gray-900">AI &amp; Intelligence Insights</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {roleDetails.permissions.aiInsights.map(item => (
                        <div key={item.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50">
                          <div>
                            <div className="text-[13.5px] font-semibold text-gray-800">{item.label}</div>
                            <div className="text-[12px] text-gray-500 mt-0.5">{item.desc}</div>
                          </div>
                          <Toggle enabled={aiToggles[item.id] ?? false} onChange={() => toggleAI(item.id)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* System Management */}
                {roleDetails.permissions.systemManagement.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
                      </svg>
                      <span className="font-semibold text-[14px] text-gray-900">System Management</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {roleDetails.permissions.systemManagement.map(item => (
                        <div key={item.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50">
                          <div>
                            <div className="text-[13.5px] font-semibold text-gray-800">{item.label}</div>
                            <div className="text-[12px] text-gray-500 mt-0.5">{item.desc}</div>
                          </div>
                          <Toggle enabled={sysToggles[item.id] ?? false} onChange={() => toggleSys(item.id)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recruitment Operations */}
                {roleDetails.permissions.recruitmentOps.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                      </svg>
                      <span className="font-semibold text-[14px] text-gray-900">Recruitment Operations</span>
                    </div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            <th className="text-left py-3 px-4">Permission</th>
                            <th className="text-center py-3 px-4">View</th>
                            <th className="text-center py-3 px-4">Edit</th>
                            <th className="text-center py-3 px-4">Delete</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roleDetails.permissions.recruitmentOps.map(item => (
                            <tr key={item.id} className="border-b border-gray-100 last:border-0">
                              <td className="py-3.5 px-4 text-[13px] text-gray-800">{item.label}</td>
                              {['view', 'edit', 'delete'].map(col => (
                                <td key={col} className="py-3.5 px-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={opsMatrix[item.id]?.[col] ?? false}
                                    onChange={() => toggleOps(item.id, col)}
                                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        Administrators have permanent "Delete" privileges.
                      </div>
                      {!selectedRoleData?.isDefault && selectedRoleData?.id !== 'global-admin' && (
                        <button
                          onClick={handleDeleteRole}
                          className="text-[12.5px] text-red-500 font-semibold hover:underline"
                        >
                          Delete Role Profile
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[450px]">
              <span className="text-[13px] text-gray-400">Select a role profile from the sidebar.</span>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Create New Role</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Role Name</label>
                <input
                  type="text"
                  placeholder="e.g., Senior Security Analyst"
                  value={newRole.name}
                  onChange={e => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13.5px] focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="Describe the responsibilities and scope of this role..."
                  value={newRole.description}
                  onChange={e => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13.5px] focus:outline-none focus:border-blue-500 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Icon Style</label>
                  <select
                    value={newRole.icon}
                    onChange={e => setNewRole(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13.5px] focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="admin">Admin Shield</option>
                    <option value="dept">Department Hierarchy</option>
                    <option value="recruiter">Recruiter Users</option>
                    <option value="interviewer">Interviewer Check</option>
                    <option value="analyst">Analyst Chart</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., Security, IT Ops"
                    value={newRole.tags}
                    onChange={e => setNewRole(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13.5px] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {createError && (
                <div className="text-[12.5px] text-red-600 font-semibold">{createError}</div>
              )}

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[13px] font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
