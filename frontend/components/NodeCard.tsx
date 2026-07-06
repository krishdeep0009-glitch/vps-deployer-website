'use client';

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

type LiveMetrics = {
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
};

const statusColor: Record<string, string> = {
  ONLINE: 'bg-emerald-500',
  OFFLINE: 'bg-slate-400',
  PENDING: 'bg-amber-400',
  ERROR: 'bg-red-500',
};

function Bar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function NodeCard({ node, live }: { node: NodeData; live?: LiveMetrics }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium">{node.name}</h3>
          <p className="text-xs text-slate-500">{node.hostname || node.ipAddress || 'unregistered'}</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <span className={`h-2 w-2 rounded-full ${statusColor[node.status] || 'bg-slate-400'}`} />
          {node.status}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <Bar label="CPU" value={live?.cpuUsage ?? 0} />
        <Bar label="RAM" value={live?.ramUsage ?? 0} />
        <Bar label="Disk" value={live?.diskUsage ?? 0} />
      </div>

      <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span>{node.cpuCores ? `${node.cpuCores} cores` : '—'}</span>
        <span>{node.ramMb ? `${(node.ramMb / 1024).toFixed(1)} GB RAM` : '—'}</span>
        <span>{node.diskGb ? `${node.diskGb} GB disk` : '—'}</span>
      </div>
    </div>
  );
}
