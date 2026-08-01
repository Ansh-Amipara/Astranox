export type BuyBulkItemDto = Readonly<{
  items: {
    itemId: string;
    quantity: number;
  }[];
}>;
