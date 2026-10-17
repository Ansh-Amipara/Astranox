export class GameLoop {
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  
  public update: (dt: number) => void = () => {};
  public render: () => void = () => {};

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    // Calculate delta time in seconds
    let dt = (currentTime - this.lastTime) / 1000;
    
    // Prevent massive delta times if the tab was suspended
    if (dt > 0.1) dt = 0.1;
    
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  }
}
