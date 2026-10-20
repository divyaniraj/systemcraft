import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Check, 
  Trophy, 
  ShieldCheck 
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const currentUser = useGameStore((s) => s.currentUser);
  const usersList = useGameStore((s) => s.usersList);
  const switchUser = useGameStore((s) => s.switchUser);
  const createUser = useGameStore((s) => s.createUser);
  const userProgress = useGameStore((s) => s.userProgress);

  const [newUsername, setNewUsername] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim()) {
      createUser(newUsername.trim());
      setNewUsername('');
      setIsCreating(false);
    }
  };

  const getCompletedCountForUser = (userId: string) => {
    // Check progress for this user
    let count = 0;
    const progress = userId === currentUser.id ? userProgress : {};
    Object.values(progress).forEach((levelsMap) => {
      Object.values(levelsMap).forEach((lvl) => {
        if (lvl.isCompleted) count++;
      });
    });
    return count;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div 
        className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl text-slate-100 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg"
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                Engineer Profile & Progress
              </h2>
              <p className="text-xs text-slate-400">
                Logged in as <b className="text-slate-200">{currentUser.username}</b>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1">
          {/* Active Profile Stats */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Levels Solved</div>
                <div className="text-base font-black font-mono text-emerald-400">
                  {getCompletedCountForUser(currentUser.id)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Architect Tier</div>
                <div className="text-xs font-bold text-slate-200">
                  {getCompletedCountForUser(currentUser.id) > 6 ? 'Senior Staff' : getCompletedCountForUser(currentUser.id) > 2 ? 'L5 Systems' : 'L4 Associate'}
                </div>
              </div>
            </div>
          </div>

          {/* Switch User List */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Switch Engineer Profile</span>
              <span className="text-[10px] text-slate-500">{usersList.length} profiles</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {usersList.map((user) => {
                const isActive = user.id === currentUser.id;

                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      if (!isActive) switchUser(user.id);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'border-cyan-500/50 bg-cyan-950/20 shadow-sm'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: user.avatarColor }}
                      >
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{user.username}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Created {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400">
                        <Check className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 hover:text-slate-300">
                        Switch
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create New User */}
          {isCreating ? (
            <form onSubmit={handleCreate} className="p-3.5 rounded-xl border border-indigo-500/40 bg-indigo-950/20 space-y-3">
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" /> Create New Architect Profile
              </div>
              <input
                type="text"
                autoFocus
                placeholder="Enter your name / handle..."
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newUsername.trim()}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition"
                >
                  Save Profile
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-800/40 text-xs font-bold text-slate-300 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span>Add New Player Profile</span>
            </button>
          )}
        </div>

        {/* FOOTER */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="text-[11px] text-slate-500">
            Designs & progress auto-save locally to this profile.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
