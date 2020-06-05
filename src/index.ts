import { WebGLRenderer, Vector3 } from 'three'
import dat, { GUI } from 'dat.gui'
import Stats from 'stats.js'
import { App } from './App'

import './style/index.scss'

// Renderer
const renderer = new WebGLRenderer({ antialias: true })

// Parameters GUI
let gui: GUI | null = null

// Render stats
const stats = new Stats()

// App
let app: App | null = null

function init() {
  // Add renderer to DOM tree
  renderer.domElement.classList.add('renderer')
  document.body.appendChild(renderer.domElement)

  // Add render stats monitor to DOM tree
  document.body.appendChild(stats.dom)

  // Initialize App
  createApp()

  // Start render
  requestAnimationFrame(renderTick)
}
window.addEventListener('DOMContentLoaded', init)

function createApp() {
  app = new App()
  gui = new dat.GUI()

  const forces: Vector3[] = []
  for (let i = 0; i < 4; i++) {
    forces.push(new Vector3(0, 50, 0))
  }

  gui.add(app, 'cameraSpeed', 0, 3)
  gui.add(app.gravity, 'y').name('gravity')
  gui.add(app, 'forceAttenuation')

  const FORCE_MAX = 100
  gui.add(forces[0], 'y', 0, FORCE_MAX).name('force0')
  gui.add(forces[1], 'y', 0, FORCE_MAX).name('force1')
  gui.add(forces[2], 'y', 0, FORCE_MAX).name('force2')
  gui.add(forces[3], 'y', 0, FORCE_MAX).name('force3')
  gui.add(
    {
      shoot() {
        app?.shoot(forces)
      },
    },
    'shoot'
  )

  const guiCloth = gui.addFolder('Cloth')
  guiCloth.add(app.clothMaterial, 'wireframe')
  guiCloth.add(app.clothMaterial, 'depthTest')
  guiCloth.add(app.clothMesh, 'renderOrder')

  gui.add(
    {
      reset() {
        destroyApp()
        createApp()
      },
    },
    'reset'
  )

  onWindowSizeUpdate()
}

function destroyApp() {
  app = null
  gui?.destroy()
}

/**
 * Update renderer size to fit with window size
 */
function onWindowSizeUpdate() {
  const { innerWidth: w, innerHeight: h } = window
  renderer.setSize(w, h)
  app?.setAspectRatio(w / h)
}
window.addEventListener('resize', onWindowSizeUpdate)

/**
 * Render
 */
function renderTick() {
  requestAnimationFrame(renderTick)

  stats.begin()
  app?.tick(Date.now())
  app?.renderTo(renderer)
  stats.end()
}
