import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '../components/common/Button';
import { api, setAuthToken, getAuthToken } from '../api';

export default function AdminCommandCenter() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string>(getAuthToken() || '');
  const [password, setPassword] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loginMutation = useMutation({
    mutationFn: async (pwd: string) => {
      const { data } = await api.post('/api/admin/login', { password: pwd.trim() });
      return data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setAuthToken(data.token);
    }
  });

  const { data: grievances, refetch, isFetching } = useQuery({
    queryKey: ['grievances'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/api/admin/grievances');
        return data.content;
      } catch (err: any) {
        if (err?.response?.status === 401) {
          setToken('');
          setAuthToken(null);
        }
        throw err;
      }
    },
    enabled: !!token,
    retry: false,
    refetchInterval: 5000,
  });

  const enableCommMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/api/admin/grievances/${id}/communication/enable`);
      return { data };
    },
    onSuccess: () => {
      refetch();
    }
  });

  const closeCommMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/admin/grievances/${id}/communication/close`);
    },
    onSuccess: () => {
      refetch();
    }
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-[#070a0f] text-gray-200 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        
        <form 
          onSubmit={(e) => { e.preventDefault(); if (password.trim()) loginMutation.mutate(password); }}
          className="relative z-10 w-full max-w-md bg-black/60 p-8 rounded-2xl border border-white/10 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center space-x-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-pixel text-[9px] tracking-[0.25em] text-emerald-400 uppercase">
              SECURITY PROTOCOL
            </span>
          </div>

          <h2 className="text-3xl font-cinematic text-white font-normal mb-2">ROOT ACCESS</h2>
          <p className="font-sans text-xs text-gray-400 mb-6">
            Enter authorized administrator key to access command center.
          </p>

          <input 
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="ENTER AUTH KEY"
            className="w-full bg-white/5 border border-white/10 p-3 mb-3 rounded-xl focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/50 text-white font-mono text-sm outline-none transition-all"
            autoFocus
          />

          {loginMutation.isError && (
            <div className="text-red-400 text-xs mb-3 font-sans flex items-center space-x-1.5">
              <span>⚠️</span>
              <span>{(loginMutation.error as any)?.response?.data?.message || "Invalid authentication key. Access denied."}</span>
            </div>
          )}

          <Button type="submit" disabled={loginMutation.isPending || !password.trim()} className="w-full">
            {loginMutation.isPending ? 'AUTHORIZING...' : 'AUTHORIZE ACCESS →'}
          </Button>
        </form>
      </div>
    );
  }

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Just now';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' • ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  const filteredGrievances = (grievances || []).filter((g: any) => {
    if (filterStatus !== 'ALL' && g.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = g.name?.toLowerCase().includes(q);
      const matchEmail = g.email?.toLowerCase().includes(q);
      const matchLoc = g.location?.toLowerCase().includes(q);
      const matchMsg = (g.originalGrievance || g.aiSummary || '').toLowerCase().includes(q);
      const matchCat = g.category?.toLowerCase().includes(q);
      return matchName || matchEmail || matchLoc || matchMsg || matchCat;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#070a0f] text-gray-200 p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/10 pb-5">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-sm"></div>
              <img 
                src="/kernel-logo.jpg" 
                alt="Kernel Sigil" 
                className="w-full h-full object-cover rounded-xl border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-0.5 sm:mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <div className="font-pixel text-[8px] sm:text-[9px] text-emerald-400 tracking-[0.2em] uppercase">
                  SEC-CLEARANCE // LEVEL 5 • FULL LATTICE HISTORY
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-cinematic text-white font-normal">COMMAND CENTER</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] sm:text-xs font-mono text-gray-300">
              LOGGED: <span className="text-emerald-400 font-bold ml-1">{grievances?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="text-xs px-2.5 py-1"
              >
                {isFetching ? 'SYNCING...' : '🔄 REFRESH'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs px-2.5 py-1"
                onClick={() => { 
                  setToken(''); 
                  setAuthToken(null);
                  sessionStorage.removeItem('kernel_root_unlocked');
                  navigate('/', { replace: true });
                }}
              >
                LOGOUT
              </Button>
            </div>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10 overflow-x-auto">
            {['ALL', 'NEW', 'REVIEWING', 'RESOLVED', 'CLOSED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, location, or issue..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-base sm:text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-400/60 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Mobile Cards View (< md screens) */}
        <div className="md:hidden space-y-3.5 mb-8">
          {filteredGrievances?.map((g: any) => (
            <div 
              key={g.id}
              className="p-4 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md shadow-lg space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                <div>
                  <div className="font-semibold text-white text-sm">{g.name}</div>
                  <div className="text-xs text-gray-400 font-mono break-all">{g.email}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {g.location || 'Unknown location'} {g.age ? `• Age: ${g.age}` : ''}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] border font-mono font-bold ${
                    g.urgency === 'CRITICAL' ? 'border-red-500/40 bg-red-500/20 text-red-400 animate-pulse' :
                    g.urgency === 'HIGH' ? 'border-orange-500/40 bg-orange-500/20 text-orange-400' :
                    'border-white/10 bg-white/5 text-gray-300'
                  }`}>
                    {g.urgency}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">
                    {formatDate(g.createdAt)}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-mono text-emerald-400/90 mb-1">
                  CATEGORY: {g.category}
                </div>
                <p className="text-xs text-gray-200 leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                  {g.aiSummary || g.originalGrievance || 'No summary available'}
                </p>
              </div>

              {g.voiceNoteBase64 && (
                <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                  <span className="text-[10px] font-mono text-emerald-400 block mb-1">
                    🎙️ VOICE RECORDING:
                  </span>
                  <audio 
                    controls 
                    src={g.voiceNoteBase64.startsWith('data:') ? g.voiceNoteBase64 : `data:${g.voiceNoteContentType || 'audio/webm'};base64,${g.voiceNoteBase64}`} 
                    className="h-7 w-full rounded" 
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] border font-mono ${
                  g.status === 'NEW' 
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : g.status === 'RESOLVED'
                    ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                    : 'border-white/10 bg-white/5 text-gray-400'
                }`}>
                  {g.status}
                </span>

                <div className="flex items-center space-x-1.5">
                  {g.communicationStatus === 'DISABLED' && (
                    <Button size="sm" variant="outline" className="text-xs py-1" onClick={() => enableCommMutation.mutate(g.id)}>
                      ENABLE COMM
                    </Button>
                  )}
                  {g.communicationStatus === 'ACTIVE' && (
                    <div className="flex items-center space-x-1.5">
                      <Button size="sm" variant="secondary" className="text-xs py-1" onClick={() => window.open(`/communicate?token=kernelctygz&grievanceId=${g.id}`)}>
                        JOIN COMM
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 text-xs px-2 py-1" onClick={() => closeCommMutation.mutate(g.id)}>
                        CLOSE
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {(!filteredGrievances || filteredGrievances.length === 0) && (
            <div className="p-8 text-center text-gray-500 font-sans text-xs bg-black/40 rounded-2xl border border-white/10">
              No matching grievances found in the Lattice history.
            </div>
          )}
        </div>

        {/* Desktop Table View (>= md screens) */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 font-sans text-xs uppercase tracking-wider">
                <th className="p-4">Logged</th>
                <th className="p-4">Citizen</th>
                <th className="p-4">Location</th>
                <th className="p-4">Message / AI Summary</th>
                <th className="p-4">Category</th>
                <th className="p-4">Urgency</th>
                <th className="p-4">Status</th>
                <th className="p-4">Comm Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrievances?.map((g: any) => (
                <tr key={g.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(g.createdAt)}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{g.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{g.email}</div>
                    {g.age && <div className="text-[11px] text-gray-500">Age: {g.age}</div>}
                  </td>
                  <td className="p-4 text-xs text-gray-300">{g.location || 'Unknown'}</td>
                  <td className="p-4 max-w-xs">
                    <div className="text-xs text-gray-200 line-clamp-2" title={g.originalGrievance || g.aiSummary}>
                      {g.aiSummary || g.originalGrievance || 'No summary available'}
                    </div>
                    {g.voiceNoteBase64 && (
                      <div className="mt-2 flex flex-col space-y-1">
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                          <span>🎙️ VOICE TRANSMISSION:</span>
                        </span>
                        <audio 
                          controls 
                          src={g.voiceNoteBase64.startsWith('data:') ? g.voiceNoteBase64 : `data:${g.voiceNoteContentType || 'audio/webm'};base64,${g.voiceNoteBase64}`} 
                          className="h-7 w-48 rounded opacity-90 hover:opacity-100 transition-opacity" 
                        />
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-emerald-400/90 text-xs font-mono">{g.category}</td>
                  <td className={`p-4 font-semibold text-xs ${g.urgency === 'CRITICAL' ? 'text-red-400 animate-pulse' : g.urgency === 'HIGH' ? 'text-orange-400' : 'text-gray-300'}`}>{g.urgency}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs border font-mono ${
                      g.status === 'NEW' 
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                        : g.status === 'RESOLVED'
                        ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                        : 'border-white/10 bg-white/5 text-gray-400'
                    }`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-300 font-mono">{g.communicationStatus}</td>
                  <td className="p-4 space-x-2 whitespace-nowrap">
                    {g.communicationStatus === 'DISABLED' && (
                      <Button size="sm" variant="outline" onClick={() => enableCommMutation.mutate(g.id)}>ENABLE COMM</Button>
                    )}
                    {g.communicationStatus === 'ACTIVE' && (
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => window.open(`/communicate?token=kernelctygz&grievanceId=${g.id}`)}>JOIN COMM</Button>
                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs px-2 py-1" onClick={() => closeCommMutation.mutate(g.id)}>CLOSE</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {(!filteredGrievances || filteredGrievances.length === 0) && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500 font-sans text-sm">
                    No matching grievances found in the Lattice history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
