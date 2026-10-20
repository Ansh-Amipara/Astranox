import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAdminUsers,
  useBanUser,
  useUnbanUser,
  useGrantCurrency,
  useGrantItem,
} from '../hooks/useAdminUsers';
import { DataTable, ColumnDef } from '../components/DataTable';
import { ReasonField } from '../components/ReasonField';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { AdminUserListItemDto } from '@astranox/types';
import {
  Search,
  Filter,
  Shield,
  Ban,
  Coins,
  Gift,
  ExternalLink,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { notify } from '@/lib/toast';

export function Users() {
  const navigate = useNavigate();

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const limit = 50;

  // Query
  const { data, isLoading, isError, refetch } = useAdminUsers({
    search: searchQuery || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit,
  });

  const users = data?.users || [];

  // Mutations
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();
  const grantCurrencyMutation = useGrantCurrency();
  const grantItemMutation = useGrantItem();

  // Modals state
  const [banTargetUser, setBanTargetUser] = useState<AdminUserListItemDto | null>(null);
  const [unbanTargetUser, setUnbanTargetUser] = useState<AdminUserListItemDto | null>(null);

  // Grant Currency Modal state
  const [currencyTargetUser, setCurrencyTargetUser] = useState<AdminUserListItemDto | null>(null);
  const [currencyType, setCurrencyType] = useState<'astralCoins' | 'infinityCoins'>('astralCoins');
  const [currencyAmount, setCurrencyAmount] = useState<string>('');
  const [currencyReason, setCurrencyReason] = useState<string>('');

  // Grant Item Modal state
  const [itemTargetUser, setItemTargetUser] = useState<AdminUserListItemDto | null>(null);
  const [itemKey, setItemKey] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<string>('1');
  const [itemReason, setItemReason] = useState<string>('');

  // Ban confirmation with reason
  const handleConfirmBan = async (reason: string) => {
    if (!banTargetUser) return;
    await banMutation.mutateAsync({
      id: banTargetUser.id,
      data: { reason },
    });
    setBanTargetUser(null);
  };

  // Unban confirmation with reason
  const handleConfirmUnban = async (reason: string) => {
    if (!unbanTargetUser) return;
    await unbanMutation.mutateAsync({
      id: unbanTargetUser.id,
      data: { reason },
    });
    setUnbanTargetUser(null);
  };

  // Submit Grant Currency
  const handleSaveGrantCurrency = async () => {
    if (!currencyTargetUser) return;
    if (currencyReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }
    const amount = parseInt(currencyAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      notify.error('Amount must be a positive integer');
      return;
    }

    try {
      await grantCurrencyMutation.mutateAsync({
        id: currencyTargetUser.id,
        data: {
          currencyType,
          amount,
          reason: currencyReason.trim(),
        },
      });
      setCurrencyTargetUser(null);
      setCurrencyReason('');
    } catch {
      // Handled in mutation
    }
  };

  // Submit Grant Item
  const handleSaveGrantItem = async () => {
    if (!itemTargetUser) return;
    if (itemReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }
    const quantity = parseInt(itemQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      notify.error('Quantity must be a positive integer');
      return;
    }

    try {
      await grantItemMutation.mutateAsync({
        id: itemTargetUser.id,
        data: {
          itemId: itemKey.trim(),
          quantity,
          reason: itemReason.trim(),
        },
      });
      setItemTargetUser(null);
      setItemReason('');
    } catch {
      // Handled in mutation
    }
  };

  const columns: ColumnDef<AdminUserListItemDto>[] = [
    {
      header: 'Trainer',
      accessorKey: 'username',
      sortable: true,
      cell: (u: AdminUserListItemDto) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-surface-raised border border-border flex items-center justify-center font-black text-xs text-foreground">
            {u.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="text-xs font-bold text-foreground block">{u.username}</span>
            <span className="text-[10px] text-muted">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: (u: AdminUserListItemDto) => (
        <Badge
          variant="ink"
          className="text-[10px] font-black uppercase py-0 px-1.5 bg-surface-raised border-border"
        >
          {u.role}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isBanned',
      cell: (u: AdminUserListItemDto) => (
        <div>
          {u.isBanned ? (
            <Badge variant="error" className="text-[10px] font-bold">
              Banned
            </Badge>
          ) : (
            <Badge variant="default" className="text-[10px] font-bold">
              Active
            </Badge>
          )}
          {u.isBanned && u.banReason && (
            <span className="text-[10px] text-muted block truncate max-w-[120px]" title={u.banReason}>
              {u.banReason}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Registered',
      accessorKey: 'createdAt',
      cell: (u: AdminUserListItemDto) => (
        <span className="text-xs text-muted font-mono">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      className: 'text-right',
      cell: (u: AdminUserListItemDto) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => navigate(`/admin/users/${u.id}`)}
            title="Inspect Full User Details"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-surface-raised border border-border text-foreground hover:bg-surface transition-colors touch-manipulation"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrencyTargetUser(u)}
            title="Grant In-game Currency"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-surface-raised border border-border text-foreground hover:bg-surface transition-colors touch-manipulation"
          >
            <Coins className="w-4 h-4" />
          </button>
          <button
            onClick={() => setItemTargetUser(u)}
            title="Grant Inventory Item"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-surface-raised border border-border text-foreground hover:bg-surface transition-colors touch-manipulation"
          >
            <Gift className="w-4 h-4" />
          </button>
          {u.isBanned ? (
            <button
              onClick={() => setUnbanTargetUser(u)}
              title="Lift User Ban"
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-surface-raised border border-border text-muted hover:text-foreground transition-colors touch-manipulation"
            >
              <Shield className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setBanTargetUser(u)}
              title="Ban Trainer Account"
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-surface-raised border border-border text-danger hover:bg-surface transition-colors touch-manipulation"
            >
              <Ban className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 bg-surface border border-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Trainer Accounts</h1>
            <Badge variant="ink" className="text-[10px] font-black uppercase">
              {data?.total ?? 0} Total
            </Badge>
          </div>
          <p className="text-xs text-muted">
            Inspect trainer profiles, review active bans, and grant currencies or items with audit protection.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 sm:p-4 bg-surface border border-border rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by username or email address..."
              className="w-full pl-9 pr-4 py-2.5 min-h-[44px] bg-background border border-border rounded-xl text-base sm:text-xs text-foreground placeholder:text-muted focus:outline-hidden focus:border-foreground touch-manipulation"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="flex-1 sm:flex-initial px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-xl text-base sm:text-xs text-foreground focus:outline-hidden touch-manipulation"
            >
              <option value="all">All Roles</option>
              <option value="USER">Player (USER)</option>
              <option value="MODERATOR">Moderator</option>
              <option value="ADMIN">Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="flex-1 sm:flex-initial px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-xl text-base sm:text-xs text-foreground focus:outline-hidden touch-manipulation"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="banned">Banned Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Virtualized Data Table */}
      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyMessage="No trainers found matching your search."
      />

      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-2xl text-xs">
          <span className="text-muted">
            Page <strong className="text-foreground">{data.page}</strong> of{' '}
            <strong className="text-foreground">{data.totalPages}</strong> ({data.total} total)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={data.page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={data.page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Ban User Dialog */}
      <ConfirmDialog
        isOpen={Boolean(banTargetUser)}
        onClose={() => setBanTargetUser(null)}
        onConfirm={handleConfirmBan}
        title={`Ban Trainer "${banTargetUser?.username}"?`}
        description="Banning this user will immediately invalidate their sessions and block login access."
        confirmLabel="Confirm Ban"
        isLoading={banMutation.isPending}
      />

      {/* Unban User Dialog */}
      <ConfirmDialog
        isOpen={Boolean(unbanTargetUser)}
        onClose={() => setUnbanTargetUser(null)}
        onConfirm={handleConfirmUnban}
        title={`Unban Trainer "${unbanTargetUser?.username}"?`}
        description="Lifting this ban will restore full access for the user to login and play."
        confirmLabel="Lift Ban"
        isLoading={unbanMutation.isPending}
      />

      {/* Grant Currency Modal */}
      {currencyTargetUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="sm:hidden mx-auto mt-3 -mb-1 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">
                  Grant Currency: {currencyTargetUser.username}
                </h3>
                <span className="text-[10px] text-muted font-mono">{currencyTargetUser.email}</span>
              </div>
              <button
                onClick={() => setCurrencyTargetUser(null)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted hover:text-foreground touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Currency Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrencyType('astralCoins')}
                    className={`p-2.5 min-h-[44px] rounded-xl border text-xs font-bold transition-colors touch-manipulation flex items-center justify-center ${
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
                    className={`p-2.5 min-h-[44px] rounded-xl border text-xs font-bold transition-colors touch-manipulation flex items-center justify-center ${
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
                  className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-xl text-base sm:text-xs text-foreground focus:outline-hidden touch-manipulation"
                />
              </div>

              <ReasonField
                value={currencyReason}
                onChange={setCurrencyReason}
                label="Audit Reason (Mandatory)"
                helperText="Required log entry for currency generation."
              />
            </div>

            <div className="p-3 sm:p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setCurrencyTargetUser(null)}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveGrantCurrency}
                disabled={grantCurrencyMutation.isPending || currencyReason.trim().length < 5}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                {grantCurrencyMutation.isPending ? 'Granting...' : 'Grant Currency'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Grant Item Modal */}
      {itemTargetUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="sm:hidden mx-auto mt-3 -mb-1 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">
                  Grant Item: {itemTargetUser.username}
                </h3>
                <span className="text-[10px] text-muted font-mono">{itemTargetUser.email}</span>
              </div>
              <button
                onClick={() => setItemTargetUser(null)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted hover:text-foreground touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Item Key</label>
                <input
                  type="text"
                  value={itemKey}
                  onChange={(e) => setItemKey(e.target.value.trim().toLowerCase())}
                  placeholder="e.g. ultra_ball, rare_candy"
                  className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-xl text-base sm:text-xs text-foreground focus:outline-hidden font-mono touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Quantity</label>
                <input
                  type="text"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value.replace(/\D/g, ''))}
                  placeholder="Quantity (e.g. 5)"
                  className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-xl text-base sm:text-xs text-foreground focus:outline-hidden touch-manipulation"
                />
              </div>

              <ReasonField
                value={itemReason}
                onChange={setItemReason}
                label="Audit Reason (Mandatory)"
                helperText="Required log entry for item injection."
              />
            </div>

            <div className="p-3 sm:p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setItemTargetUser(null)}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveGrantItem}
                disabled={grantItemMutation.isPending || itemReason.trim().length < 5}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
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
