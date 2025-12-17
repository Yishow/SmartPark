import React, { useState } from 'react';
import { ParkingSpot, ParkingStats, SpotType } from '../types';
import { Settings, Play, Pause, RotateCcw, Sparkles, Loader2, Palette } from 'lucide-react';
import { analyzeParkingStatus } from '../services/geminiService';

interface ControlPanelProps {
  stats: ParkingStats;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onReset: () => void;
  selectedSpot: ParkingSpot | null;
  onUpdateSpot: (spotId: string, updates: Partial<ParkingSpot>) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  stats,
  isSimulating,
  onToggleSimulation,
  onReset,
  selectedSpot,
  onUpdateSpot,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAiAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAnalysis("");
    const result = await analyzeParkingStatus(stats);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const getPercentageColor = (percent: number) => {
    if (percent < 20) return 'text-red-600';
    if (percent < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const occupancyRate = stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-xl w-full md:w-80 lg:w-96 overflow-y-auto">
      
      {/* Header */}
      <div className="p-6 bg-slate-800 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          控制中心
        </h2>
        <p className="text-slate-400 text-sm mt-1">SmartPark System v1.0</p>
      </div>

      {/* Main Stats */}
      <div className="p-6 border-b border-slate-100">
        <div className="text-center mb-6">
          <div className="text-sm text-slate-500 mb-1">總剩餘車位數</div>
          <div className={`text-6xl font-black ${getPercentageColor(100 - occupancyRate)}`}>
            {String(stats.available).padStart(3, '0')}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-3 rounded-lg text-center">
                <div className="text-slate-500">一般車位</div>
                <div className="font-bold text-lg text-slate-700">{stats.breakdown.STANDARD.available}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-blue-500">身心障礙</div>
                <div className="font-bold text-lg text-blue-700">{stats.breakdown.DISABLED.available}</div>
            </div>
             <div className="bg-pink-50 p-3 rounded-lg text-center">
                <div className="text-pink-500">婦幼優先</div>
                <div className="font-bold text-lg text-pink-700">{stats.breakdown.PRIORITY.available}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-center">
                <div className="text-slate-500">佔用率</div>
                <div className="font-bold text-lg text-slate-700">{occupancyRate.toFixed(0)}%</div>
            </div>
        </div>
      </div>

      {/* Selected Spot Editor */}
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            車位編輯
        </h3>
        {selectedSpot ? (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">編號：{selectedSpot.label}</span>
                    <span className="text-xs bg-slate-200 px-2 py-1 rounded">{selectedSpot.type}</span>
                </div>
                
                <div>
                    <label className="text-xs text-slate-500 block mb-1">狀態</label>
                    <button 
                        onClick={() => onUpdateSpot(selectedSpot.id, { isOccupied: !selectedSpot.isOccupied })}
                        className={`w-full py-2 rounded-md font-medium text-white transition-colors ${selectedSpot.isOccupied ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                        {selectedSpot.isOccupied ? '車位已滿 (點擊清空)' : '車位空閒 (點擊佔用)'}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">自訂空位顏色</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={selectedSpot.customColorFree || '#84cc16'}
                                onChange={(e) => onUpdateSpot(selectedSpot.id, { customColorFree: e.target.value })}
                                className="w-full h-8 rounded cursor-pointer"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">自訂佔用顏色</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={selectedSpot.customColorOccupied || '#ef4444'}
                                onChange={(e) => onUpdateSpot(selectedSpot.id, { customColorOccupied: e.target.value })}
                                className="w-full h-8 rounded cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
                
                <div>
                    <label className="text-xs text-slate-500 block mb-1">更改類型</label>
                    <select 
                        value={selectedSpot.type}
                        onChange={(e) => onUpdateSpot(selectedSpot.id, { type: e.target.value as SpotType })}
                        className="w-full p-2 border rounded text-sm bg-white"
                    >
                        <option value={SpotType.STANDARD}>一般車位</option>
                        <option value={SpotType.DISABLED}>身心障礙專用</option>
                        <option value={SpotType.PRIORITY}>婦幼優先</option>
                        <option value={SpotType.EV}>電動車充電</option>
                    </select>
                </div>
            </div>
        ) : (
            <div className="text-slate-400 text-sm text-center py-4 italic">
                請在左側地圖點擊車位以進行編輯
            </div>
        )}
      </div>

      {/* Simulation Controls */}
      <div className="p-6 border-b border-slate-100">
        <h3 className="font-bold text-slate-700 mb-3">模擬控制</h3>
        <div className="flex gap-2">
            <button
                onClick={onToggleSimulation}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${isSimulating ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
            >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isSimulating ? '暫停模擬' : '開始模擬'}
            </button>
            <button
                onClick={onReset}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 border border-slate-200"
                title="重置所有車位"
            >
                <RotateCcw className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="p-6 flex-1 bg-gradient-to-b from-white to-indigo-50">
        <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Gemini AI 智能分析
        </h3>
        
        {!aiAnalysis && !isAnalyzing && (
            <button 
                onClick={handleAiAnalyze}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
                生成即時分析報告
            </button>
        )}

        {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-8 text-indigo-500">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-sm">AI 正在思考中...</span>
            </div>
        )}

        {aiAnalysis && (
            <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm text-sm text-slate-700 whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                {aiAnalysis}
                <button 
                    onClick={handleAiAnalyze} 
                    className="mt-4 text-xs text-indigo-600 hover:underline w-full text-right"
                >
                    重新分析
                </button>
            </div>
        )}
      </div>

    </div>
  );
};