import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useAdminUserDetail,
  useBanUser,
  useUnbanUser,
  useGrantCurrency,
  useGrantItem,
} from '../hooks/useAdminUsers';
import { ReasonField } from '../components/ReasonField';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  ArrowLeft,
  Shield,
  Ban,
  Coins,
  Gift,
  MapPin,
  Calendar,
  Package,
  ScrollText,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { notify } from '@/lib/toast';
import { AuditLogDto } from '@astranox/types';

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useAdminUserDetail(id || '', Boolean(id));

  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();
  const grantCurrencyMutation = useGrantCurrency();
  const grantItemMutation = useGrantItem();

  // Modals state
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isUnbanModalOpen, setIsUnbanModalOpen] = useState(false);

  // Grant Currency Modal state
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [currencyType, setCurrencyType] = useState<'astralCoins' | 'infinityCoins'>('astralCoins');
  const [currencyAmount, setCurrencyAmount] = useState<string>('1000');
  const [currencyReason, setCurrencyReason] = useState<string>('');

  // Grant Item Modal state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemKey, setItemKey] = useState<string>('ultra_ball');
  const [itemQuantity, setItemQuantity] = useState<string>('5');
  const [itemReason, setItemReason] = useState<string>('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-2xl">
        <h3 className="text-lg font-black text-foreground mb-1">User Not Found</h3>
        <p className="text-xs text-muted mb-4">Could not load the specified user profile.</p>
        <Button variant="outline" onClick={() => navigate('/admin/users')} className="text-xs">
          Return to Users
        </Button>
      </div>
    );
  }

  const handleConfirmBan = async (reason: string) => {
    await banMutation.mutateAsync({ id: user.id, data: { reason } });
    setIsBanModalOpen(false);
  };

  const handleConfirmUnban = async (reason: string) => {
    await unbanMutation.mutateAsync({ id: user.id, data: { reason } });
    setIsUnbanModalOpen(false);
  };

  const handleSaveGrantCurrency = async () => {
    if (currencyReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }
    const amount = parseInt(currencyAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      notify.error('Amount must be a positive integer');
      return;
    }
    await grantCurrencyMutation.mutateAsync({
      id: user.id,
      data: { currencyType, amount, reason: currencyReason.trim() },
    });
    setIsCurrencyModalOpen(false);
    setCurrencyReason('');
  };

  const handleSaveGrantItem = async () => {
    if (itemReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }
    const quantity = parseInt(itemQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      notify.error('Quantity must be a positive integer');
      return;
    }
    await grantItemMutation.mutateAsync({
      id: user.id,
      data: { itemId: itemKey.trim(), quantity, reason: itemReason.trim() },
    });
    setIsItemModalOpen(false);
    setItemReason('');
  };

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/users"
          className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Trainer List</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCurrencyModalOpen(true)}
            variant="outline"
            className="flex items-center gap-1.5 text-xs"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Grant Currency</span>
          </Button>
          <Button
            onClick={() => setIsItemModalOpen(true)}
            variant="outline"
            className="flex items-center gap-1.5 text-xs"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Grant Item</span>
          </Button>
          {user.isBanned ? (
            <Button
              onClick={() => setIsUnbanModalOpen(true)}
              className="flex items-center gap-1.5 text-xs"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Lift Ban</span>
            </Button>
          ) : (
            <Button
              onClick={() => setIsBanModalOpen(true)}
              variant="danger"
              className="flex items-center gap-1.5 text-xs"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Ban Trainer</span>
            </Button>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 bg-surface border border-border rounded-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-raised border border-border flex items-center justify-center font-black text-xl text-foreground">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-foreground">{user.username}</h1>
                <Badge variant="ink" className="text-[10px] font-black uppercase py-0 px-1.5">
                  {user.role}
                </Badge>
                {user.isBanned && (
                  <Badge variant="error" className="text-[10px] font-bold">
                    Banned
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted font-mono">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-subtle" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            {user.trainerSave && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-subtle" />
                <span className="font-mono">{user.trainerSave.currentMapId || 'Starting Zone'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Currency & Save Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3 bg-surface-raised border border-border rounded-xl">
            <span className="text-[10px] text-muted font-black uppercase block">Astral Coins</span>
            <span className="text-base font-black text-foreground">
              {(user.trainerSave?.astralCoins ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-surface-raised border border-border rounded-xl">
            <span className="text-[10px] text-muted font-black uppercase block">Infinity Coins</span>
            <span className="text-base font-black text-foreground">
              {(user.trainerSave?.infinityCoins ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-surface-raised border border-border rounded-xl">
            <span className="text-[10px] text-muted font-black uppercase block">Party Count</span>
            <span className="text-base font-black text-foreground">
              {user.trainerSave?.party?.length ?? 0} / 6
            </span>
          </div>
          <div className="p-3 bg-surface-raised border border-border rounded-xl">
            <span className="text-[10px] text-muted font-black uppercase block">Inventory Stacks</span>
            <span className="text-base font-black text-foreground">
              {user.trainerSave?.inventory?.length ?? 0} items
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Table */}
        <Card className="bg-surface border-border">
          <Card.Header className="pb-3 border-b border-border">
            <span className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Trainer Bag Inventory</span>
            </span>
          </Card.Header>
          <Card.Body className="pt-4">
            {!user.trainerSave?.inventory || user.trainerSave.inventory.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">Bag is empty.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-border/60">
                {user.trainerSave.inventory.map((inv: { itemId: string; quantity: number }) => (
                  <div key={inv.itemId} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-mono text-foreground font-bold">{inv.itemId}</span>
                    <span className="text-muted font-mono font-black">x{inv.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Audit Log History */}
        <Card className="bg-surface border-border">
          <Card.Header className="pb-3 border-b border-border">
            <span className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <ScrollText className="w-4 h-4" />
              <span>User Audit History</span>
            </span>
          </Card.Header>
          <Card.Body className="pt-4">
            {!user.recentAuditLogs || user.recentAuditLogs.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">No moderation logs for this user.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {user.recentAuditLogs.map((log: AuditLogDto) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-surface-raised border border-border/60 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{log.action}</span>
                      <span className="text-[10px] text-muted font-mono">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      Reason: <span className="text-foreground">{log.reason || 'N/A'}</span>
                    </p>
                    <span className="text-[10px] text-subtle font-mono block">
                      by {log.adminUsername || 'Staff'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Ban Confirm Dialog */}
      <ConfirmDialog
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        onConfirm={handleConfirmBan}
        title={`Ban Trainer "${user.username}"?`}
        description="This action will terminate active sessions and prevent further access."
        confirmLabel="Confirm Ban"
        isDestructive={true}
        isLoading={banMutation.isPending}
      />

      {/* Unban Confirm Dialog */}
      <ConfirmDialog
        isOpen={isUnbanModalOpen}
        onClose={() => setIsUnbanModalOpen(false)}
        onConfirm={handleConfirmUnban}
        title={`Unban Trainer "${user.username}"?`}
        description="This action will lift all account restrictions."
        confirmLabel="Lift Ban"
        isLoading={unbanMutation.isPending}
      />

      {/* Grant Currency Modal */}
      {isCurrencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-black text-foreground">Grant Currency</h3>
              <button
                onClick={() => setIsCurrencyModalOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Currency Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrencyType('astralCoins')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                      currencyType === 'astralCoins'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-surface-raised border-border text-muted hover:text-foreground'
                    }`}
                  >
                    Astral Coins
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrencyType('infinityCoins')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                      currencyType === 'infinityCoins'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-surface-raised border-border text-muted hover:text-foreground'
                    }`}
                  >
                    Infinity Coins
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Amount</label>
                <input
                  type="text"
                  value={currencyAmount}
                  onChange={(e) => setCurrencyAmount(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter amount..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <ReasonField
                value={currencyReason}
                onChange={setCurrencyReason}
                label="Audit Reason (Mandatory)"
                helperText="Required log entry for this balance addition."
              />
            </div>

            <div className="p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setIsCurrencyModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveGrantCurrency}
                disabled={grantCurrencyMutation.isPending || currencyReason.trim().length < 5}
                className="text-xs"
              >
                {grantCurrencyMutation.isPending ? 'Granting...' : 'Grant Currency'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Grant Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-black text-foreground">Grant Item</h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Item Key</label>
                <input
                  type="text"
                  value={itemKey}
                  onChange={(e) => setItemKey(e.target.value.trim().toLowerCase())}
                  placeholder="e.g. ultra_ball, rare_candy"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Quantity</label>
                <input
                  type="text"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value.replace(/\D/g, ''))}
                  placeholder="Quantity (e.g. 5)"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <ReasonField
                value={itemReason}
                onChange={setItemReason}
                label="Audit Reason (Mandatory)"
                helperText="Required log entry for item injection."
              />
            </div>

            <div className="p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setIsItemModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveGrantItem}
                disabled={grantItemMutation.isPending || itemReason.trim().length < 5}
                className="text-xs"
              >
                {grantItemMutation.isPending ? 'Granting...' : 'Grant Item'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
