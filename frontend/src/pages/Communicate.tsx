import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { Button } from '../components/common/Button';
import { api } from '../api';
import { Send, Shield, Lock, Radio, ArrowLeft, XCircle } from 'lucide-react';

interface SessionData {
  sessionId: string;
  role: 'ADMIN' | 'VISITOR';
  grievanceId?: string;
  expiresAt?: string;
  visitorConnected?: boolean;
  adminConnected?: boolean;
}

interface ChatMessage {
  type: 'JOIN' | 'LEAVE' | 'MESSAGE';
  sender: 'ADMIN' | 'VISITOR';
  content: string;
  timestamp?: string;
}

export default function Communicate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const grievanceId = searchParams.get('grievanceId');

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Step 1: Validate session & fetch session metadata
  useEffect(() => {
    if (!token) {
      setError('No communication token provided in the link.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchSession() {
      try {
        setLoading(true);
        const { data } = await api.get('/api/communication/session', {
          params: { token, grievanceId: grievanceId || undefined }
        });

        if (isMounted) {
          setSessionData(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          const msg = err?.response?.data?.error || 'Invalid, closed, or expired communication link.';
          setError(msg);
          setLoading(false);
        }
      }
    }

    fetchSession();

    return () => {
      isMounted = false;
    };
  }, [token, grievanceId]);

  // Step 2: Establish STOMP connection over SockJS once session data is resolved
  useEffect(() => {
    if (!sessionData || !token) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const socketEndpoint = `${baseUrl}/ws/communication?token=${encodeURIComponent(token)}${
      grievanceId ? `&grievanceId=${encodeURIComponent(grievanceId)}` : ''
    }`;

    const client = new Client({
      webSocketFactory: () => new (SockJS as any)(socketEndpoint),
      reconnectDelay: 4000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (import.meta.env.DEV) console.log('[STOMP]', str);
      },
      onConnect: () => {
        setConnected(true);
        setError(null);

        // Subscribe to this session's private topic
        client.subscribe(`/topic/communication/${sessionData.sessionId}`, (messageFrame) => {
          try {
            const body: ChatMessage = JSON.parse(messageFrame.body);
            setMessages((prev) => [...prev, body]);
          } catch (e) {
            console.error('Failed to parse incoming message frame', e);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP broker error:', frame);
        setError('Connection interrupted by broker: ' + (frame.headers['message'] || 'Unknown error'));
      }
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [sessionData, token, grievanceId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientRef.current || !clientRef.current.connected || !input.trim()) {
      return;
    }

    const payload = {
      type: 'MESSAGE',
      content: input.trim()
    };

    clientRef.current.publish({
      destination: '/app/communication.send',
      body: JSON.stringify(payload)
    });

    setInput('');
  };

  const formatTime = (ts?: string) => {
    if (!ts) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a0f] text-gray-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <div className="font-pixel text-[10px] tracking-[0.25em] text-emerald-400 uppercase">
            VERIFYING ENCRYPTED FREQUENCY...
          </div>
          <p className="text-xs text-gray-400 font-mono">Securing peer-to-peer session handshake</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-[#070a0f] text-gray-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute w-96 h-96 rounded-full bg-red-500/10 blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-md w-full bg-black/60 border border-red-500/20 rounded-2xl p-8 backdrop-blur-xl text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="font-cinematic text-2xl text-white mb-2 font-normal">CHANNEL UNAVAILABLE</h2>
          <p className="text-xs text-gray-400 font-mono mb-6 leading-relaxed">
            {error || 'This communication session has expired, has been closed by an administrator, or the authorization token is invalid.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              RETURN HOME
            </Button>
            {token?.toLowerCase().includes('kernel') && (
              <Button size="sm" onClick={() => navigate('/admin')}>
                COMMAND CENTER
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isCurrentAdmin = sessionData.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#070a0f] text-gray-200 flex flex-col font-sans relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(isCurrentAdmin ? '/admin' : '/')}
              className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    connected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 animate-pulse'
                  }`}
                />
                <h1 className="font-cinematic text-lg text-white font-normal tracking-wide">
                  ONE-ON-ONE SECURE RELAY
                </h1>
              </div>
              <div className="font-mono text-[10px] text-gray-500 flex items-center space-x-2 mt-0.5">
                <span>SESSION: {sessionData.sessionId.substring(0, 8)}...</span>
                <span>•</span>
                <span className={connected ? 'text-emerald-400' : 'text-amber-400'}>
                  {connected ? 'LIVE ENCRYPTED' : 'CONNECTING...'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-mono border flex items-center space-x-1.5 ${
                isCurrentAdmin
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>ROLE: {isCurrentAdmin ? 'KERNEL // CENTRAL' : 'VISITOR // CITIZEN'}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400 hover:text-red-400"
              onClick={() => navigate(isCurrentAdmin ? '/admin' : '/')}
            >
              EXIT
            </Button>
          </div>
        </div>
      </header>

      {/* Ephemeral Privacy Guarantee Notice */}
      <div className="relative z-10 bg-emerald-950/20 border-b border-emerald-500/10 py-1.5 px-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-[11px] font-mono text-emerald-400/80">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>EPHEMERAL CHANNEL // Zero logs retained. Transmissions exist in-memory only.</span>
        </div>
      </div>

      {/* Main Chat Container */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 rounded-2xl bg-black/30 border border-white/5 p-4 backdrop-blur-md shadow-inner custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-gray-500">
              <div className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center text-emerald-400/60 animate-pulse">
                <Radio className="w-5 h-5" />
              </div>
              <div className="font-pixel text-[10px] tracking-[0.2em] text-gray-400 uppercase">
                SECURE FREQUENCY SYNCHRONIZED
              </div>
              <p className="text-xs max-w-md font-sans text-gray-500 leading-relaxed">
                Both participants can exchange real-time messages. Messages are never saved to database storage and will disappear forever when this channel terminates.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => {
            if (msg.type === 'JOIN' || msg.type === 'LEAVE') {
              return (
                <div key={idx} className="flex justify-center my-2">
                  <div className="px-3 py-1 rounded-full text-[10px] font-mono bg-white/[0.03] border border-white/5 text-gray-400 flex items-center space-x-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        msg.type === 'JOIN' ? 'bg-emerald-400' : 'bg-red-400'
                      }`}
                    />
                    <span>{msg.content}</span>
                    <span className="text-gray-600">• {formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              );
            }

            const isMe = msg.sender === sessionData.role;

            return (
              <div
                key={idx}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center space-x-2 text-[10px] font-mono px-1 text-gray-500">
                  <span className={isMe ? 'text-emerald-400/90 font-medium' : 'text-cyan-400/90 font-medium'}>
                    {isMe ? 'YOU' : msg.sender === 'ADMIN' ? 'KERNEL' : 'CITIZEN'}
                  </span>
                  <span>{formatTime(msg.timestamp)}</span>
                </div>

                <div
                  className={`max-w-[75%] md:max-w-[65%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                    isMe
                      ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-100 rounded-tr-sm shadow-[0_4px_20px_rgba(16,185,129,0.06)]'
                      : 'bg-white/[0.05] border border-white/10 text-gray-100 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={sendMessage} className="mt-4 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={connected ? 'Type a secure transmission... (Enter to send)' : 'Connecting to secure relay...'}
              disabled={!connected}
              className="w-full bg-black/60 border border-white/10 focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/40 text-white placeholder-gray-500 text-sm px-4 py-3.5 rounded-xl outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={!connected || !input.trim()}
            className="px-5 py-3.5 h-auto rounded-xl flex items-center space-x-1.5 flex-shrink-0"
          >
            <span>TRANSMIT</span>
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </main>
    </div>
  );
}
