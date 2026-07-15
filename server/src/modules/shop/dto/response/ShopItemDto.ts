export type ShopItemDto = Readonly<{
  id: string;
  name: string;
  cost: number;
  description: string | null;
}>;
