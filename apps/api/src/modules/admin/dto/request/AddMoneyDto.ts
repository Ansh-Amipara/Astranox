export type AddMoneyDto = Readonly<{
  amount: number;
  currencyType: 'astralCoins' | 'infinityCoins';
}>;
