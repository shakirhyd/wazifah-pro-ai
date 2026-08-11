import React, { useState } from 'react';
import { DailySummary, WazifahSession } from '../types/wazifah';
import { BarChart3, X, Flame, Trophy, Calendar, Clock, Award } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailySummaries: DailySummary[];
  streakInfo: { currentStreak: number; longestStreak: number };
  sessions: WazifahSession[];
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  dailySummaries,
  streakInfo,
  sessions,
}) => {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(7);

  if (!isOpen) return null;

  const chartData = dailySummaries.slice(-rangeDays).map(d => {
    const label = d.date.slice(5); // MM-DD
    return {
      date: label,
      Counts: d.totalCount,
      Minutes: Math.round(d.totalDurationSeconds / 60),
    };
  });

  const totalCounts = sessions.reduce((sum, s) => sum + s.count, 0);
  const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);

  // Top Wazifahs
  const wazifahCounts: Record<string, number> = {};
  sessions.forEach(s => {
    wazifahCounts[s.wazifahTitle] = (wazifahCounts[s.wazifahTitle] || 0) + s.count;
  });

  const topWazifahs = Object.entries(wazifahCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Per-Dhikr Aggregate Timing Metrics across all sessions
  const dhikrTimingMap: Record<string, { title: string; totalCount: number; totalSeconds: number }> = {};
  sessions.forEach(s => {
    if (s.dhikrDetails && s.dhikrDetails.length > 0) {
      s.dhikrDetails.forEach(d => {
        if (!dhikrTimingMap[d.dhikrTitle]) {
          dhikrTimingMap[d.dhikrTitle] = { title: d.dhikrTitle, totalCount: 0, totalSeconds: 0 };
        }
        dhikrTimingMap[d.dhikrTitle].totalCount += d.count;
        dhikrTimingMap[d.dhikrTitle].totalSeconds += d.durationSeconds;
      });
    }
  });

  const dhikrTimingList = Object.values(dhikrTimingMap).sort((a, b) => b.totalSeconds - a.totalSeconds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Dhikr Reports & Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Highlight Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1 text-amber-400 font-semibold">
                <Flame className="w-3.5 h-3.5" />
                <span>Current Streak</span>
              </div>
              <div className="text-xl font-extrabold text-slate-100">{streakInfo.currentStreak} Days</div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Trophy className="w-3.5 h-3.5" />
                <span>Best Streak</span>
              </div>
              <div className="text-xl font-extrabold text-slate-100">{streakInfo.longestStreak} Days</div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1 text-amber-300 font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>Total Recitations</span>
              </div>
              <div className="text-xl font-extrabold text-slate-100">{totalCounts}</div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1 text-blue-400 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Total Time</span>
              </div>
              <div className="text-xl font-extrabold text-slate-100">{totalMinutes} Mins</div>
            </div>
          </div>

          {/* Bar Chart Section */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200">Daily Recitation Progress</h3>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px]">
                {[7, 14, 30].map(days => (
                  <button
                    key={days}
                    onClick={() => setRangeDays(days as 7 | 14 | 30)}
                    className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                      rangeDays === days ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {days}D
                  </button>
                ))}
              </div>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                  />
                  <Bar dataKey="Counts" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Practiced Wazifahs */}
          {topWazifahs.length > 0 && (
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs">
              <h3 className="font-bold text-slate-200">Top Practiced Routines</h3>
              <div className="space-y-1.5 pt-1">
                {topWazifahs.map(([title, count], idx) => (
                  <div key={title} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{title}</span>
                    </div>
                    <span className="font-bold text-amber-300 font-mono">{count} counts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Spent per Dhikr Breakdown */}
          {dhikrTimingList.length > 0 && (
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs">
              <h3 className="font-bold text-slate-200">Time Spent per Dhikr</h3>
              <div className="space-y-1.5 pt-1">
                {dhikrTimingList.map(item => {
                  const secPerCount = item.totalCount > 0 && item.totalSeconds > 0
                    ? (item.totalSeconds / item.totalCount).toFixed(1)
                    : null;
                  const mins = Math.floor(item.totalSeconds / 60);
                  const secs = item.totalSeconds % 60;
                  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

                  return (
                    <div key={item.title} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">{item.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.totalCount} total counts</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-300 font-mono">⏱️ {timeStr}</div>
                        {secPerCount && (
                          <div className="text-[10px] text-emerald-400 font-mono">{secPerCount} s/count</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/50">
          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
