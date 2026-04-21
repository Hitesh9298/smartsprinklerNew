'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Droplets, Power, Zap, Filter, Activity, Waves, Settings, TrendingUp } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const sendPumpCommand = async (action: string) => {
  const response = await fetch("https://smarthublite.vercel.app/api/device/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      device_id: "garden_pump_01",
      command: { action: action }
    })
  });
  return response.json();
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [commandStatus, setCommandStatus] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');

  const { data: status } = useSWR(
    'https://smarthublite.vercel.app/api/device/status?device_id=garden_pump_01',
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: history } = useSWR(
    'https://smarthublite.vercel.app/api/device/history?device_id=garden_pump_01',
    fetcher,
    { refreshInterval: 10000 }
  );

  const handleCommand = async (action: string) => {
    setCommandStatus('Sending command...');
    try {
      await sendPumpCommand(action);
      setCommandStatus('Command queued');
      setTimeout(() => setCommandStatus(''), 3000);
    } catch (error) {
      setCommandStatus('Command failed');
      setTimeout(() => setCommandStatus(''), 3000);
    }
  };

  const moisture = status?.data?.moisture || 0;
  const pumpState = status?.data?.pump_state || 'OFF';
  const mode = status?.data?.mode || 'AUTOMATIC';
  const condition = status?.data?.condition || 'WET';

  // Filter history data
  const filteredHistory = history?.filter((entry: any) => {
    if (entry.data.status === 'command_executed') {
      return true;
    }
    const modeMatch = modeFilter === 'all' || entry.data.mode === modeFilter;
    const stateMatch = stateFilter === 'all' || entry.data.pump_state === stateFilter;
    return modeMatch && stateMatch;
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  SmartHub Garden
                </h1>
                <p className="text-sm text-gray-500">Device: garden_pump_01</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${status ? 'bg-orange-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-600">{status ? 'Connected' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="flex space-x-2 mb-8">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'monitor' 
                ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-lg shadow-orange-200' 
                : 'bg-white/70 text-gray-600 hover:bg-white hover:shadow-md'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Live Monitor</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'history' 
                ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-lg shadow-orange-200' 
                : 'bg-white/70 text-gray-600 hover:bg-white hover:shadow-md'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>History</span>
          </button>
        </div>

        {activeTab === 'monitor' && (
          <div className="space-y-8">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Moisture Card */}
              <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-red-100/20"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-300 to-red-300 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Droplets className="h-6 w-6 text-white" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      condition === 'DRY' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {condition}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Soil Moisture</p>
                    <p className="text-3xl font-bold text-gray-900">{moisture}</p>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          condition === 'DRY' 
                            ? 'bg-gradient-to-r from-red-400 to-red-500' 
                            : 'bg-gradient-to-r from-orange-300 to-orange-400'
                        }`}
                        style={{ width: `${Math.min((moisture / 4095) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {condition === 'DRY' ? '🌵 Needs watering' : '💧 Well hydrated'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pump Status Card */}
              <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className={`absolute inset-0 ${
                  pumpState === 'ON' 
                    ? 'bg-gradient-to-br from-orange-200/20 to-red-200/20' 
                    : 'bg-gradient-to-br from-gray-100/20 to-gray-200/20'
                }`}></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 ${
                      pumpState === 'ON' 
                        ? 'bg-gradient-to-r from-orange-400 to-red-400 animate-pulse' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                      <Power className="h-6 w-6 text-white" />
                    </div>
                    <div className={`w-4 h-4 rounded-full ${
                      pumpState === 'ON' ? 'bg-red-400 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Pump Status</p>
                    <p className={`text-3xl font-bold ${
                      pumpState === 'ON' ? 'text-red-600' : 'text-gray-600'
                    }`}>{pumpState}</p>
                    <p className="text-xs text-gray-500">
                      {pumpState === 'ON' ? '⚡ Active irrigation' : '⏸️ Standby mode'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mode Card */}
              <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className={`absolute inset-0 ${
                  mode === 'MANUAL' 
                    ? 'bg-gradient-to-br from-red-200/20 to-red-300/20' 
                    : 'bg-gradient-to-br from-orange-100/20 to-orange-200/20'
                }`}></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                      mode === 'MANUAL' 
                        ? 'bg-gradient-to-r from-red-400 to-red-500' 
                        : 'bg-gradient-to-r from-orange-300 to-orange-400'
                    }`}>
                      {mode === 'MANUAL' ? <Settings className="h-6 w-6 text-white" /> : <Zap className="h-6 w-6 text-white" />}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      mode === 'MANUAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {mode === 'MANUAL' ? '10s Override' : 'Auto'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Operation Mode</p>
                    <p className={`text-2xl font-bold ${
                      mode === 'MANUAL' ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {mode === 'MANUAL' ? 'Manual' : 'Automatic'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {mode === 'MANUAL' ? '🎮 Manual control active' : '🤖 Smart automation'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50/30 to-red-50/30"></div>
              <div className="relative">
                <div className="flex items-center justify-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Pump Control</h2>
                </div>
                
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {/* Toggle Switch */}
                    <div className={`w-32 h-16 rounded-full p-2 transition-all duration-300 cursor-pointer ${
                      pumpState === 'ON' 
                        ? 'bg-gradient-to-r from-orange-300 to-red-400' 
                        : 'bg-gray-300'
                    }`}
                    onClick={() => handleCommand(pumpState === 'ON' ? 'pump_off' : 'pump_on')}
                    >
                      <div className={`w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform ${
                        pumpState === 'ON' ? 'translate-x-16' : 'translate-x-0'
                      }`}>
                        <Power className={`h-6 w-6 ${
                          pumpState === 'ON' ? 'text-red-500' : 'text-gray-400'
                        }`} />
                      </div>
                    </div>
                    
                    {/* Labels */}
                    <div className="flex justify-between mt-4 px-2">
                      <span className={`text-sm font-medium ${
                        pumpState === 'OFF' ? 'text-gray-700' : 'text-gray-400'
                      }`}>OFF</span>
                      <span className={`text-sm font-medium ${
                        pumpState === 'ON' ? 'text-red-600' : 'text-gray-400'
                      }`}>ON</span>
                    </div>
                  </div>
                </div>
                
                {/* Status Display */}
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-700 mb-2">Current Status</p>
                  <div className={`inline-flex items-center px-6 py-3 rounded-full font-bold text-lg ${
                    pumpState === 'ON' 
                      ? 'bg-gradient-to-r from-orange-200 to-red-200 text-red-700' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      pumpState === 'ON' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                    {pumpState === 'ON' ? 'PUMP ACTIVE' : 'PUMP STANDBY'}
                  </div>
                </div>
                
                {commandStatus && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 text-red-800 rounded-xl flex items-center justify-center space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="font-medium">{commandStatus}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 to-red-100/20"></div>
            <div className="relative p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Activity History</h2>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <select 
                    value={modeFilter} 
                    onChange={(e) => setModeFilter(e.target.value)}
                    className="px-4 py-2 bg-white/80 border border-orange-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Modes</option>
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                  <select 
                    value={stateFilter} 
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="px-4 py-2 bg-white/80 border border-orange-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All States</option>
                    <option value="ON">Pump ON</option>
                    <option value="OFF">Pump OFF</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-xl border border-orange-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
                        <th className="text-left p-4 font-semibold text-gray-700">Time</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Type</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Moisture</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Condition</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Pump</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Mode</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {filteredHistory.map((entry: any, index: number) => {
                        const isCommandExecution = entry.data.status === 'command_executed';
                        
                        return (
                          <tr key={entry._id || index} className={`border-b border-orange-100 hover:bg-orange-50/30 transition-colors duration-200 ${
                            isCommandExecution ? 'bg-red-50/30' : ''
                          }`}>
                            <td className="p-4 text-sm text-gray-600">
                              {new Date(entry.timestamp).toLocaleString()}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                isCommandExecution 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {isCommandExecution ? '⚙️ Command' : '📊 Sensor'}
                              </span>
                            </td>
                            <td className="p-4 text-sm font-medium text-gray-900">
                              {isCommandExecution ? '-' : entry.data.moisture}
                            </td>
                            <td className="p-4">
                              {isCommandExecution ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  ✅ Executed
                                </span>
                              ) : (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  entry.data.condition === 'DRY' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {entry.data.condition === 'DRY' ? '🌵 DRY' : '💧 WET'}
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              {isCommandExecution ? '-' : (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  entry.data.pump_state === 'ON' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {entry.data.pump_state === 'ON' ? '⚡ ON' : '⏸️ OFF'}
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              {isCommandExecution ? '-' : (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  entry.data.mode === 'MANUAL' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {entry.data.mode === 'MANUAL' ? '🎮 Manual' : '🤖 Auto'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredHistory.length === 0 && (
                  <div className="text-center py-12">
                    <Waves className="h-12 w-12 text-orange-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No activity data found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your filters or check back later</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}