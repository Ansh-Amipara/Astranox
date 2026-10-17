export class Camera {
  public x: number = 0;
  public y: number = 0;
  
  private viewportWidth: number = 0;
  private viewportHeight: number = 0;
  
  private mapWidth: number = 0;
  private mapHeight: number = 0;

  public setViewport(width: number, height: number) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  public setBounds(width: number, height: number) {
    this.mapWidth = width;
    this.mapHeight = height;
  }

  public follow(targetX: number, targetY: number) {
    // Center the camera on the target
    this.x = targetX - this.viewportWidth / 2;
    this.y = targetY - this.viewportHeight / 2;

    // Clamp camera to map bounds
    if (this.mapWidth > 0 && this.mapHeight > 0) {
      this.x = Math.max(0, Math.min(this.x, this.mapWidth - this.viewportWidth));
      this.y = Math.max(0, Math.min(this.y, this.mapHeight - this.viewportHeight));
    }
  }
}
