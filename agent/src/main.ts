import 'dotenv/config';
import axios from 'axios';
import { io } from 'socket.io-client';
import * as si from 'systeminformation';
import { handleContainerCommand, ContainerCommand } from './lxc';

const PANEL_URL = process.env.PANEL_URL || 'http://localhost:8006';
const AGENT_TOKEN = process.env.AGENT_TOKEN;
const HEARTBEAT_INTERVAL_MS = 15_000;

if (!AGENT_TOKEN) {
  console.error('AGENT_TOKEN is required (set in .env)');
  process.exit(1);
}

async function detectSystemInfo() {
  const [osInfo, cpu, mem, disk, net] = await Promise.all([
    si.osInfo(),
    si.cpu(),
    si.mem(),
    si.fsSize(),
    si.networkInterfaces(),
  ]);

  const primaryIp = Array.isArray(net) ? net.find((n) => !n.internal && n.ip4)?.ip4 : undefined;
  const totalDiskGb = disk.reduce((sum, d) => sum + d.size, 0) / 1e9;

  // Basic virtualization detection; real implementation would check
  // /proc/cpuinfo flags, systemd-detect-virt, or lscpu output.
  let virtualization = 'unknown';
  try {
    const virt = await si.system();
    virtualization = virt.virtual ? (virt.virtualHost || 'virtualized') : 'bare-metal';
  } catch {
    /* ignore */
  }

  return {
    hostname: osInfo.hostname,
    os: `${osInfo.distro} ${osInfo.release}`,
    virtualization,
    cpuCores: cpu.cores,
    ramMb: Math.round(mem.total / 1e6),
    diskGb: Math.round(totalDiskGb),
    ipAddress: primaryIp,
  };
}

async function registerAgent() {
  const info = await detectSystemInfo();
  const { data } = await axios.post(`${PANEL_URL}/nodes/agent/register`, {
    agentToken: AGENT_TOKEN,
    ...info,
  });
  console.log(`Registered with panel as node ${data.id} (${data.name})`);
  return data;
}

async function sendHeartbeat() {
  const [currentLoad, mem, fsSize, netStats] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.networkStats(),
  ]);

  const diskUsage =
    fsSize.length > 0 ? (fsSize.reduce((s, d) => s + d.used, 0) / fsSize.reduce((s, d) => s + d.size, 0)) * 100 : 0;

  const net = netStats[0];

  try {
    await axios.post(`${PANEL_URL}/nodes/agent/heartbeat`, {
      agentToken: AGENT_TOKEN,
      cpuUsage: currentLoad.currentLoad,
      ramUsage: (mem.active / mem.total) * 100,
      diskUsage,
      netRxKb: net ? net.rx_sec / 1024 : 0,
      netTxKb: net ? net.tx_sec / 1024 : 0,
    });
  } catch (err: any) {
    console.error('Heartbeat failed:', err.message);
  }
}

function connectCommandChannel(nodeId: string) {
  const socket = io(PANEL_URL, { path: '/ws' });

  socket.on('connect', () => console.log('Connected to panel command channel'));
  socket.on('disconnect', () => console.log('Disconnected from panel, will auto-reconnect'));

  socket.on(`node:${nodeId}:command`, async (cmd: ContainerCommand) => {
    console.log('Received command:', cmd);
    const result = await handleContainerCommand(cmd);
    console.log('Command result:', result);
    // Future: POST result back to /containers/:id/status
  });

  return socket;
}

async function main() {
  console.log('VPS Panel Agent starting...');
  const node = await registerAgent();

  connectCommandChannel(node.id);

  setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
  await sendHeartbeat();
}

main().catch((err) => {
  console.error('Agent fatal error:', err);
  process.exit(1);
});
