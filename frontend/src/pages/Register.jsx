import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Register({ onLogin, onGoToLogin }) {
    const { register } = useAuth();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const update = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        setFieldErrors(prev => ({ ...prev, [field]: '' }));
        setError('');
    };

    const validate = () => {
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = 'First name is required.';
        if (!form.lastName.trim()) errs.lastName = 'Last name is required.';
        if (!form.email.trim()) errs.email = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format.';
        if (!form.password) errs.password = 'Password is required.';
        else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(form.password))
            errs.password = 'Must include uppercase, lowercase, number and special character.';
        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

        setIsLoading(true);
        setError('');
        try {
            await register({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                password: form.password,
                confirmPassword: form.confirmPassword,
            });
            onLogin('candidate');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    
    const pwChecks = [
        ['8+ chars', form.password.length >= 8],
        ['Uppercase', /[A-Z]/.test(form.password)],
        ['Lowercase', /[a-z]/.test(form.password)],
        ['Number', /\d/.test(form.password)],
        ['Symbol', /[\W_]/.test(form.password)],
    ];
    const pwStrength = pwChecks.filter(([, ok]) => ok).length;
    const pwStrengthColor = pwStrength <= 1 ? 'bg-red-500' : pwStrength <= 3 ? 'bg-amber-400' : pwStrength === 4 ? 'bg-blue-500' : 'bg-green-500';
    const pwStrengthLabel = pwStrength <= 1 ? 'Weak' : pwStrength <= 3 ? 'Fair' : pwStrength === 4 ? 'Good' : 'Strong';

    const inputBase = (field) =>
        `flex items-center gap-2 border-[1.5px] rounded-lg px-3 bg-gray-50 focus-within:bg-white transition-colors ${fieldErrors[field] ? 'border-red-400 focus-within:border-red-500' : 'border-gray-200 focus-within:border-blue-500'}`;

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            
            <header className="bg-white border-b border-gray-200 px-8 py-5">
                <div className="flex items-center gap-2.5 font-bold text-[15px] text-gray-900">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect x="1" y="1" width="7" height="7" rx="1" fill="#2563EB" />
                        <rect x="11" y="1" width="7" height="7" rx="1" fill="#2563EB" opacity="0.5" />
                        <rect x="1" y="11" width="7" height="7" rx="1" fill="#2563EB" opacity="0.5" />
                        <rect x="11" y="11" width="7" height="7" rx="1" fill="#2563EB" />
                    </svg>
                    TalentPortal AI
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-5 py-10">
                <div className="bg-white rounded-xl p-10 w-full max-w-[500px] shadow-md">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Candidate Account</h1>
                    </div>
                    <p className="text-gray-500 text-sm mb-6">Join TalentPortal AI to find your next opportunity.</p>

                    
                    {error && (
                        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <svg className="mt-0.5 shrink-0 text-red-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label htmlFor="reg-fname" className="block font-semibold text-sm text-gray-700 mb-1.5">First Name</label>
                                <input
                                    id="reg-fname"
                                    type="text"
                                    placeholder="John"
                                    value={form.firstName}
                                    onChange={update('firstName')}
                                    className={`w-full border-[1.5px] rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none bg-gray-50 focus:bg-white transition-colors ${fieldErrors.firstName ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                                />
                                {fieldErrors.firstName && <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>}
                            </div>
                            <div>
                                <label htmlFor="reg-lname" className="block font-semibold text-sm text-gray-700 mb-1.5">Last Name</label>
                                <input
                                    id="reg-lname"
                                    type="text"
                                    placeholder="Doe"
                                    value={form.lastName}
                                    onChange={update('lastName')}
                                    className={`w-full border-[1.5px] rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none bg-gray-50 focus:bg-white transition-colors ${fieldErrors.lastName ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                                />
                                {fieldErrors.lastName && <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>}
                            </div>
                        </div>

                        
                        <div className="mb-4">
                            <label htmlFor="reg-email" className="block font-semibold text-sm text-gray-700 mb-1.5">Email Address</label>
                            <div className={inputBase('email')}>
                                <svg width="16" height="16" className="text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 7L2 7" />
                                </svg>
                                <input
                                    id="reg-email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={form.email}
                                    onChange={update('email')}
                                    className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400 outline-none border-none"
                                />
                            </div>
                            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
                        </div>

                        
                        <div className="mb-4">
                            <label htmlFor="reg-password" className="block font-semibold text-sm text-gray-700 mb-1.5">Password</label>
                            <div className={inputBase('password')}>
                                <svg width="16" height="16" className="text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    id="reg-password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min 8 chars, uppercase, number & symbol"
                                    value={form.password}
                                    onChange={update('password')}
                                    className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400 outline-none border-none"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-700 flex p-1">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        {showPassword
                                            ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                                            : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                        }
                                    </svg>
                                </button>
                            </div>
                            {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}

                            
                            {form.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1.5">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength ? pwStrengthColor : 'bg-gray-200'}`} />
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2.5 flex-wrap">
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

                        
                        <div className="mb-5">
                            <label htmlFor="reg-confirm" className="block font-semibold text-sm text-gray-700 mb-1.5">Confirm Password</label>
                            <div className={inputBase('confirmPassword')}>
                                <svg width="16" height="16" className="text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                <input
                                    id="reg-confirm"
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Re-enter your password"
                                    value={form.confirmPassword}
                                    onChange={update('confirmPassword')}
                                    className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400 outline-none border-none"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-700 flex p-1">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        {showConfirm
                                            ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                                            : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                        }
                                    </svg>
                                </button>
                            </div>
                            {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>}
                        </div>

                       
                        <button
                            id="register-btn"
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg py-3.5 text-[15px] font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                    </svg>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                        <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                                    </svg>
                                    Create Candidate Account
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-sm text-gray-600">
                    Already have an account?{' '}
                    <button onClick={onGoToLogin} className="text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer">
                        Sign in
                    </button>
                </p>
            </main>

            <footer className="px-8 py-5 flex items-center justify-between text-xs text-gray-500">
                <span>© 2026 TalentAI Precision Systems. All rights reserved.</span>
                <div className="flex gap-5">
                    {['Privacy Policy', 'Terms of Service', 'Contact Support'].map(l => (
                        <a key={l} href="#" className="hover:text-gray-900 transition-colors">{l}</a>
                    ))}
                </div>
            </footer>
        </div>
    );
}
