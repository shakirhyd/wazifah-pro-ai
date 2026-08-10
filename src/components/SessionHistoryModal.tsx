import React, { useState } from 'react';
import { WazifahSession } from '../types/wazifah';
import { History, Trash2, X, Clock, Zap, Calendar, Award } from 'lucide-react';

interface SessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: WazifahSession[];
  onDeleteSession: (sessionId: string) => void;
  onClearAll: () => void;
}

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onDeleteSession,
  onClearAll,
}) => {
  const [filterText, setFilterText] = useState('');

  if (!isOpen) return null;

  const filtered = sessions.filter(s =>
    s.wazifahTitle.toLowerCase().includes(filterText.toLowerCase())
  );

  const totalCounts = sessions.reduce((sum, s) => sum + s.count, 0);
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      return `${hrs}h ${mins % 60}m`;
    }
    return `${mins}m ${s}s`;
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Session History Log</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-slate-950/60 border-b border-slate-800/80 text-center text-xs">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Total Sessions</div>
            <div className="text-base font-bold text-amber-300 mt-0.5">{sessions.length}</div>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Total Counts</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">{totalCounts}</div>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Total Time</div>
            <div className="text-base font-bold text-slate-100 mt-0.5">{formatDuration(totalSeconds)}</div>
          </div>
        </div>

        {/* Filter Input */}
        {sessions.length > 0 && (
          <div className="px-4 py-2.5 border-b border-slate-800/60">
            <input
              type="text"
              placeholder="Filter by Wazifah title..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-xs rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-amber-400"
            />
          </div>
        )}

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No saved sessions yet. Start a session and click "Save Session"!
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No sessions match "{filterText}".
            </div>
          ) : (
            filtered.map(s => (
              <div
                key={s.id}
                className="p-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center justify-between gap-3 transition-colors text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100">{s.wazifahTitle}</h3>
                    {s.arabicText && (
                      <span className="font-serif text-amber-200 text-sm font-semibold">
                        {s.arabicText}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Award className="w-3 h-3" />
                      {s.count} counts
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDuration(s.durationSeconds)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      {s.speedCountPerMin || Math.round((s.count / Math.max(1, s.durationSeconds)) * 60)}/min
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(s.completedAt)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteSession(s.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete this session record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-950/50">
          {sessions.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all session history logs? This cannot be undone.')) {
                  onClearAll();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
