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
