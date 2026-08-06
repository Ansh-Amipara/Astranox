export class InputManager {
  private keys: Set<string> = new Set();
  private lastKey: string | null = null;

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Only capture game keys
    if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      this.keys.add(e.key);
      this.lastKey = e.key;
      // Prevent default scrolling for arrows
      if (e.key.startsWith('Arrow')) e.preventDefault();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key);
    if (this.lastKey === e.key) {
      this.lastKey = null;
    }
  };

  public getMovementDirection(): { x: number; y: number } {
    const dir = { x: 0, y: 0 };
    
    // If the last pressed key is still held down, prioritize it
    const activeKey = this.keys.has(this.lastKey!) ? this.lastKey : (this.keys.size > 0 ? Array.from(this.keys)[this.keys.size - 1] : null);

    if (!activeKey) return dir;

    if (activeKey === 'w' || activeKey === 'ArrowUp') dir.y = -1;
    if (activeKey === 's' || activeKey === 'ArrowDown') dir.y = 1;
    if (activeKey === 'a' || activeKey === 'ArrowLeft') dir.x = -1;
    if (activeKey === 'd' || activeKey === 'ArrowRight') dir.x = 1;

    return dir;
  }

  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
