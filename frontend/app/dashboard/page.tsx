'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { api, loadAuthToken, setAuthToken } from '@/lib/api';
import NodeCard from '@/components/NodeCard';

type NodeData = {
  id: string;
  name: string;
  hostname?: string | null;
  os?: string | null;
  status: string;
  cpuCores?: number | null;
  ramMb?: number | null;
  diskGb?: number | null;
  ipAddress?: string | null;
};

type LiveMetrics = { cpuUsage: number; ramUsage: number; diskUsage: number };

export default function DashboardPage() {
  const router = useRouter();
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<Record<string, LiveMetrics>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = loadAuthToken();
    if (!token) {
      router.push('/');
      return;
    }

    async function loadNodes() {
      try {
        const { data } = await api.get('/nodes');
        setNodes(data);
      } catch (err) {
        router.push('/');
      } finally {
        setLoading(false);
      }
    }
    loadNodes();

    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL!, { path: '/ws' });
    socket.on('node:update', ({ node, liveMetrics }: { node: NodeData; liveMetrics?: LiveMetrics }) => {
      setNodes((prev) => {
        const idx = prev.findIndex((n) => n.id === node.id);
        if (idx === -1) return [node, ...prev];
        const copy = [...prev];
        copy[idx] = node;
        return copy;
      });
      if (liveMetrics) {
        setLiveMetrics((prev) => ({ ...prev, [node.id]: liveMetrics }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  function logout() {
    setAuthToken(null);
    router.push('/');
  }

  const onlineCount = nodes.filter((n) => n.status === 'ONLINE').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500">
            {onlineCount} of {nodes.length} nodes online
          </p>
        </div>
        <button
          onClick={logout}
          className="text-sm rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          Log out
        </button>
      </header>

      {loading ? (
        <p className="text-sm text-slate-500">Loading nodes…</p>
      ) : nodes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500">
          <p className="mb-2">No nodes registered yet.</p>
          <p className="text-xs">
            Create a node via the API (<code>POST /nodes</code>) to get a one-line install command for its agent.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <NodeCard key={node.id} node={node} live={liveMetrics[node.id]} />
          ))}
        </div>
      )}
    </div>
  );
}
