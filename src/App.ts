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

export class App {
  scene = new Scene()
  camera = new PerspectiveCamera()
  cloth = new Cloth(1, 1, 10, 10)
  gravity = new Vector3(0, -0.01, 0)

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

  cameraSpeed = 1

  constructor() {
    const { scene, clothGeometry, clothMaterial } = this
    console.log(this.cloth)

    const directionalLight = new DirectionalLight(0x888888)
    directionalLight.position.set(1.5, 2, 1.5)
    directionalLight.lookAt(0, 0, 0)
    scene.add(directionalLight)

    scene.add(new AmbientLight(0x888888))
    scene.add(new GridHelper(1, 10))

    const clothMesh = new Mesh(clothGeometry, clothMaterial)
    clothMesh.position.set(0, 0.1, 0)
    scene.add(clothMesh)
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
  }

  setAspectRatio(aspect: number): void {
    this.camera.aspect = aspect
    this.camera.updateProjectionMatrix()
  }

  renderTo(renderer: WebGLRenderer): void {
    renderer.render(this.scene, this.camera)
  }
}
