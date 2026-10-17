import { useAdminStats } from '../hooks/useAdminDashboard';
import { StatCard } from '../components/StatCard';
import { Users, Coins, Sparkles, Swords, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export function Dashboard() {
  const { data: stats, isLoading, isError, refetch } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-2xl">
        <ShieldAlert className="w-10 h-10 text-danger mx-auto mb-3" />
        <h3 className="text-lg font-black text-foreground mb-1">Failed to load statistics</h3>
        <p className="text-sm text-muted mb-4">Could not retrieve live server metrics.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 bg-surface border border-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Staff Administration</h1>
          <p className="text-xs text-muted mt-1">
            System overview, economy vitals, and player moderation controls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/shop"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <span>Manage Pokémart</span>
          </Link>
          <Link
            to="/admin/audit"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-foreground text-xs font-bold hover:bg-surface transition-colors"
          >
            <span>View Audit Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Trainers (24h)"
          value={stats.activePlayers24h.toLocaleString()}
          icon={Users}
          description={`${stats.newRegistrations24h} registered today`}
        />
        <StatCard
          title="Astral Coins Circulation"
          value={stats.currencyInCirculation.astralCoins.toLocaleString()}
          icon={Coins}
          description="Total player balance"
        />
        <StatCard
          title="Infinity Coins Circulation"
          value={stats.currencyInCirculation.infinityCoins.toLocaleString()}
          icon={Sparkles}
          description="Total premium balance"
        />
        <StatCard
          title="Battles (24h)"
          value={stats.battles24h.toLocaleString()}
          icon={Swords}
          description="Completed battle encounters"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Purchased Items */}
        <Card className="bg-surface border-border">
          <Card.Header className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-foreground uppercase tracking-wider">
                Top Purchased Items
              </span>
              <Link
                to="/admin/shop"
                className="text-xs font-bold text-muted hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <span>Edit Pricing</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </Card.Header>
          <Card.Body className="pt-4">
            {stats.topPurchasedItems.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">No purchases recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.topPurchasedItems.map((item, idx) => (
                  <div
                    key={item.itemKey}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-xs font-black text-muted">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-foreground block">{item.name}</span>
                        <span className="text-[10px] text-muted font-mono">{item.itemKey}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-foreground block">
                        {item.totalPurchased.toLocaleString()} sold
                      </span>
                      <span className="text-[10px] text-muted font-mono">
                        {item.totalVolume.toLocaleString()} coins
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Recent Staff Actions */}
        <Card className="bg-surface border-border">
          <Card.Header className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-foreground uppercase tracking-wider">
                Recent Staff Actions
              </span>
              <Link
                to="/admin/audit"
                className="text-xs font-bold text-muted hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <span>Full History</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </Card.Header>
          <Card.Body className="pt-4">
            {stats.recentActions.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">No recent admin actions recorded.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentActions.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-surface-raised border border-border/60 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-foreground">{log.action}</span>
                        <Badge variant="ink" className="text-[10px] py-0 px-1.5 uppercase font-mono">
                          {log.entityType}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted truncate">
                        Reason: <span className="text-foreground">{log.reason || 'N/A'}</span>
                      </p>
                      <span className="text-[10px] text-subtle font-mono">
                        by {log.adminUsername || 'Staff'} • {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
