import React, { useState, useEffect } from 'react';
import {
  BALANCE_SECTIONS,
  BALANCE_DEFAULTS,
  type BalanceSection,
} from '@astranox/constants';
import {
  useAdminBalanceSections,
  useAdminBalanceSectionDetail,
  useAdminBalanceHistory,
  useSaveBalanceDraft,
  usePreviewBalanceDiff,
  usePublishBalance,
  useRollbackBalance,
  useResetBalance,
} from '../hooks/useAdminBalance';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ReasonField } from '../components/ReasonField';
import {
  SlidersHorizontal,
  History,
  RotateCcw,
  Save,
  Rocket,
  AlertTriangle,
} from 'lucide-react';
import type { BalancePreviewResultDto, BalanceSectionDiffItem } from '@astranox/types';

export function Balance() {
  const [activeSection, setActiveSection] = useState<BalanceSection>('battle');
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [rollbackTarget, setRollbackTarget] = useState<number | null>(null);

  const [confirmExtreme, setConfirmExtreme] = useState(false);
  const [publishReason, setPublishReason] = useState('');
  const [previewData, setPreviewData] = useState<BalancePreviewResultDto | null>(null);

  // Queries
  const { data: sectionSummaries, isLoading: isSummariesLoading } = useAdminBalanceSections();
  const { data: sectionDetail, isLoading: isDetailLoading } = useAdminBalanceSectionDetail(activeSection);
  const { data: historyItems, isLoading: isHistoryLoading } = useAdminBalanceHistory(activeSection);

  // Mutations
  const saveDraftMutation = useSaveBalanceDraft(activeSection);
  const previewDiffMutation = usePreviewBalanceDiff(activeSection);
  const publishMutation = usePublishBalance(activeSection);
  const rollbackMutation = useRollbackBalance(activeSection);
  const resetMutation = useResetBalance(activeSection);

  // Sync form state when section detail loads or section changes
  useEffect(() => {
    if (sectionDetail) {
      const initial = sectionDetail.draft || sectionDetail.active || sectionDetail.defaults;
      setFormValues(JSON.parse(JSON.stringify(initial)));
    }
  }, [sectionDetail, activeSection]);

  const activeSummary = sectionSummaries?.find((s) => s.section === activeSection);
  const defaults = sectionDetail?.defaults || BALANCE_DEFAULTS[activeSection] || {};

  const handleFieldChange = (key: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNestedFieldChange = (parentKey: string, subKey: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] || {}),
        [subKey]: value,
      },
    }));
  };

  const handleSaveDraft = async () => {
    await saveDraftMutation.mutateAsync({ values: formValues });
  };

  const handleOpenPreview = async () => {
    const res = await previewDiffMutation.mutateAsync({ values: formValues });
    setPreviewData(res);
    setPublishReason('');
    setConfirmExtreme(false);
    setIsDiffModalOpen(true);
  };

  const handlePublish = async () => {
    if (publishReason.trim().length < 5) return;
    await publishMutation.mutateAsync({
      reason: publishReason.trim(),
      confirmExtreme: previewData?.hasExtremeChanges ? confirmExtreme : undefined,
    });
    setIsDiffModalOpen(false);
  };

  const handleConfirmRollback = async (reason: string) => {
    if (!rollbackTarget) return;
    await rollbackMutation.mutateAsync({
      targetVersion: rollbackTarget,
      reason,
    });
    setRollbackTarget(null);
    setIsHistoryModalOpen(false);
  };

  const handleConfirmReset = async (reason: string) => {
    await resetMutation.mutateAsync({ reason });
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-foreground" />
            <h1 className="text-2xl font-black text-foreground">Game Balance Configuration</h1>
          </div>
          <p className="text-sm text-muted mt-1">
            Zero-deploy runtime balance tuning for combat, progression, catch rates, economy, and dungeon scaling.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            <span>Version History</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-2 text-danger hover:text-danger"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </Button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border">
        {BALANCE_SECTIONS.map((sec) => {
          const sum = sectionSummaries?.find((s) => s.section === sec);
          const isActive = activeSection === sec;
          const hasDraft = Boolean(sum?.draftValues);
          return (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-surface border border-border text-muted hover:text-foreground hover:bg-surface-raised'
              }`}
            >
              <span className="capitalize">{sec}</span>
              {sum && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-surface-raised text-muted'
                  }`}
                >
                  v{sum.version}
                </span>
              )}
              {hasDraft && (
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" title="Draft pending" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Section Content */}
      {isDetailLoading || isSummariesLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section Summary Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs text-muted block">Active Version</span>
                <span className="text-lg font-black text-foreground">v{activeSummary?.version || 1}</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <span className="text-xs text-muted block">Status</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-xs font-bold text-foreground">Live In Engine</span>
                  {activeSummary?.draftValues && (
                    <Badge variant="warning" size="sm">
                      Draft Saved
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={saveDraftMutation.isPending}
                className="flex items-center gap-2"
              >
                {saveDraftMutation.isPending ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
                <span>Save Draft</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenPreview}
                disabled={previewDiffMutation.isPending}
                className="flex items-center gap-2"
              >
                {previewDiffMutation.isPending ? <Spinner size="sm" /> : <Rocket className="w-4 h-4" />}
                <span>Preview Diff & Publish</span>
              </Button>
            </div>
          </div>

          {/* Form Fields Generator */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground capitalize">{activeSection} Balance Parameters</h2>
              <p className="text-xs text-muted mt-0.5">
                Adjust balance parameters below. Numbers are validated strictly against their defined boundaries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.entries(defaults).map(([key, defaultValue]) => {
                const currentValue = formValues[key] !== undefined ? formValues[key] : defaultValue;
                const isModified = JSON.stringify(currentValue) !== JSON.stringify(defaultValue);

                // Nested Record (like POTENTIAL_MAX_LEVELS or RECORD of numbers)
                if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
                  return (
                    <div
                      key={key}
                      className="md:col-span-2 lg:col-span-3 bg-surface-raised border border-border rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-foreground uppercase tracking-wider">{key}</span>
                        {isModified && (
                          <Badge variant="warning" size="sm">
                            Modified
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {Object.entries(defaultValue).map(([subKey, subDefault]) => {
                          const subCurrent =
                            formValues[key]?.[subKey] !== undefined ? formValues[key][subKey] : subDefault;
                          return (
                            <div key={subKey} className="space-y-1">
                              <label className="text-[11px] font-bold text-muted block truncate" title={subKey}>
                                {subKey}
                              </label>
                              <Input
                                value={String(subCurrent ?? '')}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const sanitized = typeof subDefault === 'number' ? raw.replace(/[^\d.-]/g, '') : raw;
                                  const parsed =
                                    typeof subDefault === 'number'
                                      ? sanitized === '' || sanitized === '-'
                                        ? sanitized
                                        : Number(sanitized)
                                      : sanitized;
                                  handleNestedFieldChange(key, subKey, parsed);
                                }}
                                className="h-8 text-xs font-mono"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // Simple Primitive (number, boolean, string)
                return (
                  <div
                    key={key}
                    className="bg-surface-raised border border-border rounded-xl p-3.5 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-bold text-foreground truncate" title={key}>
                          {key}
                        </label>
                        {isModified && (
                          <Badge variant="warning" size="sm" className="shrink-0">
                            Modified
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted block font-mono mt-0.5">
                        Default: {String(defaultValue)}
                      </span>
                    </div>

                    {typeof defaultValue === 'boolean' ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleFieldChange(key, !currentValue)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            currentValue
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-surface border border-border text-muted hover:text-foreground'
                          }`}
                        >
                          {currentValue ? 'Enabled (true)' : 'Disabled (false)'}
                        </button>
                      </div>
                    ) : (
                      <Input
                        value={String(currentValue ?? '')}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const sanitized =
                            typeof defaultValue === 'number' ? raw.replace(/[^\d.-]/g, '') : raw;
                          const parsed =
                            typeof defaultValue === 'number'
                              ? sanitized === '' || sanitized === '-'
                                ? sanitized
                                : Number(sanitized)
                              : sanitized;
                          handleFieldChange(key, parsed);
                        }}
                        className="h-9 text-xs font-mono"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Diff & Publish Modal */}
      <Dialog.Root open={isDiffModalOpen} onOpenChange={(open: boolean) => !open && setIsDiffModalOpen(false)}>
        <Dialog.Content className="max-w-2xl w-full bg-surface border-border p-6 rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
          <Dialog.Header>
            <Dialog.Title className="text-xl font-black text-foreground">
              Preview Balance Changes ({activeSection})
            </Dialog.Title>
            <Dialog.Description className="text-xs text-muted mt-1">
              Review diff before publishing live. Once published, battle sessions and instances will immediately reference
              this new configuration version.
            </Dialog.Description>
          </Dialog.Header>

          <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1">
            {previewData?.diffs && previewData.diffs.length > 0 ? (
              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-surface-raised border-b border-border font-bold text-muted">
                    <tr>
                      <th className="px-3 py-2">Parameter</th>
                      <th className="px-3 py-2">Current</th>
                      <th className="px-3 py-2">New</th>
                      <th className="px-3 py-2">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-border font-mono">
                    {previewData.diffs.map((item: BalanceSectionDiffItem) => (
                      <tr key={item.field} className={item.isExtreme ? 'bg-danger/10' : ''}>
                        <td className="px-3 py-2 font-bold text-foreground font-sans">{item.field}</td>
                        <td className="px-3 py-2 text-muted truncate max-w-[120px]">
                          {JSON.stringify(item.currentActiveValue)}
                        </td>
                        <td className="px-3 py-2 text-foreground font-bold truncate max-w-[120px]">
                          {JSON.stringify(item.draftValue)}
                        </td>
                        <td className="px-3 py-2">
                          {item.percentChange !== undefined ? (
                            <span
                              className={`font-bold ${
                                item.isExtreme
                                  ? 'text-danger'
                                  : item.percentChange > 0
                                  ? 'text-success'
                                  : 'text-warning'
                              }`}
                            >
                              {item.percentChange > 0 ? '+' : ''}
                              {item.percentChange.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-muted">Modified</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-surface-raised rounded-xl text-center text-xs text-muted">
                No differences detected compared to the active live configuration.
              </div>
            )}

            {/* Extreme Warning Box */}
            {previewData?.hasExtremeChanges && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-danger">Extreme Balance Changes Detected</h4>
                    <p className="text-xs text-foreground/80 mt-0.5">
                      One or more adjusted values change by more than 50%. This can drastically impact game difficulty or economy.
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={confirmExtreme}
                    onChange={(e) => setConfirmExtreme(e.target.checked)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-xs font-bold text-foreground">
                    I acknowledge and confirm these extreme balance adjustments
                  </span>
                </label>
              </div>
            )}

            {/* Reason Field */}
            <ReasonField
              value={publishReason}
              onChange={setPublishReason}
              placeholder="State the reason for this balance adjustment (e.g., 'Buffed exploration grass rate for event')..."
              minLength={5}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsDiffModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePublish}
              disabled={
                publishMutation.isPending ||
                publishReason.trim().length < 5 ||
                Boolean(previewData?.hasExtremeChanges && !confirmExtreme)
              }
              className="flex items-center gap-2"
            >
              {publishMutation.isPending ? <Spinner size="sm" /> : <Rocket className="w-4 h-4" />}
              <span>Publish Live</span>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      {/* Version History Modal */}
      <Dialog.Root open={isHistoryModalOpen} onOpenChange={(open: boolean) => !open && setIsHistoryModalOpen(false)}>
        <Dialog.Content className="max-w-2xl w-full bg-surface border-border p-6 rounded-2xl shadow-xl max-h-[85vh] flex flex-col">
          <Dialog.Header>
            <Dialog.Title className="text-xl font-black text-foreground">
              Version History ({activeSection})
            </Dialog.Title>
            <Dialog.Description className="text-xs text-muted mt-1">
              Complete audit trail of all published balance configurations. You can roll back to any historical version.
            </Dialog.Description>
          </Dialog.Header>

          <div className="flex-1 overflow-y-auto space-y-3 my-4 pr-1">
            {isHistoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : historyItems && historyItems.length > 0 ? (
              historyItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-raised border border-border rounded-xl p-3.5 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-foreground font-mono">v{item.version}</span>
                      <Badge
                        variant={item.status === 'active' ? 'silt' : 'default'}
                        size="sm"
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-muted">
                        {new Date(item.publishedAt || item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/90 font-medium">{item.reason}</p>
                    <span className="text-[10px] text-muted block">By user ID: {item.publishedBy || item.createdBy || 'System'}</span>
                  </div>

                  {item.status !== 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRollbackTarget(item.version)}
                      className="shrink-0 flex items-center gap-1.5 text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rollback</span>
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted">No historical overrides found.</div>
            )}
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsHistoryModalOpen(false)}>
              Close
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      {/* Rollback Confirm Dialog */}
      <ConfirmDialog
        isOpen={rollbackTarget !== null}
        onClose={() => setRollbackTarget(null)}
        onConfirm={handleConfirmRollback}
        title={`Rollback ${activeSection} to Version ${rollbackTarget}?`}
        description={`This will create a new live version copying values from v${rollbackTarget}. Active battles will not be disrupted.`}
        confirmLabel="Rollback Now"
        requireReason={true}
        isLoading={rollbackMutation.isPending}
      />

      {/* Reset Confirm Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title={`Reset ${activeSection} to Canonical Defaults?`}
        description="This will archive all active overrides and restore the original balance constants defined in code."
        confirmLabel="Reset to Defaults"
        isDestructive={true}
        requireReason={true}
        isLoading={resetMutation.isPending}
      />
    </div>
  );
}
