import type { ToolMeta } from '../../../../types/catalog';

export const metadata: ToolMeta = {
  id: 'backup-composer',
  domainId: 'data',
  templateId: 'backup-restore',
  name: 'Backup Engine Composer',
  slug: 'backup-composer',
  description:
    'Compose the snapkit wrapper: full and incremental snapshots, encryption, verification, pruning and restore.',
  icon: '⛁',
  status: 'available',
  tags: ['bash', 'composer', 'backup', 'snapkit'],
  keywords: ['shell', 'script', 'generator', 'linux', 'restore'],
  scriptTemplateId: 'backup-engine',
};
