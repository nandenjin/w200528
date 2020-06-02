import { WebGLRenderer } from 'three'
import dat from 'dat.gui'
import Stats from 'stats.js'
import { App } from './App'

import './style/index.scss'

// Renderer
const renderer = new WebGLRenderer({ antialias: true })

// Parameters GUI
const gui = new dat.GUI()

// Render stats
const stats = new Stats()

// App
const app = new App()

gui.add(app, 'cameraSpeed', 0, 3)
gui.add(app.gravity, 'y').name('gravity')
gui.add(app.forces[0], 'y').name('force0').step(0.01)
gui.add(app.forces[1], 'y').name('force1').step(0.01)
gui.add(app.forces[2], 'y').name('force2').step(0.01)
gui.add(app.forces[3], 'y').name('force3').step(0.01)

const guiClothMaterial = gui.addFolder('ClothMaterial')
guiClothMaterial.add(app.clothMaterial, 'wireframe')

function init() {
  // Add renderer to DOM tree
  renderer.domElement.classList.add('renderer')
  document.body.appendChild(renderer.domElement)
  updateRendererSize()

  // Add render stats monitor to DOM tree
  document.body.appendChild(stats.dom)

  // Add GUI to DOM tree
  gui.domElement.classList.add('gui')
  document.body.appendChild(gui.domElement)

  // Start render
  requestAnimationFrame(renderTick)
}
window.addEventListener('DOMContentLoaded', init)

/**
 * Update renderer size to fit with window size
 */
function updateRendererSize() {
  const { innerWidth: w, innerHeight: h } = window
  renderer.setSize(w, h)
  app.setAspectRatio(w / h)
}
window.addEventListener('resize', updateRendererSize)

/**
 * Render
 */
function renderTick() {
  requestAnimationFrame(renderTick)

  stats.begin()
  app.tick(Date.now())
  app.renderTo(renderer)
  stats.end()
}
