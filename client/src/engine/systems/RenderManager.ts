export class RenderManager {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private mapImage: HTMLImageElement | null = null;
  private isMapLoaded: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get 2d context");
    this.ctx = ctx;
    
    // Pixel art crispness
    this.ctx.imageSmoothingEnabled = false;
  }

  public loadMapImage(url: string, onLoad: (width: number, height: number) => void) {
    this.isMapLoaded = false;
    const img = new Image();
    img.onload = () => {
      this.mapImage = img;
      this.isMapLoaded = true;
      onLoad(img.width, img.height);
    };
    img.src = url;
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.imageSmoothingEnabled = false; // Reset on resize
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public clear() {
    this.ctx.fillStyle = '#0B0F19';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public drawMap(cameraX: number, cameraY: number) {
    if (!this.isMapLoaded || !this.mapImage) return;

    // Draw the portion of the map visible to the camera
    this.ctx.drawImage(
      this.mapImage,
      cameraX, cameraY, this.canvas.width, this.canvas.height, // Source rect
      0, 0, this.canvas.width, this.canvas.height // Dest rect
    );
  }
}
