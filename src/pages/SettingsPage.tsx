import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSystem } from '../context/SystemContext';
import {
  Sliders,
  Building2,
  Radio,
  Cpu,
  Sun,
  Moon,
  LogOut,
  Server,
  AlertTriangle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    mlServiceStatus,
    setMlServiceStatus,
    rfServiceStatus,
    setRfServiceStatus,
    backendConnection,
    setBackendConnection
  } = useSystem();

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5 font-mono">
          <Sliders className="w-6 h-6 text-cyan-400" />
          <span>SYSTEM & SERVICE SETTINGS</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Configure institution terminal profiles, theme modes, and test service outage fallback behaviors.
        </p>
      </div>

      {/* Section 1: Institution & Session Info */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h2 className="text-sm font-bold text-gray-200 uppercase font-mono flex items-center gap-2 border-b border-gray-800 pb-3">
          <Building2 className="w-4 h-4 text-cyan-400" />
          Institution & Active Session Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 space-y-1">
            <span className="text-gray-400 block">Member Institution Name:</span>
            <strong className="text-sm font-semibold text-white">{session?.institutionName}</strong>
          </div>

          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 space-y-1">
            <span className="text-gray-400 block">Bank Institution ID:</span>
            <strong className="text-sm font-mono text-cyan-300">{session?.institutionId}</strong>
          </div>

          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 space-y-1">
            <span className="text-gray-400 block">Security Officer User:</span>
            <strong className="text-sm font-mono text-gray-200">{session?.username}</strong>
          </div>

          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 space-y-1">
            <span className="text-gray-400 block">Assigned POS Terminal:</span>
            <strong className="text-sm font-mono text-cyan-400">{session?.terminalId}</strong>
          </div>
        </div>
      </div>

      {/* Section 2: Service Outage Simulator Toggles */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-800/40 bg-amber-950/10 space-y-4">
        <div className="flex items-center justify-between border-b border-amber-800/40 pb-3">
          <div>
            <h2 className="text-sm font-bold text-amber-300 uppercase font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Service Outage & Fallback Simulator
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Simulate backend, ML, or RF service failures to verify system degradation states.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* ML Service Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-gray-950/60 border border-gray-800">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-semibold text-gray-200">PyTorch ML Service Status</span>
                <p className="text-[10px] text-gray-400">Controls AI behavioural anomaly score computation</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(['active', 'degraded', 'unavailable'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setMlServiceStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                    mlServiceStatus === st
                      ? st === 'active'
                        ? 'bg-emerald-500 text-gray-950'
                        : st === 'degraded'
                        ? 'bg-amber-500 text-gray-950'
                        : 'bg-rose-500 text-white'
                      : 'bg-gray-900 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* RF Service Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-gray-950/60 border border-gray-800">
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="font-semibold text-gray-200">RF Physical Telemetry Status</span>
                <p className="text-[10px] text-gray-400">Controls hardware 2.45 GHz and S11 spectroscopy</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(['active', 'degraded', 'unavailable'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setRfServiceStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                    rfServiceStatus === st
                      ? st === 'active'
                        ? 'bg-cyan-500 text-gray-950'
                        : st === 'degraded'
                        ? 'bg-amber-500 text-gray-950'
                        : 'bg-rose-500 text-white'
                      : 'bg-gray-900 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Backend Connection Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-gray-950/60 border border-gray-800">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-blue-400" />
              <div>
                <span className="font-semibold text-gray-200">FastAPI Backend REST Connection</span>
                <p className="text-[10px] text-gray-400">Switch between live FastAPI REST backend and mock mode</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(['mock', 'online', 'offline'] as const).map(conn => (
                <button
                  key={conn}
                  onClick={() => setBackendConnection(conn)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                    backendConnection === conn
                      ? conn === 'online'
                        ? 'bg-emerald-500 text-gray-950'
                        : conn === 'mock'
                        ? 'bg-blue-500 text-white'
                        : 'bg-rose-500 text-white'
                      : 'bg-gray-900 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {conn}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Section 3: Theme & Security Preferences */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h2 className="text-sm font-bold text-gray-200 uppercase font-mono flex items-center gap-2 border-b border-gray-800 pb-3">
          <Sun className="w-4 h-4 text-amber-400" />
          Appearance & Theme Preference
        </h2>

        <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-gray-950/60 border border-gray-800">
          <div>
            <span className="font-semibold text-gray-200">Portal Interface Theme</span>
            <p className="text-[10px] text-gray-400">Current mode: {theme.toUpperCase()}</p>
          </div>

          <button
            onClick={toggleTheme}
            className="py-2 px-4 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-200 flex items-center gap-2"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme</span>
          </button>
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={logout}
          className="py-2.5 px-5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of FedTrust Terminal</span>
        </button>
      </div>

    </div>
  );
};
