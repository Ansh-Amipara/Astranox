import { useState } from 'react';
import { useAdminFlags, useUpdateFeatureFlag } from '../hooks/useAdminFlags';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FeatureFlagDto } from '@astranox/types';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

export function Flags() {
  const { data: flags = [], isLoading, isError, refetch } = useAdminFlags();
  const updateMutation = useUpdateFeatureFlag();

  const [targetFlag, setTargetFlag] = useState<{ flag: FeatureFlagDto; nextEnabled: boolean } | null>(
    null
  );

  const handleToggle = (flag: FeatureFlagDto) => {
    setTargetFlag({ flag, nextEnabled: !flag.enabled });
  };

  const handleConfirmToggle = async (reason: string) => {
    if (!targetFlag) return;
    await updateMutation.mutateAsync({
      key: targetFlag.flag.key,
      data: {
        key: targetFlag.flag.key,
        enabled: targetFlag.nextEnabled,
        reason,
      },
    });
    setTargetFlag(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-surface border border-border rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-black text-foreground tracking-tight">System Feature Flags</h1>
          <Badge variant="ink" className="text-[10px] font-black uppercase">
            Live Configuration
          </Badge>
        </div>
        <p className="text-xs text-muted">
          Dynamically toggle high-risk features and subsystems without redeploying code. All modifications require an audit reason.
        </p>
      </div>

      {/* Flags List */}
      <div className="space-y-3">
        {flags.map((flag) => (
          <div
            key={flag.key}
            className="p-5 bg-surface border border-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
          >
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-black text-foreground">{flag.name}</span>
                <span className="text-[10px] font-mono text-muted bg-surface-raised px-1.5 py-0.5 rounded border border-border">
                  {flag.key}
                </span>
                <Badge
                  variant={flag.enabled ? 'success' : 'default'}
                  className="text-[10px] font-bold"
                >
                  {flag.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-xs text-muted">{flag.description}</p>
              <span className="text-[10px] text-subtle font-mono block">
                Last modified: {flag.updatedAt ? new Date(flag.updatedAt).toLocaleString() : 'System default'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleToggle(flag)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  flag.enabled ? 'bg-primary' : 'bg-surface-raised border-border'
                }`}
                role="switch"
                aria-checked={flag.enabled}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                    flag.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Toggle Dialog */}
      <ConfirmDialog
        isOpen={Boolean(targetFlag)}
        onClose={() => setTargetFlag(null)}
        onConfirm={handleConfirmToggle}
        title={`${targetFlag?.nextEnabled ? 'Enable' : 'Disable'} feature "${targetFlag?.flag.name}"?`}
        description={`This will immediately ${
          targetFlag?.nextEnabled ? 'activate' : 'deactivate'
        } the feature across all players.`}
        confirmLabel={targetFlag?.nextEnabled ? 'Enable Feature' : 'Disable Feature'}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
