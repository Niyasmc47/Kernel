import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '../components/common/Button';
import { api, setAuthToken, getAuthToken } from '../api';

export default function AdminCommandCenter() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string>(getAuthToken() || '');
  const [password, setPassword] = useState('');

  // Check if root access was unlocked through the secret method or if an active in-memory token exists
  const isUnlocked = typeof window !== 'undefined' && sessionStorage.getItem('kernel_root_unlocked') === 'true';
  const hasToken = !!token;

  if (!isUnlocked && !hasToken) {
    return <Navigate to="/" replace />;
  }

  const loginMutation = useMutation({
    mutationFn: async (pwd: string) => {
      const { data } = await api.post('/api/admin/login', { password: pwd });
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
          onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(password); }}
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

  return (
    <div className="min-h-screen bg-[#070a0f] text-gray-200 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 border-b border-white/10 pb-5">
          <div>
            <div className="font-pixel text-[9px] text-emerald-400 tracking-[0.2em] mb-1">SEC-CLEARANCE // LEVEL 5</div>
            <h1 className="text-3xl font-cinematic text-white font-normal">COMMAND CENTER</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs"
            >
              {isFetching ? 'SYNCING...' : '🔄 REFRESH'}
            </Button>
            <Button 
              variant="ghost" 
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

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 font-sans text-xs uppercase tracking-wider">
                <th className="p-4">ID</th>
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
              {grievances?.map((g: any) => (
                <tr key={g.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-xs text-gray-400">{g.id ? g.id.substring(0,8) : '...'}</td>
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
                  </td>
                  <td className="p-4 text-emerald-400/90 text-xs font-mono">{g.category}</td>
                  <td className={`p-4 font-semibold text-xs ${g.urgency === 'CRITICAL' ? 'text-red-400 animate-pulse' : g.urgency === 'HIGH' ? 'text-orange-400' : 'text-gray-300'}`}>{g.urgency}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-xs border border-white/10 bg-white/5 font-mono">
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
              {(!grievances || grievances.length === 0) && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500 font-sans text-sm">
                    No active grievances recorded in the Lattice.
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
