import { getSpriteUrl } from '@/shared/api/api';
import { Sparkles } from 'lucide-react';

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

import { TradeListingDto } from '@astranox/types';;

interface TradeListingCardProps {
  listing: TradeListingDto & { _count?: { offers: number } };
  onClick: () => void;
}

export function TradeListingCard({ listing, onClick }: TradeListingCardProps) {
  const pokemon = listing.pokemon;
  const isExpired = new Date(listing.expiresAt) < new Date();

  return (
    <div
      onClick={onClick}
      className={`group relative bg-surface rounded-2xl p-5 border shadow-xs transition-all duration-200 ease-out cursor-pointer ${ isExpired || listing.status !== 'OPEN' ? 'border-border opacity-70' : 'border-border hover:border-border hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]' }`}
    >
      {/* Header tags */}
      <div className="flex justify-between items-start mb-3">
        <span className="text-[11px] font-black px-2.5 py-0.5 bg-surface-raised border border-border rounded-full text-foreground uppercase tracking-wider shadow-xs">
          Lv. {pokemon.level}
        </span>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-border shadow-xs ${ listing.status === 'OPEN' ? 'bg-surface-raised text-foreground' : 'bg-surface-raised text-muted' }`}>
          {listing.status}
        </span>
      </div>

      {/* Pokemon Sprite & Name */}
      <div className="flex flex-col items-center mb-4 relative">
        <div className="w-24 h-24 rounded-2xl bg-surface-raised border border-border/80 flex items-center justify-center p-2 mb-2 shadow-xs group-hover:scale-105 transition-transform duration-200">
          <img
            src={getSpriteUrl(pokemon.species.id)}
            alt={pokemon.species.name}
            className="w-20 h-20 object-contain drop-shadow-sm pixelated"
            loading="lazy"
          />
        </div>
        <h3 className="text-lg font-black text-foreground capitalize flex items-center gap-1.5 tracking-tight group-hover:text-primary transition-colors">
          {pokemon.species.name}
          {pokemon.potential === 'LEGENDARY' && <Sparkles className="w-4 h-4 text-foreground" />}
        </h3>
        <p className="text-[11px] font-bold text-muted uppercase tracking-wider mt-0.5 bg-surface-raised border border-border px-2 py-0.2 rounded-full">
          {pokemon.potential?.replace(/_/g, ' ')}
        </p>
      </div>

      {/* Seller info and Time */}
      <div className="pt-3.5 border-t border-border">
        <div className="flex justify-between items-center text-xs">
          <div className="text-muted">
            By <span className="font-bold text-foreground">{listing.seller?.user?.username || 'You'}</span>
          </div>
          <div className="text-muted font-semibold">
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
        <div className="absolute -top-2.5 -right-2.5 bg-primary text-primary-foreground border border-primary/20 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
          {listing._count.offers} Offer{listing._count.offers > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
