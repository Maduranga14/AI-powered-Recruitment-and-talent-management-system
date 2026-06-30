import React, { useState } from 'react'

export default function Login({ onLogin }) {
    const [role, setRole] = useState('candidate')
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = () => onLogin(role);

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


                    <div className="flex items-center bg-gray-100 rounded-lg p-1 mb-7">
                        <button
                            id="role-candidate"
                            onClick={() => setRole('candidate')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[13.5px] font-semibold transition-all duration-200
                                ${role === 'candidate' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                            Candidate Portal
                        </button>
                        <button
                            id="role-recruiter"
                            onClick={() => setRole('recruiter')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[13.5px] font-semibold transition-all duration-200
                                ${role === 'recruiter' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" />
                                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                            </svg>
                            Recruiter Portal
                        </button>
                    </div>

                    <div className="mb-5">
                        <label className="block font-semibold text-sm text-gray-700 mb-2">Email Address</label>
                        <div className="flex items-center gap-2 border-[1.5px] border-gray-200 rounded-lg px-3 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                            <svg width="16" height="16" className="text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 7L2 7" />
                            </svg>
                            <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)}
                                className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400 outline-none border-none" />
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="block font-semibold text-sm text-gray-700 mb-2">Password</label>
                        <div className="flex items-center gap-2 border-[1.5px] border-gray-200 rounded-lg px-3 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                            <svg width="16" height="16" className="text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                                className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400 outline-none border-none" />
                            <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-700 flex p-1">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
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
                        onClick={handleLogin}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3.5 text-[15px] font-semibold flex items-center justify-center gap-2 mt-6 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        Sign In as {role === 'recruiter' ? 'Recruiter' : 'Candidate'}
                    </button>
                </div>

                <p className="mt-6 text-sm text-gray-600">
                    Don't have account? <a href="#" className="text-blue-600 font-semibold">Sign up</a>
                </p>
            </main>

            <footer className='px-8 py-5 flex items-center justify-between text-xs text-gray-500'>
                <span>© 2026 TalentAI Precision Systems. All rights reserved.</span>
                <div className="flex gap-5">
                    {["Privacy Policy", "Terms of Service", "Contact Support"].map(l => (
                        <a key={l} href="#" className="hover:text-gray-900 transition-colors">{l}</a>
                    ))}
                </div>
            </footer>
        </div>
    );
}
