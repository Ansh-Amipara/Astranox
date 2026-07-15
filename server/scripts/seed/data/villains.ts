import { BossTrainerData } from './boss-trainers';

export const villainTrainers: BossTrainerData[] = [
  { 
    name: 'Giovanni', 
    region: 'Kanto', 
    trainerClass: 'Team Rocket Boss', 
    trainerType: 'VILLAIN', 
    spriteId: 'giovanni', 
    rewardMoney: 10000, 
    party: [['rhydon', 50], ['dugtrio', 50], ['nidoqueen', 53], ['nidoking', 53], ['rhyperior', 55]] 
  },
  { 
    name: 'Maxie', 
    region: 'Hoenn', 
    trainerClass: 'Team Magma Leader', 
    trainerType: 'VILLAIN', 
    spriteId: 'maxie', 
    rewardMoney: 10000, 
    party: [['mightyena', 50], ['crobat', 50], ['weezing', 52], ['camerupt', 54]] 
  },
  { 
    name: 'Archie', 
    region: 'Hoenn', 
    trainerClass: 'Team Aqua Leader', 
    trainerType: 'VILLAIN', 
    spriteId: 'archie', 
    rewardMoney: 10000, 
    party: [['mightyena', 50], ['crobat', 50], ['muk', 52], ['sharpedo', 54]] 
  },
  { 
    name: 'Cyrus', 
    region: 'Sinnoh', 
    trainerClass: 'Team Galactic Boss', 
    trainerType: 'VILLAIN', 
    spriteId: 'cyrus', 
    rewardMoney: 10000, 
    party: [['houndoom', 50], ['honchkrow', 50], ['crobat', 50], ['gyarados', 50], ['weavile', 52]] 
  },
  { 
    name: 'Ghetsis', 
    region: 'Unova', 
    trainerClass: 'Team Plasma Boss', 
    trainerType: 'VILLAIN', 
    spriteId: 'ghetsis', 
    rewardMoney: 10000, 
    party: [['cofagrigus', 52], ['bouffalant', 52], ['seismitoad', 52], ['bisharp', 52], ['eelektross', 52], ['hydreigon', 54]] 
  },
  { 
    name: 'Lysandre', 
    region: 'Kalos', 
    trainerClass: 'Team Flare Boss', 
    trainerType: 'VILLAIN', 
    spriteId: 'lysandre', 
    rewardMoney: 10000, 
    party: [['mienshao', 51], ['honchkrow', 51], ['pyroar', 51], ['gyarados', 53]] 
  },
  { 
    name: 'Guzma', 
    region: 'Alola', 
    trainerClass: 'Team Skull Boss', 
    trainerType: 'VILLAIN', 
    spriteId: 'guzma', 
    rewardMoney: 10000, 
    party: [['golisopod', 51], ['ariados', 51], ['masquerain', 51], ['pinsir', 51], ['scizor', 53]] 
  }
];
