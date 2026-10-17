export class Player {
  public x: number;
  public y: number;
  public width: number = 32;
  public height: number = 32;
  public speed: number = 200; // pixels per second

  // Map boundaries
  private mapWidth: number = 0;
  private mapHeight: number = 0;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
  }

  public setBounds(width: number, height: number) {
    this.mapWidth = width;
    this.mapHeight = height;
  }

  public update(dt: number, dir: { x: number; y: number }) {
    // Normalize diagonal movement
    let moveX = dir.x;
    let moveY = dir.y;
    
    if (moveX !== 0 && moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      moveX /= length;
      moveY /= length;
    }

    this.x += moveX * this.speed * dt;
    this.y += moveY * this.speed * dt;

    // Clamp to map boundaries
    if (this.mapWidth > 0 && this.mapHeight > 0) {
      this.x = Math.max(this.width / 2, Math.min(this.mapWidth - this.width / 2, this.x));
      this.y = Math.max(this.height / 2, Math.min(this.mapHeight - this.height / 2, this.y));
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    // Render a simple red placeholder character
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + this.height / 2, this.width / 2, this.height / 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw body
    ctx.fillStyle = '#ef4444'; // red-500
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw face direction indicator (assuming we always face down for placeholder if we aren't tracking direction)
    // To make it look like a little guy
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(screenX - 6, screenY - 4, 4, 0, Math.PI * 2);
    ctx.arc(screenX + 6, screenY - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(screenX - 6, screenY - 4, 2, 0, Math.PI * 2);
    ctx.arc(screenX + 6, screenY - 4, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
