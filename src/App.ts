import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  GridHelper,
  Vector3,
  ParametricBufferGeometry,
  Mesh,
  DoubleSide,
  BufferAttribute,
  MeshLambertMaterial,
  AmbientLight,
  DirectionalLight,
} from 'three'
import { Cloth, satisfyConstraints } from './Cloth'

const CLOTH_WIDTH = 1
const CLOTH_HEIGHT = 1
const CLOTH_RESOLUTION_X = 10
const CLOTH_RESOLUTION_Y = 10

export class App {
  scene = new Scene()
  camera = new PerspectiveCamera()
  cloth: Cloth = new Cloth(
    CLOTH_WIDTH,
    CLOTH_HEIGHT,
    CLOTH_RESOLUTION_X,
    CLOTH_RESOLUTION_Y
  )
  gravity = new Vector3(0, -0.2, 0)
  forceAttenuation = 0.9

  forces = [new Vector3(), new Vector3(), new Vector3(), new Vector3()]

  clothGeometry = new ParametricBufferGeometry(
    (u: number, v: number, target: Vector3) =>
      this.cloth.shapeFunction(u, v, target),
    this.cloth.resolutionW,
    this.cloth.resolutionH
  )
  clothMaterial = new MeshLambertMaterial({
    color: 0xffffff,
    side: DoubleSide,
    wireframe: true,
  })
  clothMesh = new Mesh(this.clothGeometry, this.clothMaterial)

  cameraSpeed = 1

  constructor() {
    const { scene, clothMaterial, clothMesh } = this

    const directionalLight = new DirectionalLight(0x888888)
    directionalLight.position.set(1.5, 2, 1.5)
    directionalLight.lookAt(0, 0, 0)
    scene.add(directionalLight)

    scene.add(new AmbientLight(0x888888))
    scene.add(new GridHelper(1, 10))

    clothMesh.position.set(0, 0.1, 0)
    scene.add(clothMesh)

    clothMaterial.depthTest = false
    clothMesh.renderOrder = 1
  }

  initCloth(): void {
    this.cloth = new Cloth(
      CLOTH_WIDTH,
      CLOTH_HEIGHT,
      CLOTH_RESOLUTION_X,
      CLOTH_RESOLUTION_Y
    )
  }

  tick(t: number): void {
    const { cloth, cameraSpeed, gravity, clothGeometry } = this

    const CYCLE = 20000 / cameraSpeed
    const cycle = (t % CYCLE) / CYCLE
    const { camera } = this
    camera.position.set(
      Math.cos(cycle * Math.PI * 2),
      1,
      Math.sin(cycle * Math.PI * 2)
    )
    camera.lookAt(0, 0, 0)

    const u = Math.floor((this.cloth.resolutionH * this.cloth.resolutionW) / 4)
    const v = Math.floor(this.cloth.resolutionW / 4)
    cloth.particles[u * 1 - v].addForce(this.forces[0])
    cloth.particles[u * 1 + v].addForce(this.forces[1])
    cloth.particles[u * 3 - v].addForce(this.forces[2])
    cloth.particles[u * 3 + v].addForce(this.forces[3])

    for (let i = 0; i < cloth.particles.length; i++) {
      const particle = cloth.particles[i]
      const v = particle.position
      particle.addForce(gravity)
      particle.integrate(Math.pow(18 / 1000, 2))

      if (v.y < 0) {
        v.y = 0
      }

      clothGeometry.attributes.position.setXYZ(i, v.x, v.y, v.z)
    }

    for (const constraint of cloth.constraints) {
      satisfyConstraints(...constraint)
    }

    ;(clothGeometry.attributes.position as BufferAttribute).needsUpdate = true
    clothGeometry.computeVertexNormals()

    for (const force of this.forces) {
      force.multiplyScalar(this.forceAttenuation)
    }
  }

  shoot(forces: Vector3[]): void {
    for (let i = 0; i < forces.length; i++) {
      this.forces[i] = this.forces[i] || new Vector3()
      this.forces[i].copy(forces[i])
    }
  }

  setAspectRatio(aspect: number): void {
    this.camera.aspect = aspect
    this.camera.updateProjectionMatrix()
  }

  renderTo(renderer: WebGLRenderer): void {
    renderer.render(this.scene, this.camera)
  }
}
