import { useState } from 'react';
import { adminApi } from '../../services/api';

const ROLES = [
    {
        value: 'Recruiter',
        label: 'Recruiter',
        description: 'Can post jobs, search candidates, manage applications and schedule interviews.',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
        ),
        color: 'text-violet-600 bg-violet-50 border-violet-200',
        selectedColor: 'border-violet-500 bg-violet-50',
    },
    {
        value: 'HiringManager',
        label: 'Hiring Manager',
        description: 'Can review shortlisted candidates, manage interview feedback and make hiring decisions.',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        color: 'text-teal-600 bg-teal-50 border-teal-200',
        selectedColor: 'border-teal-500 bg-teal-50',
    },
];

export default function AddUserModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const update = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        setFieldErrors(prev => ({ ...prev, [field]: '' }));
        setError('');
    };

    const setRole = (role) => {
        setForm(prev => ({ ...prev, role }));
        setFieldErrors(prev => ({ ...prev, role: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = 'Required';
        if (!form.lastName.trim()) errs.lastName = 'Required';
        if (!form.email.trim()) errs.email = 'Required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
        if (!form.password) errs.password = 'Required';
        else if (form.password.length < 8) errs.password = 'Min 8 characters';
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(form.password))
            errs.password = 'Needs uppercase, lowercase, number & symbol';
        if (!form.role) errs.role = 'Please select a role';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            // Backend enum: 1 = Recruiter, 2 = HiringManager
            const roleValue = form.role === 'Recruiter' ? 1 : 2;
            const result = await adminApi.createUser({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                password: form.password,
                role: roleValue,
            });
            onSuccess(result.data);
        } catch (err) {
            setError(err.message || 'Failed to create user. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Password strength checker
    const pwChecks = [
        ['8+ characters', form.password.length >= 8],
        ['Uppercase letter', /[A-Z]/.test(form.password)],
        ['Lowercase letter', /[a-z]/.test(form.password)],
        ['Number', /\d/.test(form.password)],
        ['Special character', /[\W_]/.test(form.password)],
    ];
    const pwStrength = pwChecks.filter(([, ok]) => ok).length;
    const pwStrengthLabel = pwStrength <= 1 ? 'Weak' : pwStrength <= 3 ? 'Fair' : pwStrength === 4 ? 'Good' : 'Strong';
    const pwStrengthColor = pwStrength <= 1 ? 'bg-red-500' : pwStrength <= 3 ? 'bg-amber-400' : pwStrength === 4 ? 'bg-blue-500' : 'bg-green-500';

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto">

                {/* Modal Header */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-gray-900">Add New User</h2>
                            <p className="text-[12px] text-gray-500 mt-0.5">Create a Recruiter or Hiring Manager account</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-5">

                    {/* Error Banner */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <svg className="mt-0.5 shrink-0 text-red-500" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p className="text-red-700 text-[13px]">{error}</p>
                        </div>
                    )}

                    {/* Role Selection */}
                    <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-2.5">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {ROLES.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => setRole(r.value)}
                                    className={`text-left p-4 rounded-xl border-2 transition-all ${form.role === r.value
                                        ? r.selectedColor + ' shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${r.color.split(' ').slice(0, 2).join(' ')}`}>
                                        {r.icon}
                                    </div>
                                    <div className="text-[13.5px] font-semibold text-gray-800">{r.label}</div>
                                    <div className="text-[11.5px] text-gray-500 mt-0.5 leading-relaxed">{r.description}</div>
                                </button>
                            ))}
                        </div>
                        {fieldErrors.role && (
                            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.role}</p>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {[['firstName', 'First Name', 'John'], ['lastName', 'Last Name', 'Doe']].map(([field, label, ph]) => (
                            <div key={field}>
                                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                                    {label} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder={ph}
                                    value={form[field]}
                                    onChange={update(field)}
                                    className={`w-full border-[1.5px] rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors bg-gray-50 focus:bg-white ${fieldErrors[field] ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                                />
                                {fieldErrors[field] && (
                                    <p className="mt-1 text-xs text-red-600">{fieldErrors[field]}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className={`flex items-center gap-2 border-[1.5px] rounded-lg px-3.5 bg-gray-50 focus-within:bg-white transition-colors ${fieldErrors.email ? 'border-red-400' : 'border-gray-200 focus-within:border-blue-500'}`}>
                            <svg width="15" height="15" className="text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 7L2 7" />
                            </svg>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={form.email}
                                onChange={update('email')}
                                className="flex-1 bg-transparent py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none border-none"
                            />
                        </div>
                        {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                            Temporary Password <span className="text-red-500">*</span>
                        </label>
                        <div className={`flex items-center gap-2 border-[1.5px] rounded-lg px-3.5 bg-gray-50 focus-within:bg-white transition-colors ${fieldErrors.password ? 'border-red-400' : 'border-gray-200 focus-within:border-blue-500'}`}>
                            <svg width="15" height="15" className="text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min 8 chars with uppercase, number & symbol"
                                value={form.password}
                                onChange={update('password')}
                                className="flex-1 bg-transparent py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none border-none"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-700 p-1">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    {showPassword
                                        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                    }
                                </svg>
                            </button>
                        </div>
                        {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}

                        {/* Password strength bar */}
                        {form.password && (
                            <div className="mt-2">
                                <div className="flex gap-1 mb-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength ? pwStrengthColor : 'bg-gray-200'}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-3">
                                        {pwChecks.map(([label, ok]) => (
                                            <span key={label} className={`text-[10.5px] flex items-center gap-1 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    {ok ? <polyline points="20 6 9 17 4 12" /> : <circle cx="12" cy="12" r="10" />}
                                                </svg>
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                    <span className={`text-[11px] font-semibold ${pwStrength <= 1 ? 'text-red-500' : pwStrength <= 3 ? 'text-amber-500' : 'text-green-600'}`}>
                                        {pwStrengthLabel}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info notice */}
                    <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                        <svg className="mt-0.5 shrink-0 text-blue-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p className="text-[12px] text-blue-700 leading-relaxed">
                            The user will receive login credentials for this temporary password. They should change it on first login. Only <strong>Recruiters</strong> and <strong>Hiring Managers</strong> can be created by admins.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13.5px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-[13.5px] font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                    </svg>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                        <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                                    </svg>
                                    Create {form.role ? (form.role === 'HiringManager' ? 'Hiring Manager' : form.role) : 'User'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
