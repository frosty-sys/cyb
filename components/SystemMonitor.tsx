import React, { useEffect, useState } from 'react';
import { Activity, Cpu, HardDrive, Wifi, ShieldAlert, Zap } from 'lucide-react';
import { SystemStatus } from '../types';

const SystemMonitor: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>({
    cpuLoad: 12,
    memoryUsage: 34,
    networkLatency: 24,
    threatLevel: 'LOW',
    uplinkStability: 98
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        cpuLoad: Math.min(100, Math.max(5, prev.cpuLoad + (Math.random() * 10 - 5))),
        memoryUsage: Math.min(100, Math.max(10, prev.memoryUsage + (Math.random() * 5 - 2))),
        networkLatency: Math.max(1, prev.networkLatency + (Math.random() * 10 - 5)),
        threatLevel: Math.random() > 0.95 ? 'ELEVATED' : (Math.random() > 0.98 ? 'CRITICAL' : 'LOW'),
        uplinkStability: Math.min(100, Math.max(50, prev.uplinkStability + (Math.random() * 2 - 1)))
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getBarColor = (val: number, invert = false) => {
    if (invert) return val < 30 ? 'bg-red-500' : (val < 70 ? 'bg-yellow-500' : 'bg-green-500');
    return val > 80 ? 'bg-red-500' : (val > 50 ? 'bg-yellow-500' : 'bg-green-500');
  };

  return (
    <div className="border-r border-green-900/50 h-full p-4 flex flex-col gap-6 bg-black/80 backdrop-blur text-xs font-mono select-none">
      <div className="mb-4">
        <h2 className="text-green-500 font-bold text-lg border-b border-green-800 pb-2 mb-2">SYS_MONITOR</h2>
        <div className="text-[10px] text-green-700">UPTIME: {new Date().toISOString().split('T')[1].split('.')[0]}</div>
      </div>

      {/* CPU */}
      <div className="space-y-1">
        <div className="flex justify-between text-green-400">
          <span className="flex items-center gap-2"><Cpu size={14} /> CPU_CORE_01</span>
          <span>{status.cpuLoad.toFixed(1)}%</span>
        </div>
        <div className="h-1 w-full bg-green-900/30">
          <div 
            className={`h-full ${getBarColor(status.cpuLoad)} transition-all duration-300`} 
            style={{ width: `${status.cpuLoad}%` }}
          />
        </div>
      </div>

      {/* Memory */}
      <div className="space-y-1">
        <div className="flex justify-between text-green-400">
          <span className="flex items-center gap-2"><HardDrive size={14} /> RAM_ALLOC</span>
          <span>{status.memoryUsage.toFixed(1)}%</span>
        </div>
        <div className="h-1 w-full bg-green-900/30">
          <div 
            className={`h-full ${getBarColor(status.memoryUsage)} transition-all duration-300`} 
            style={{ width: `${status.memoryUsage}%` }}
          />
        </div>
      </div>

      {/* Network */}
      <div className="space-y-1">
        <div className="flex justify-between text-green-400">
          <span className="flex items-center gap-2"><Activity size={14} /> LATENCY</span>
          <span>{status.networkLatency.toFixed(0)}ms</span>
        </div>
        <div className="flex gap-0.5 mt-1 h-3">
          {[...Array(10)].map((_, i) => (
             <div 
               key={i} 
               className={`flex-1 ${i < status.uplinkStability / 10 ? 'bg-green-500' : 'bg-green-900/20'}`}
             />
          ))}
        </div>
      </div>

      {/* Threat Level */}
      <div className="mt-4 border border-green-900 p-3 bg-green-900/10">
        <div className="flex items-center gap-2 mb-2 text-green-400">
          <ShieldAlert size={14} /> THREAT_ANALYSIS
        </div>
        <div className={`text-center font-bold text-lg animate-pulse ${
          status.threatLevel === 'LOW' ? 'text-green-500' : 
          status.threatLevel === 'ELEVATED' ? 'text-yellow-500' : 'text-red-600 alert-glow'
        }`}>
          {status.threatLevel}
        </div>
      </div>

      <div className="mt-auto opacity-50">
        <div className="flex items-center gap-2 text-green-600 mb-2">
          <Zap size={14} /> PWR_GRID: STABLE
        </div>
        <div className="text-[10px] text-green-800 break-all">
          ID: {Math.random().toString(36).substring(7).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;