import type { ShopItemDto } from './response/ShopItemDto';

export class ShopMapper {
  static toShopItemDto(entity: any): ShopItemDto {
    return {
      id: entity.id,
      name: entity.name,
      cost: entity.cost,
      description: entity.description || null,
    };
  }

  static toShopItemDtoList(entities: any[]): ShopItemDto[] {
    return entities.map(ShopMapper.toShopItemDto);
  }
}
