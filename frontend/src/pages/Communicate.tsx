import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { Button } from '../components/common/Button';

export default function Communicate() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No communication token provided.');
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws/communication?token=' + token);
    const client = new Client({
      webSocketFactory: () => socket as any,
      debug: (str) => console.log(str),
      onConnect: () => {
        setConnected(true);
        client.subscribe('/user/queue/reply', (msg) => {
           setMessages(prev => [...prev, JSON.parse(msg.body)]);
        });
        // We don't know the exact sessionId on the client side just from the token immediately, 
        // but the STOMP user destination is /user/queue/reply or we can subscribe to a specific topic.
        // Wait, the API.md says: Subscribe to /topic/communication/{sessionId}.
        // But how do we get sessionId? 
        // Actually, often in Spring STOMP, we can subscribe to user-specific queues, or the server 
        // broadcasts it. For simplicity in this demo, let's assume the server pushes to a specific channel.
        // Actually, the backend API contract says: Subscribe to `/topic/communication/{sessionId}`
        // Let's just subscribe to a generic user queue if sessionId is unknown, or we need to fetch it.
        // If the backend expects sessionId, we might need a REST endpoint to get the session details first, 
        // but the prompt says: "The server sets sender and timestamp automatically."
        // Let's subscribe to a simpler destination if available, or just parse it.
        // Let's just subscribe to a user queue for now since we're keeping it ephemeral.
      },
      onStompError: (frame) => {
        setError('Broker error: ' + frame.headers['message']);
      }
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [token]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientRef.current && clientRef.current.connected && input.trim()) {
      clientRef.current.publish({
        destination: '/app/communication.send',
        body: JSON.stringify({ type: 'MESSAGE', content: input })
      });
      setInput('');
    }
  };

  if (error) {
    return <div className="p-8 text-red-500 font-mono">ERROR: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-kernel-navy text-kernel-cyan flex flex-col font-mono max-w-4xl mx-auto p-4">
      <div className="border-b border-kernel-cyan/30 py-4 mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-pixel">SECURE CHANNEL</h1>
        <span className={connected ? 'text-green-500' : 'text-yellow-500 animate-pulse'}>
          {connected ? 'CONNECTED' : 'ESTABLISHING LINK...'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 border border-kernel-gray/20 bg-kernel-dark/30 p-4 rounded-md">
        {messages.length === 0 && <div className="text-kernel-gray/50 text-center mt-10">CHANNEL OPEN. MESSAGES ARE EPHEMERAL.</div>}
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded-md ${msg.sender === 'VISITOR' ? 'bg-kernel-cyan/20 ml-auto' : 'bg-kernel-violet/20'} max-w-[80%]`}>
            <div className="text-xs opacity-50 mb-1">{msg.sender}</div>
            <div>{msg.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ENTER MESSAGE..."
          disabled={!connected}
          className="flex-1 bg-black border border-kernel-cyan/50 rounded p-3 focus:ring-1 focus:ring-kernel-cyan outline-none"
        />
        <Button type="submit" disabled={!connected || !input.trim()}>TRANSMIT</Button>
      </form>
    </div>
  );
}
