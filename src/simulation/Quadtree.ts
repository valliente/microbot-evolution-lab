export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export class Quadtree<T extends { x: number; y: number }> {
  public boundary: Rectangle;
  public capacity: number;
  public points: T[] = [];
  public divided: boolean = false;

  public northwest: Quadtree<T> | null = null;
  public northeast: Quadtree<T> | null = null;
  public southwest: Quadtree<T> | null = null;
  public southeast: Quadtree<T> | null = null;

  constructor(boundary: Rectangle, capacity: number = 8) {
    this.boundary = boundary;
    this.capacity = capacity;
  }

  private subdivide(): void {
    const { x, y, width, height } = this.boundary;
    const w2 = width / 2;
    const h2 = height / 2;

    this.northwest = new Quadtree<T>({ x, y, width: w2, height: h2 }, this.capacity);
    this.northeast = new Quadtree<T>({ x: x + w2, y, width: w2, height: h2 }, this.capacity);
    this.southwest = new Quadtree<T>({ x, y: y + h2, width: w2, height: h2 }, this.capacity);
    this.southeast = new Quadtree<T>({ x: x + w2, y: y + h2, width: w2, height: h2 }, this.capacity);

    this.divided = true;
  }

  public insert(point: T): boolean {
    if (!this.contains(this.boundary, point)) {
      return false;
    }

    if (this.points.length < this.capacity && !this.divided) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
      // Re-insert existing points into children
      for (const p of this.points) {
        this.insertToChildren(p);
      }
      this.points = [];
    }

    return this.insertToChildren(point);
  }

  private insertToChildren(point: T): boolean {
    return (
      (this.northwest && this.northwest.insert(point)) ||
      (this.northeast && this.northeast.insert(point)) ||
      (this.southwest && this.southwest.insert(point)) ||
      (this.southeast && this.southeast.insert(point)) ||
      false
    );
  }

  private contains(rect: Rectangle, point: { x: number; y: number }): boolean {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  public queryRange(circle: Circle, found: T[] = []): T[] {
    if (!this.intersectsCircle(this.boundary, circle)) {
      return found;
    }

    for (const p of this.points) {
      const distSq = (p.x - circle.x) * (p.x - circle.x) + (p.y - circle.y) * (p.y - circle.y);
      if (distSq <= circle.radius * circle.radius) {
        found.push(p);
      }
    }

    if (this.divided) {
      this.northwest?.queryRange(circle, found);
      this.northeast?.queryRange(circle, found);
      this.southwest?.queryRange(circle, found);
      this.southeast?.queryRange(circle, found);
    }

    return found;
  }

  private intersectsCircle(rect: Rectangle, circle: Circle): boolean {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    const distX = circle.x - closestX;
    const distY = circle.y - closestY;

    return distX * distX + distY * distY <= circle.radius * circle.radius;
  }

  public clear(): void {
    this.points = [];
    this.divided = false;
    this.northwest = null;
    this.northeast = null;
    this.southwest = null;
    this.southeast = null;
  }
}
