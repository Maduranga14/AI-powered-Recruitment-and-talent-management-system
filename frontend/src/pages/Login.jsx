import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onLogin, onGoToRegister }) {
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter your email and password.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const userData = await login(email, password);
            
            const role = userData.role?.toLowerCase() === 'hiringmanager'
                ? 'hiringmanager'
                : userData.role?.toLowerCase();
            onLogin(role, userData);
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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

            <main className="flex-1 flex flex-col items-center justify-center px-5 py-12">
                <div className="bg-white rounded-xl p-12 w-full max-w-[460px] shadow-md">
                    <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-center text-gray-500 mb-7">Sign in to access your talent insights.</p>

                    
                    {error && (
                        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <svg className="mt-0.5 shrink-0 text-red-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        
                        <div className="mb-5">
                            <label className="block font-semibold text-sm text-gray-700 mb-2">Email Address</label>
                            <div className="flex items-center gap-2 border-[1.5px] border-gray-200 rounded-lg px-3 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                                <svg width="16" height="16" className="text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 7L2 7" />
                                </svg>
                                <input
                                    id="login-email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400 outline-none border-none"
                                    required
                                />
                            </div>
                        </div>

                        
                        <div className="mb-5">
                            <label className="block font-semibold text-sm text-gray-700 mb-2">Password</label>
                            <div className="flex items-center gap-2 border-[1.5px] border-gray-200 rounded-lg px-3 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                                <svg width="16" height="16" className="text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400 outline-none border-none"
                                    required
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

                            <div className="flex items-center justify-between mt-2.5">
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="rounded" />
                                    Remember me
                                </label>
                                <a href="#" className="text-blue-600 text-sm font-medium">Forgot password?</a>
                            </div>
                        </div>

                        <button
                            id="login-btn"
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg py-3.5 text-[15px] font-semibold flex items-center justify-center gap-2 mt-6 transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                        onClick={onGoToRegister}
                        className="text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                    >
                        Sign up as Candidate
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
