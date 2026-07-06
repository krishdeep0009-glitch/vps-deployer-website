import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Virtualization command dispatcher. This scaffold defines the interface and
 * dry-run behavior; production implementation swaps `dryRun` calls for real
 * shell-outs to `lxc-create`, `lxc-start`, `docker`, `virsh`, etc., guarded by
 * capability checks (does this host have LXC/Docker/KVM available at all).
 */

export interface ContainerCommand {
  command: string; // create | start | stop | restart | suspend | unsuspend | delete | clone | snapshot | restore | reinstall
  containerId: string;
  ctType?: string; // lxc | docker | kvm
  osTemplate?: string;
  cpuLimit?: number;
  ramLimitMb?: number;
  diskLimitGb?: number;
}

async function dryRun(description: string): Promise<{ ok: boolean; output: string }> {
  console.log(`[lxc:dry-run] ${description}`);
  return { ok: true, output: `dry-run: ${description}` };
}

export async function handleContainerCommand(cmd: ContainerCommand) {
  const ctName = `ct-${cmd.containerId}`;

  switch (cmd.command) {
    case 'create':
      if (cmd.ctType === 'lxc') {
        // Real: `lxc-create -n ${ctName} -t download -- -d ${distro} -r ${release} -a amd64`
        return dryRun(`lxc-create -n ${ctName} -t ${cmd.osTemplate}`);
      }
      if (cmd.ctType === 'docker') {
        // Real: `docker run -d --name ${ctName} --cpus=${cpuLimit} --memory=${ramLimitMb}m ${image}`
        return dryRun(`docker run -d --name ${ctName} ${cmd.osTemplate}`);
      }
      if (cmd.ctType === 'kvm') {
        // Real: virt-install / virsh define + start
        return dryRun(`virt-install --name ${ctName} --os-variant ${cmd.osTemplate}`);
      }
      return dryRun(`unsupported ctType ${cmd.ctType}`);

    case 'start':
      return dryRun(`lxc-start -n ${ctName}`);
    case 'stop':
      return dryRun(`lxc-stop -n ${ctName}`);
    case 'restart':
      return dryRun(`lxc-stop -n ${ctName} && lxc-start -n ${ctName}`);
    case 'suspend':
      return dryRun(`lxc-freeze -n ${ctName}`);
    case 'unsuspend':
      return dryRun(`lxc-unfreeze -n ${ctName}`);
    case 'delete':
      return dryRun(`lxc-destroy -n ${ctName}`);
    case 'clone':
      return dryRun(`lxc-copy -n ${ctName} -N ${ctName}-clone`);
    case 'snapshot':
      return dryRun(`lxc-snapshot -n ${ctName}`);
    case 'restore':
      return dryRun(`lxc-snapshot -n ${ctName} -r snap0`);
    case 'reinstall':
      return dryRun(`lxc-destroy -n ${ctName} && lxc-create -n ${ctName} -t download`);
    default:
      return dryRun(`unknown command ${cmd.command}`);
  }
}

// Kept for future real shell-out usage.
export async function runShell(command: string) {
  return execAsync(command);
}
