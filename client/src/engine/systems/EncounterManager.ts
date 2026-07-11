export class EncounterManager {
  private accumulatedDistance: number = 0;
  private encounterThreshold: number = 0;
  private encounterRate: number = 0.05; // 5% chance per "step" (approx 32 pixels)
  private isEncounterTriggered: boolean = false;
  
  public onEncounter: () => void;

  constructor(onEncounter: () => void) {
    this.onEncounter = onEncounter;
    this.resetThreshold();
  }

  private resetThreshold() {
    // Randomize the distance needed before the next encounter check (between 32 and 128 pixels)
    this.encounterThreshold = 32 + Math.random() * 96;
    this.accumulatedDistance = 0;
  }

  public updateDistance(distanceWalked: number, hasSpawns: boolean) {
    if (this.isEncounterTriggered || !hasSpawns) return;

    this.accumulatedDistance += distanceWalked;

    if (this.accumulatedDistance >= this.encounterThreshold) {
      // Roll for encounter
      if (Math.random() <= this.encounterRate) {
        this.triggerEncounter();
      } else {
        this.resetThreshold();
      }
    }
  }

  private triggerEncounter() {
    this.isEncounterTriggered = true;
    console.log("Wild encounter triggered!");
    this.onEncounter();
  }
}
