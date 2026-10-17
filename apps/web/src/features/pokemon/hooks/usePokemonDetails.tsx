import React, { useState } from 'react';
import { OwnedPokemonDto } from '@astranox/types';;
import { getSpriteUrl } from '@/shared/api/api';
import { getPotentialBadgeClasses, formatPotential } from '@/features/pokemon/pokemonUtils';
import { Modal } from '@/shared/ui/Modal';
import { getMaxLevelForPotential } from '@/features/pokemon/pokemonUtils';
import { getBattleRank } from '@/features/social/battleRanksMap';

// --- Stat Calculation Utilities ---
function calculateHP(base: number, iv: number, level: number, isGmax: boolean = false): number {
  if (base === 1) return 1;
  const hp = Math.floor(((2 * base + iv) * level) / 100) + level + 10;
  return isGmax ? hp * 2 : hp;
}

function calculateStat(base: number, iv: number, level: number): number {
  return Math.floor(((2 * base + iv) * level) / 100) + 5;
}

export function usePokemonDetails() {
  const [detailsPkm, setDetailsPkm] = useState<OwnedPokemonDto | null>(null);

  const promptDetails = (pokemon: OwnedPokemonDto) => {
    setDetailsPkm(pokemon);
  };

  const PokemonDetailsUI = detailsPkm ? (
    <Modal isOpen={true} onClose={() => setDetailsPkm(null)} className="max-w-md" hideHeader>
      <div className="p-6 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <img
              src={getSpriteUrl(detailsPkm.speciesId)}
              className="w-20 h-20 bg-surface-raised rounded-xl object-contain pixelated border border-border"
            />
            <div>
              <h2 className="text-3xl font-black text-foreground capitalize">
                {detailsPkm.nickname || detailsPkm.species?.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded font-bold border border-border bg-surface-raised text-foreground">
                  Lv. {detailsPkm.level}
                </span>
                <span className="text-xs px-2 py-1 rounded font-bold border border-border bg-surface-raised text-foreground uppercase tracking-wider">
                  Rank {getBattleRank(detailsPkm.speciesId)}
                </span>
                {detailsPkm.potential && (
                  <span className={getPotentialBadgeClasses(detailsPkm.potential)}>
                    {formatPotential(detailsPkm.potential)}
                  </span>
                )}
                {detailsPkm.potential && detailsPkm.level >= getMaxLevelForPotential(detailsPkm.potential as string) && (
                  <span className="text-xs px-2 py-1 rounded font-bold border border-border/50 bg-surface-raised text-foreground uppercase tracking-wider">
                    Capped
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => setDetailsPkm(null)} className="text-muted hover:text-subtle text-xl">✕</button>
        </div>

        <div className="w-full">
          {/* Stats section */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 border-b border-border pb-2">Stats Overview</h3>
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-raised/50 text-muted text-xs uppercase font-bold">
                  <tr>
                    <th className="px-4 py-3">Stat</th>
                    <th className="px-4 py-3 text-center">Base</th>
                    <th className="px-4 py-3 text-center">IV</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { label: 'HP', stat: calculateHP(detailsPkm.species.hp, detailsPkm.ivHp || 0, detailsPkm.level, detailsPkm.species.isGmax), iv: detailsPkm.ivHp || 0, base: detailsPkm.species.hp },
                    { label: 'Attack', stat: calculateStat(detailsPkm.species.attack, detailsPkm.ivAttack || 0, detailsPkm.level), iv: detailsPkm.ivAttack || 0, base: detailsPkm.species.attack },
                    { label: 'Defense', stat: calculateStat(detailsPkm.species.defense, detailsPkm.ivDefense || 0, detailsPkm.level), iv: detailsPkm.ivDefense || 0, base: detailsPkm.species.defense },
                    { label: 'Sp. Atk', stat: calculateStat(detailsPkm.species.spAtk, detailsPkm.ivSpAtk || 0, detailsPkm.level), iv: detailsPkm.ivSpAtk || 0, base: detailsPkm.species.spAtk },
                    { label: 'Sp. Def', stat: calculateStat(detailsPkm.species.spDef, detailsPkm.ivSpDef || 0, detailsPkm.level), iv: detailsPkm.ivSpDef || 0, base: detailsPkm.species.spDef },
                    { label: 'Speed', stat: calculateStat(detailsPkm.species.speed, detailsPkm.ivSpeed || 0, detailsPkm.level), iv: detailsPkm.ivSpeed || 0, base: detailsPkm.species.speed },
                  ].map(s => (
                    <tr key={s.label} className="hover:bg-surface-raised transition-colors">
                      <td className="px-4 py-2 text-muted">{s.label}</td>
                      <td className="px-4 py-2 text-center text-muted">{s.base}</td>
                      <td className="px-4 py-2 text-center text-muted">{s.iv}</td>
                      <td className="px-4 py-2 text-right text-muted">{s.stat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  ) : null;

  return { promptDetails, PokemonDetailsUI, detailsPkm };
}
