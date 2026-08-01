export interface SlotPositionDto {
  readonly isParty: boolean;

  readonly position: number;
}

export interface SwapSlotsDto {
  readonly from: SlotPositionDto;
  readonly to: SlotPositionDto;
}
