export type TurnResultDto = Readonly<{
  status: string;
  turnNumber: number;
  events: any[];
  p1State?: any;
  p2State?: any;
}>;
