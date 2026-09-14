import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSystem } from '../context/SystemContext';
import {
  ShieldAlert,
  Lock,
  Radio,
  Cpu,
  Network,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sun,
  Moon,
  Building2,
  User,
  KeyRound,
  ShieldCheck,
  Clock,
  ShieldX
} from 'lucide-react';

export const LoginPortal: React.FC = () => {
  const {
    loginStep1,
    verify2FA,
    resend2FAOTP,
    is2FAVerificationPending,
    loginError,
    otpError
  } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { mlServiceStatus } = useSystem();

  // Step 1 Form state
  const [institutionId, setInstitutionId] = useState('BANK-FED-01');
  const [username, setUsername] = useState('sec_officer_admin');
  const [password, setPassword] = useState('••••••••••••');
  const [isSubmittingStep1, setIsSubmittingStep1] = useState(false);

  // Step 2 OTP Form state
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isSubmittingOTP, setIsSubmittingOTP] = useState(false);
  const [resendInfo, setResendInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!is2FAVerificationPending) return;

    setOtpTimer(60);
    setAttemptsLeft(3);
    setOtp('');

    const timer = setInterval(() => {
      setOtpTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [is2FAVerificationPending]);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId || !username || !password) return;

    setIsSubmittingStep1(true);
    await loginStep1({ institutionId, username, password });
    setIsSubmittingStep1(false);
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    if (otpTimer === 0) {
      return;
    }

    setIsSubmittingOTP(true);
    const success = await verify2FA(otp);
    setIsSubmittingOTP(false);

    if (!success) {
      setAttemptsLeft(prev => prev - 1);
    }
  };

  const handleResendOTP = async () => {
    const msg = await resend2FAOTP();
    setOtpTimer(60);
    setResendInfo(msg);
    setTimeout(() => setResendInfo(null), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-950 dark:bg-slate-950 text-gray-100 cyber-grid relative overflow-hidden">
      
      {/* Top Bar on Login Page */}
      <header className="p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-wider text-gray-900 dark:text-white font-mono">FedTrust</span>
              <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                TERMINAL v2.4
              </span>
            </div>
            <p className="text-xs text-gray-400">Secure FinTech Fraud Intelligence Portal</p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Live System-Security Telemetry Indicators */}
          <div className="md:col-span-5 glass-panel p-6 rounded-2xl border border-gray-800/80 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Radio className="w-4 h-4 animate-pulse" />
                Live Pre-Auth Security Status
              </div>
              <h2 className="text-base font-bold text-gray-100">Hardware & ML Readiness</h2>
              <p className="text-xs text-gray-400 mt-1">
                Real-time security telemetry prior to institution login authorization.
              </p>

              {/* Security Indicators Stack */}
              <div className="mt-5 space-y-3">
                {/* 1. Credential Verification */}
                <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-semibold text-gray-200">Credential Guard</span>
                      <p className="text-[10px] text-gray-400">2-Factor OTP Enforced</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>

                {/* 2. Federated Network Status */}
                <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Network className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="font-semibold text-gray-200">Federated Network</span>
                      <p className="text-[10px] text-gray-400">3 Bank Nodes Synchronized</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    ONLINE
                  </span>
                </div>

                {/* 3. ML Service Status */}
                <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="font-semibold text-gray-200">PyTorch Autoencoder</span>
                      <p className="text-[10px] text-gray-400">Threshold: 0.0450 Loss</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                    mlServiceStatus === 'active'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {mlServiceStatus.toUpperCase()}
                  </span>
                </div>

                {/* 4. RF Terminal Status */}
                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span className="font-bold text-cyan-300">RF Terminal Status</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      TRUSTED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-300 pt-1 border-t border-cyan-800/30">
                    <div>Terminal ID: <strong className="text-cyan-400">RF-TERM-8092</strong></div>
                    <div>Carrier: <strong className="text-cyan-400">2.45 GHz</strong></div>
                    <div>RSSI: <strong className="text-emerald-400">-68.4 dBm</strong></div>
                    <div>S11 Loss: <strong className="text-emerald-400">-24.5 dB</strong></div>
                  </div>

                  <p className="text-[10px] text-cyan-400/80 leading-normal pt-1">
                    * RF verification represents physical terminal trust and does not imply cardholder authorization.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 text-center">
              FedTrust Security Protocol v2.4 • Bank Level Encryption
            </div>
          </div>

          {/* Right Column: 2-Step Login Portal Form */}
          <div className="md:col-span-7 glass-panel p-8 rounded-2xl border border-gray-800/80 flex flex-col justify-center">
            
            {!is2FAVerificationPending ? (
              /* STEP 1: Institution Credentials */
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold mb-3">
                    <Lock className="w-3.5 h-3.5" /> STEP 1 / 2: CREDENTIAL VERIFICATION
                  </div>
                  <h1 className="text-2xl font-bold text-white">Terminal Login</h1>
                  <p className="text-xs text-gray-400 mt-1">
                    Enter authorized Bank ID and Security Officer credentials to authenticate.
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2.5">
                    <ShieldX className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Bank / Institution ID
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={institutionId}
                        onChange={e => setInstitutionId(e.target.value)}
                        placeholder="e.g. BANK-FED-01"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Security Officer Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingStep1}
                    className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingStep1 ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authenticate Step 1</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* STEP 2: 6-Digit OTP 2FA Screen */
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold mb-3">
                    <ShieldCheck className="w-3.5 h-3.5" /> STEP 2 / 2: 6-DIGIT OTP VERIFICATION
                  </div>
                  <h1 className="text-2xl font-bold text-white">Security Officer 2FA</h1>
                  <p className="text-xs text-gray-400 mt-1">
                    Enter the 6-digit OTP sent to your registered security key device.
                  </p>
                </div>

                {otpError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                {resendInfo && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{resendInfo}</span>
                  </div>
                )}

                <form onSubmit={handleOTPSubmit} className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <label className="font-semibold text-gray-300">6-Digit Security OTP Code</label>
                      <span className="font-mono text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Expires in: <strong className={otpTimer < 15 ? 'text-rose-400' : 'text-amber-400'}>{otpTimer}s</strong>
                      </span>
                    </div>
                    
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full text-center font-mono text-3xl tracking-[0.5em] py-3 bg-gray-950 border border-gray-700 rounded-xl text-cyan-300 focus:outline-none focus:border-cyan-500 transition-all placeholder:tracking-normal placeholder:text-sm placeholder:text-gray-600"
                      autoFocus
                    />
                    
                    <div className="flex justify-between items-center text-[11px] text-gray-400 mt-2">
                      <span>Attempts remaining: <strong className="text-white">{attemptsLeft} / 3</strong></span>
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={otpTimer > 45}
                        className="text-cyan-400 hover:underline disabled:opacity-50"
                      >
                        Resend Code
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 italic bg-gray-950/60 p-2.5 rounded-lg border border-gray-800">
                    Demo Mode: Enter any 6-digit number (e.g. 123456) to grant authenticated session access.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmittingOTP || otp.length !== 6 || attemptsLeft <= 0}
                    className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingOTP ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Enter Main Portal</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-gray-800/80 text-center text-xs text-gray-400 z-10">
        FedTrust Fraud Intelligence System • Secure Federated FinTech Portal
      </footer>
    </div>
  );
};
