export const typeColors: Record<string, string> = {
  normal: 'bg-stone-400 text-white',
  fire: 'bg-red-500 text-white',
  water: 'bg-blue-500 text-white',
  electric: 'bg-yellow-400 text-slate-900',
  grass: 'bg-green-500 text-white',
  ice: 'bg-cyan-300 text-slate-900',
  fighting: 'bg-orange-700 text-white',
  poison: 'bg-purple-500 text-white',
  ground: 'bg-amber-600 text-white',
  flying: 'bg-indigo-300 text-slate-900',
  psychic: 'bg-pink-500 text-white',
  bug: 'bg-lime-500 text-slate-900',
  rock: 'bg-yellow-700 text-white',
  ghost: 'bg-violet-700 text-white',
  dragon: 'bg-indigo-600 text-white',
  dark: 'bg-stone-800 text-white',
  steel: 'bg-slate-400 text-white',
};

export const getEventMessage = (ev: any, player: any, wild: any) => {
  const name = ev.pokemonId === player.id ? player.speciesName : wild.speciesName;
  switch (ev.type) {
    case 'move': return `${name} used ${ev.moveName}!`;
    case 'damage': return ev.effectiveness > 1 ? "It's super effective!" : ev.effectiveness < 1 ? "It's not very effective..." : null;
    case 'miss': return `${name}'s attack missed!`;
    case 'faint': return `${name} fainted!`;
    case 'status_inflicted': return `${name} got ${ev.status}!`;
    case 'status_effect': return ev.message || null;
    case 'status_cleared': return `${name} recovered!`;
    case 'switch': return ev.isPlayer ? `You sent out ${ev.name}!` : `Foe sent out ${ev.name}!`;
    case 'xp_gain': return `${name} gained ${ev.amount} Exp. Points!`;
    case 'level_up': return `${name} grew to Lv. ${ev.level}!`;
    case 'fled': return "Got away safely!";
    case 'text': return ev.text;
    case 'catch_attempt': 
      if (ev.success) {
        return `Gotcha! ${wild.speciesName} was caught!`;
      } else {
        if (ev.shakes === 0) return `Oh no! The Pokémon broke free!`;
        if (ev.shakes === 1) return `Aww! It appeared to be caught!`;
        if (ev.shakes === 2) return `Aargh! Almost had it!`;
        if (ev.shakes === 3) return `Shoot! It was so close too!`;
        return `The Pokémon broke free!`;
      }
    default: return null;
  }
};
