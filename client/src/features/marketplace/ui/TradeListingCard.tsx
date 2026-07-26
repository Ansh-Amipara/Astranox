import { getSpriteUrl } from '../../../shared/api/api';
import { Sparkles, ArrowRight } from 'lucide-react';

function timeAgo(date: Date, addSuffix = false): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const isFuture = seconds < 0;
  const absSeconds = Math.abs(seconds);

  let interval = absSeconds / 31536000;
  let text = '';
  if (interval > 1) {
    text = Math.floor(interval) + ' years';
  } else {
    interval = absSeconds / 2592000;
    if (interval > 1) {
      text = Math.floor(interval) + ' months';
    } else {
      interval = absSeconds / 86400;
      if (interval > 1) {
        text = Math.floor(interval) + ' days';
      } else {
        interval = absSeconds / 3600;
        if (interval > 1) {
          text = Math.floor(interval) + ' hours';
        } else {
          interval = absSeconds / 60;
          if (interval > 1) {
            text = Math.floor(interval) + ' minutes';
          } else {
            text = Math.floor(absSeconds) + ' seconds';
          }
        }
      }
    }
  }

  if (addSuffix) {
    return isFuture ? `in ${text}` : `${text} ago`;
  }
  return text;
}

interface TradeListingCardProps {
  listing: any;
  onClick: () => void;
}

export function TradeListingCard({ listing, onClick }: TradeListingCardProps) {
  const pokemon = listing.pokemon;
  const isExpired = new Date(listing.expiresAt) < new Date();

  return (
    <div
      onClick={onClick}
      className={`relative bg-white dark:bg-slate-800 rounded-2xl p-5 border shadow-sm transition-all cursor-pointer group ${
        isExpired || listing.status !== 'OPEN'
          ? 'border-slate-200 dark:border-slate-700 opacity-75'
          : 'border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-blue-500/10'
      }`}
    >
      {/* Header tags */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-black px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-md text-slate-500 uppercase tracking-wider">
          Lv. {pokemon.level}
        </span>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${
          listing.status === 'OPEN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
        }`}>
          {listing.status}
        </span>
      </div>

      {/* Pokemon Sprite & Name */}
      <div className="flex flex-col items-center mb-4 relative">
        <img
          src={getSpriteUrl(pokemon.species.id)}
          alt={pokemon.species.name}
          className="w-24 h-24 object-contain group-hover:scale-110 transition-transform pixelated"
        />
        <h3 className="text-xl font-black text-slate-800 dark:text-white mt-2 capitalize flex items-center gap-1">
          {pokemon.species.name}
          {pokemon.potential === 'LEGENDARY' && <Sparkles className="w-4 h-4 text-yellow-500" />}
        </h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
          {pokemon.potential.replace(/_/g, ' ')}
        </p>
      </div>

      {/* Seller info and Time */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center text-sm">
          <div className="text-slate-500 dark:text-slate-400">
            By <span className="font-bold text-slate-700 dark:text-slate-300">{listing.seller?.user?.username || 'You'}</span>
          </div>
          <div className="text-slate-400 dark:text-slate-500 text-xs font-medium">
            {listing.status === 'OPEN' ? (
              isExpired ? 'Expired' : `${timeAgo(new Date(listing.expiresAt))} left`
            ) : (
              timeAgo(new Date(listing.updatedAt), true)
            )}
          </div>
        </div>
      </div>
      
      {/* Offers Badge */}
      {listing._count && listing._count.offers > 0 && listing.status === 'OPEN' && (
        <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md animate-pulse">
          {listing._count.offers} Offer{listing._count.offers > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
