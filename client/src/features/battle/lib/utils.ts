export const getEventMessage = (ev: any, player: any, wild: any) => {
  const name = ev.pokemonId === player.id ? player.speciesName : wild.speciesName;
  switch (ev.type) {
    case 'move': return `${name} used ${ev.moveName}!`;
    case 'damage': {
      let msg = `${name} took ${ev.amount} damage!`;
      if (ev.effectiveness > 1) msg += " It's super effective!";
      if (ev.effectiveness < 1) msg += " It's not very effective...";
      return msg;
    }
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
