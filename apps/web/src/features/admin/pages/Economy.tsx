import { useAdminEconomy } from '../hooks/useAdminDashboard';
import { StatCard } from '../components/StatCard';
import { Coins, Sparkles, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

export function Economy() {
  const { data: economy, isLoading, isError, refetch } = useAdminEconomy();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !economy) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-2xl">
        <h3 className="text-lg font-black text-foreground mb-1">Failed to load economy analytics</h3>
        <p className="text-xs text-muted mb-4">Could not retrieve live circulation figures.</p>
        <Button variant="outline" onClick={() => refetch()} className="text-xs">
          Try Again
        </Button>
      </div>
    );
  }

  const { summary, sources = [], sinks = [] } = economy;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-surface border border-border rounded-2xl">
        <h1 className="text-2xl font-black text-foreground tracking-tight">Game Economy &amp; Flow</h1>
        <p className="text-xs text-muted mt-1">
          Monitor currency sinks, sources, overall liquidity, and prevent hyperinflation.
        </p>
      </div>

      {/* Circulation Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Astral Coins Circulation"
          value={summary.totalAstralCoins.toLocaleString()}
          icon={Coins}
          description="Sum of all trainer balances"
        />
        <StatCard
          title="Infinity Coins Circulation"
          value={summary.totalInfinityCoins.toLocaleString()}
          icon={Sparkles}
          description="Sum of all premium balances"
        />
        <StatCard
          title="24h Astral Net Flow"
          value={`${summary.netAstralChange24h >= 0 ? '+' : ''}${summary.netAstralChange24h.toLocaleString()}`}
          icon={summary.netAstralChange24h >= 0 ? TrendingUp : TrendingDown}
          description="Generated vs burned in last 24h"
        />
        <StatCard
          title="24h Infinity Net Flow"
          value={`${summary.netInfinityChange24h >= 0 ? '+' : ''}${summary.netInfinityChange24h.toLocaleString()}`}
          icon={summary.netInfinityChange24h >= 0 ? TrendingUp : TrendingDown}
          description="Purchased/granted vs spent in 24h"
        />
      </div>

      {/* Sources vs Sinks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sources (Inflows) */}
        <Card className="bg-surface border-border">
          <Card.Header className="pb-3 border-b border-border">
            <span className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-muted" />
              <span>Currency Sources (Inflow)</span>
            </span>
          </Card.Header>
          <Card.Body className="pt-4 space-y-3">
            {sources.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">No source events recorded.</p>
            ) : (
              sources.map((item) => (
                <div key={item.source} className="p-3 bg-surface-raised border border-border/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground capitalize">{item.source}</span>
                    <span className="font-mono text-foreground font-black">
                      +{item.amount.toLocaleString()} ({item.currency})
                    </span>
                  </div>
                </div>
              ))
            )}
          </Card.Body>
        </Card>

        {/* Sinks (Outflows) */}
        <Card className="bg-surface border-border">
          <Card.Header className="pb-3 border-b border-border">
            <span className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-muted" />
              <span>Currency Sinks (Outflow)</span>
            </span>
          </Card.Header>
          <Card.Body className="pt-4 space-y-3">
            {sinks.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">No sink events recorded.</p>
            ) : (
              sinks.map((item) => (
                <div key={item.sink} className="p-3 bg-surface-raised border border-border/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground capitalize">{item.sink}</span>
                    <span className="font-mono text-foreground font-black">
                      -{item.amount.toLocaleString()} ({item.currency})
                    </span>
                  </div>
                </div>
              ))
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
