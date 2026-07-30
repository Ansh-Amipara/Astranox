import { useNavigate } from 'react-router-dom';
import { Box, Map, ShoppingCart, Target, BookOpen, Layers, Aperture, Info, ShoppingBag } from 'lucide-react';
import { TrainerSaveDto } from '@astranox/shared';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';

interface HomeNavigationWidgetProps {
  save: TrainerSaveDto;
}

export function HomeNavigationWidget({ save }: HomeNavigationWidgetProps) {
  const navigate = useNavigate();

  const navItems = [
    { id: 'explore', label: 'Explore', icon: Map, path: '/explore', color: 'text-silt-gold', bg: 'bg-silt-gold/10' },
    { id: 'arena', label: 'Battle Arena', icon: Target, path: '/arena', color: 'text-silt-peach', bg: 'bg-silt-peach/10' },
    { id: 'tower', label: 'Infinity Tower', icon: Layers, path: '/tower', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'rift', label: 'Dimensional Rift', icon: Aperture, path: '/rift', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'shop', label: 'Poké Mart', icon: ShoppingCart, path: '/shop', color: 'text-silt-khaki', bg: 'bg-silt-khaki/10' },
    { id: 'pokedex', label: 'Pokédex', icon: BookOpen, path: '/pokedex', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'info', label: 'Game Info', icon: Info, path: '/info', color: 'text-ink-light', bg: 'bg-ink-light/10' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, path: '/marketplace', color: 'text-pink-400', bg: 'bg-pink-400/10' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Actions (Left 2 Columns) */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="group relative bg-ink-dark/80 border border-ink-light/10 rounded-3xl p-5 shadow-sm text-left flex items-start justify-between transition-all duration-300 hover:-translate-y-1 hover:border-silt-gold/40 hover:shadow-[0_5px_20px_rgba(204,162,90,0.15)] overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-1 text-ink-paper group-hover:text-silt-gold transition-colors">{item.label}</h3>
            </div>
            <div className={`${item.bg} p-3 rounded-2xl group-hover:scale-110 transition-transform relative z-10`}>
              <item.icon className={`text-2xl ${item.color}`} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-ink-light/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        ))}
      </div>

      {/* Inventory Stats (Right Column) */}
      <div className="lg:col-span-1">
        <Card variant="glass" padding="lg" className="flex flex-col justify-between h-full">
          <div>
            <h2 className="text-xl font-extrabold mb-5 flex items-center gap-3 text-ink-paper tracking-wide">
              <div className="p-2 bg-silt-gold/20 rounded-lg">
                <Box className="text-silt-gold" />
              </div>
              INVENTORY
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-ink-dark/50 border border-ink-light/10 rounded-xl hover:bg-ink-dark/80 transition-colors">
                <span className="font-bold text-ink-light text-xs uppercase tracking-wider">Total Items</span>
                <span className="font-black text-ink-paper text-lg">
                  {save.inventory?.reduce((acc: number, item) => acc + item.quantity, 0) || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-ink-dark/50 border border-ink-light/10 rounded-xl hover:bg-ink-dark/80 transition-colors">
                <span className="font-bold text-ink-light text-xs uppercase tracking-wider">Unique Items</span>
                <span className="font-black text-ink-paper text-lg">
                  {save.inventory?.length || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate('/inventory')}
              icon={Box}
            >
              Open Bag
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
