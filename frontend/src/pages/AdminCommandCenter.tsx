import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '../components/common/Button';
import { api } from '../api';

export default function AdminCommandCenter() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (pwd: string) => {
      const { data } = await api.post('/api/admin/login', { password: pwd });
      return data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      localStorage.setItem('adminToken', data.token); // The prompt says "Never store admin password in frontend", token is fine in localStorage for testing, but prompt says "Do not bypass backend auth. Do not trust frontend state". We are storing JWT.
    }
  });

  const { data: grievances, refetch } = useQuery({
    queryKey: ['grievances'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/grievances');
      return data.content;
    },
    enabled: !!token,
  });

  const enableCommMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/api/admin/grievances/${id}/communication/enable`);
      return { data };
    },
    onSuccess: ({ data }) => {
      alert(`Communication enabled! Admin token: ${data.adminToken}\nVisitor link: ${data.visitorLink}`);
      refetch();
    }
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-kernel-navy text-kernel-cyan flex items-center justify-center font-mono">
        <form 
          onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(password); }}
          className="bg-kernel-dark/80 p-8 rounded-lg border border-kernel-cyan/30"
        >
          <h2 className="text-2xl font-pixel mb-6">ROOT ACCESS</h2>
          <input 
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="ENTER AUTH KEY"
            className="w-full bg-black border border-kernel-cyan/50 p-3 mb-4 rounded focus:ring-1 focus:ring-kernel-cyan outline-none"
          />
          <Button type="submit" disabled={loginMutation.isPending} className="w-full">
            {loginMutation.isPending ? 'AUTHORIZING...' : 'LOGIN'}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kernel-navy text-kernel-gray p-8 font-mono">
      <div className="flex justify-between items-center mb-8 border-b border-kernel-cyan/30 pb-4">
        <h1 className="text-3xl font-pixel text-kernel-cyan">COMMAND CENTER</h1>
        <Button variant="ghost" onClick={() => { setToken(''); localStorage.removeItem('adminToken'); }}>LOGOUT</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-kernel-gray/30 text-kernel-violet">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Urgency</th>
              <th className="p-3">Status</th>
              <th className="p-3">Comm Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {grievances?.map((g: any) => (
              <tr key={g.id} className="border-b border-kernel-dark hover:bg-kernel-dark/30 transition-colors">
                <td className="p-3 text-xs">{g.id.substring(0,8)}...</td>
                <td className="p-3">{g.name}</td>
                <td className="p-3">{g.category}</td>
                <td className={`p-3 font-bold ${g.urgency === 'CRITICAL' ? 'text-red-500 animate-pulse' : g.urgency === 'HIGH' ? 'text-kernel-orange' : ''}`}>{g.urgency}</td>
                <td className="p-3">{g.status}</td>
                <td className="p-3">{g.communicationStatus}</td>
                <td className="p-3 space-x-2">
                  {g.communicationStatus === 'DISABLED' && (
                    <Button size="sm" variant="outline" onClick={() => enableCommMutation.mutate(g.id)}>ENABLE COMM</Button>
                  )}
                  {g.communicationStatus === 'ACTIVE' && (
                    <Button size="sm" variant="secondary" onClick={() => window.open(`/communicate?token=${prompt('Enter your admin token from the enable step:')}`)}>JOIN COMM</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
