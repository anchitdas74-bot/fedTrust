import React, { useState, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { transactionService } from '../../services/api/transactionService';
import { Lock, Clock, RefreshCw, X, CheckCircle2, AlertTriangle, ShieldX } from 'lucide-react';

export const StepUpModal: React.FC = () => {
  const { stepUpTransaction, closeStepUpModal, updateTransactionStatus } = useSystem();

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!stepUpTransaction) return;
    setOtp('');
    setTimer(60);
    setAttemptsLeft(3);
    setErrorMsg(null);
    setSuccessMsg(null);

    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [stepUpTransaction]);

  if (!stepUpTransaction) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit security OTP code.');
      return;
    }

    if (timer === 0) {
      setErrorMsg('OTP has expired. Please request a new code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await transactionService.verifyStepUpOTP(stepUpTransaction.id, otp);
      if (res.success) {
        setSuccessMsg(res.message);
        updateTransactionStatus(stepUpTransaction.id, 'APPROVED', 'Approve');
        setTimeout(() => {
          closeStepUpModal();
        }, 1800);
      } else {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        if (remaining <= 0) {
          setErrorMsg('Maximum retry limits reached. Transaction blocked for security.');
          updateTransactionStatus(stepUpTransaction.id, 'BLOCKED', 'Block');
        } else {
          setErrorMsg(`Invalid OTP entered. ${remaining} attempt(s) remaining.`);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    setOtp('');
    setTimer(60);
    setErrorMsg(null);
    setSuccessMsg('New 6-digit OTP code dispatched to cardholder mobile device.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleCancel = () => {
    updateTransactionStatus(stepUpTransaction.id, 'BLOCKED', 'Block');
    closeStepUpModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-[#0a0f1d] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fade-in text-slate-900 dark:text-slate-100 transition-colors duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Step-Up 2FA Authorization</h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Medium Risk Transaction Hold</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Summary Box */}
        <div className="bg-slate-100/80 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction Details</span>
            <div className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">{stepUpTransaction.id}</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">{stepUpTransaction.merchant}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{stepUpTransaction.location}</div>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">${stepUpTransaction.amount.toFixed(2)}</span>
            <span className="text-xs font-mono text-cyan-700 dark:text-cyan-300">Terminal: {stepUpTransaction.terminalId}</span>
            <span className="mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              RF TRUSTED
            </span>
          </div>
        </div>

        {/* Reason for Step Up */}
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            Authorization Trigger Reason:
          </div>
          <p className="text-amber-800 dark:text-amber-200/90 leading-relaxed font-medium">
            {stepUpTransaction.explanation}
          </p>
        </div>

        {/* Form / Inputs */}
        {successMsg ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Enter 6-Digit Cardholder OTP</label>
                <span className="font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Expires in: <strong className={timer < 15 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>{timer}s</strong>
                </span>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center font-mono text-2xl tracking-[0.4em] py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-cyan-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:tracking-normal placeholder:text-sm placeholder:text-slate-400 shadow-inner"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                Demo hint: Enter any 6 digits (e.g. 123456) to Approve, or 000000 to simulate Failure.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-medium">
                <ShieldX className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 45}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend OTP</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || otp.length !== 6}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize Transaction</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
