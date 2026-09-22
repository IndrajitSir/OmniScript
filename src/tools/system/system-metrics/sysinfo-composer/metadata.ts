import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'sysinfo-composer',
  domainId: 'system',
  templateId: 'system-metrics',
  name: 'System Metrics Composer',
  slug: 'system-metrics-composer',
  description:
    'Compose the sysinfo wrapper: CPU, memory, disk, load, processes, kernel, temperatures and I/O counters.',
  icon: '▤',
  status: 'available',
  tags: ['bash', 'composer', 'metrics', 'sysinfo'],
  keywords: ['shell', 'script', 'generator', 'linux'],
  scriptTemplateId: 'system-metrics',
};
