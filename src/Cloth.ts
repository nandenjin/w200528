import { Vector3 } from 'three'

const tmp = new Vector3()

export class Particle {
  position = new Vector3()
  private previous = new Vector3()
  private original = new Vector3()
  acceleration = new Vector3()
  mass: number

  readonly DAMPING = 0.33
  readonly DRAG = 1 - this.DAMPING

  constructor(
    u: number,
    v: number,
    shapeFunction: (u: number, v: number, target: Vector3) => unknown,
    mass: number
  ) {
    const { position, previous, original } = this

    shapeFunction(u, v, position)
    shapeFunction(u, v, previous)
    shapeFunction(u, v, original)

    this.mass = mass
  }

  integrate(timeSq: number): void {
    const { position, previous, acceleration, DRAG } = this
    tmp
      .subVectors(position, previous)
      .multiplyScalar(DRAG)
      .add(position)
      .add(acceleration.multiplyScalar(timeSq))

    previous.copy(position)
    position.copy(tmp)
    acceleration.set(0, 0, 0)
  }

  addForce(force: Vector3): void {
    const { acceleration, mass } = this
    acceleration.add(tmp.copy(force).multiplyScalar(1 / mass))
  }
}

export class Cloth {
  particles: Particle[] = []
  constraints: [Particle, Particle, number][] = []

  width = 0
  height = 0
  resolutionW = 0
  resolutionH = 0

  readonly MASS = 0.1
  readonly DISTANCE = 0.1

  constructor(
    width: number,
    height: number,
    resolutionW = 10,
    resolutionH = 10
  ) {
    const { particles, constraints, MASS, DISTANCE } = this
    this.width = width
    this.height = height
    this.resolutionW = resolutionW
    this.resolutionH = resolutionH

    for (let v = 0; v <= resolutionH; v++) {
      for (let u = 0; u <= resolutionW; u++) {
        particles.push(
          new Particle(
            u / resolutionW,
            v / resolutionH,
            (u: number, v: number, target: Vector3) =>
              this.shapeFunction(u, v, target),
            MASS
          )
        )
      }
    }

    const index = (u: number, v: number) => v * (resolutionW + 1) + u

    for (let v = 0; v <= resolutionH; v++) {
      for (let u = 0; u <= resolutionW; u++) {
        if (v + 1 <= resolutionH) {
          constraints.push([
            particles[index(u, v)],
            particles[index(u, v + 1)],
            DISTANCE,
          ])
        }
        if (u + 1 <= resolutionW) {
          constraints.push([
            particles[index(u, v)],
            particles[index(u + 1, v)],
            DISTANCE,
          ])
        }
      }
    }
  }

  shapeFunction(u: number, v: number, target: Vector3): void {
    const { width, height } = this
    target.set((u - 0.5) * width, 0, (v - 0.5) * height)
  }
}

export function satisfyConstraints(
  p1: Particle,
  p2: Particle,
  distance: number
): void {
  tmp.subVectors(p2.position, p1.position)
  const currentDist = tmp.length()

  if (currentDist === 0) return

  const correctionHalf = tmp
    .multiplyScalar(1 - distance / currentDist)
    .multiplyScalar(0.5)

  p1.position.add(correctionHalf)
  p2.position.sub(correctionHalf)
}
