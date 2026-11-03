import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

export interface CoffeeState {
  x: number
  y: number
  z: number
  scale: number
  rx: number
  ry: number
  rz: number
  cameraY: number
  cameraZ: number
  spread: number
  orbit: number
  beans: number
  steam: number
  saucerGap: number
}
export interface CoffeeScene {
  state: CoffeeState
  setProgress: (progress: number) => void
  setVisible: (visible: boolean) => void
  resize: () => void
  start: () => void
  stop: () => void
  destroy: () => void
}
interface SceneOptions {
  root: HTMLElement
  canvas: HTMLCanvasElement
  stage: HTMLElement
  brandName: string
  tagline: string
  signal: AbortSignal
}

/** Owns all GPU resources. The returned controller is safe to destroy during async startup. */
export function createCoffeeScene(options: SceneOptions): CoffeeScene {
  const { root, canvas, stage, signal } = options
  const mobileQuery = window.matchMedia('(max-width: 700px)')
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const state: CoffeeState = {
    x: 0.8,
    y: -0.1,
    z: 0,
    scale: 1.2,
    rx: 0.1,
    ry: -0.45,
    rz: -0.2,
    cameraY: 3.8,
    cameraZ: 8.5,
    spread: 0.85,
    orbit: 0,
    beans: 0.8,
    steam: 0.7,
    saucerGap: 0,
  }
  const pointer = new THREE.Vector2()
  const smoothPointer = new THREE.Vector2()
  const transform = new THREE.Object3D()
  let renderer: THREE.WebGLRenderer | null = null
  let scene3D: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let cup: THREE.Group | null = null
  let saucer: THREE.Group | null = null
  let beans: THREE.InstancedMesh | null = null
  let coffeeMap: THREE.CanvasTexture | null = null
  let steam: THREE.Sprite[] = []
  let sceneProgress = 0
  let cupIsVisible = true
  let disposed = false
  let wantsAnimation = !motionQuery.matches
  const resources: { dispose(): void }[] = []
  const materials: THREE.Material[] = []
  const geometry = <T extends THREE.BufferGeometry>(item: T): T => {
    resources.push(item)
    return item
  }
  const material = <T extends THREE.Material>(item: T): T => {
    materials.push(item)
    return item
  }
  function drawTexture(
    width: number,
    height: number,
    draw: (ctx: CanvasRenderingContext2D) => void,
  ): THREE.CanvasTexture {
    const surface = document.createElement('canvas')
    surface.width = width
    surface.height = height
    const context = surface.getContext('2d')
    if (!context) throw new Error('Canvas 2D is unavailable')
    draw(context)
    const texture = new THREE.CanvasTexture(surface)
    texture.colorSpace = THREE.SRGBColorSpace
    resources.push(texture)
    return texture
  }

  function createCoffeeTexture(): THREE.CanvasTexture {
    return drawTexture(1024, 1024, (ctx) => {
      const base = ctx.createRadialGradient(490, 470, 20, 512, 512, 520)
      base.addColorStop(0, '#8a4925')
      base.addColorStop(0.68, '#a65e30')
      base.addColorStop(0.9, '#c48147')
      base.addColorStop(1, '#713b20')
      ctx.fillStyle = base
      ctx.fillRect(0, 0, 1024, 1024)
      // Deterministic crema speckles make the close-up feel like a real surface.
      let seed = 8221
      const random = (): number => {
        seed = (seed * 16807) % 2147483647
        return (seed - 1) / 2147483646
      }
      for (let i = 0; i < 7500; i++) {
        const x = random() * 1024,
          y = random() * 1024
        const distance = Math.hypot(x - 512, y - 512) / 512
        ctx.fillStyle = `rgba(${random() > 0.5 ? '252,216,155' : '74,32,14'},${0.03 + distance * 0.13})`
        ctx.beginPath()
        ctx.arc(x, y, 0.4 + random() * (distance > 0.85 ? 3 : 1.4), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.strokeStyle = '#e7ba7e'
      ctx.lineWidth = 6
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.arc(512, 512, 477, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
      // A hand-drawn rosetta is a texture on the liquid, rather than a flat image of a cup.
      for (let i = 0; i < 12; i++) {
        const y = 665 - i * 29
        const width = 175 * Math.sin(((i + 2) / 15) * Math.PI)
        ctx.fillStyle = i % 2 === 0 ? '#f5e7c9' : '#f0dcba'
        for (const sign of [-1, 1]) {
          ctx.beginPath()
          ctx.moveTo(512, y + 14)
          ctx.bezierCurveTo(
            512 + sign * width * 1.1,
            y + 27,
            512 + sign * width * 1.4,
            y - 42,
            512 + sign * 12,
            y - 11,
          )
          ctx.bezierCurveTo(512 + sign * 4, y - 3, 512, y + 8, 512, y + 14)
          ctx.fill()
        }
      }
      ctx.fillStyle = '#f5e8cc'
      ctx.beginPath()
      ctx.moveTo(512, 738)
      ctx.bezierCurveTo(506, 650, 503, 450, 512, 291)
      ctx.bezierCurveTo(522, 450, 520, 650, 515, 738)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(512, 337)
      ctx.bezierCurveTo(443, 302, 470, 256, 512, 286)
      ctx.bezierCurveTo(553, 256, 581, 302, 512, 337)
      ctx.fill()
    })
  }

  function buildCup(): THREE.Group {
    const group = new THREE.Group()
    const glaze = material(
      new THREE.MeshPhysicalMaterial({
        color: '#e9dcc1',
        roughness: 0.28,
        metalness: 0,
        clearcoat: 0.55,
        clearcoatRoughness: 0.23,
      }),
    )
    const innerGlaze = material(
      new THREE.MeshPhysicalMaterial({ color: '#f8efda', roughness: 0.21, clearcoat: 0.7 }),
    )
    const profile = [
      [0, -0.8],
      [0.5, -0.8],
      [0.59, -0.78],
      [0.66, -0.7],
      [0.72, -0.43],
      [0.79, -0.08],
      [0.88, 0.32],
      [0.94, 0.58],
      [0.95, 0.64],
      [0.93, 0.68],
      [0.89, 0.68],
      [0.87, 0.63],
      [0.82, 0.34],
      [0.74, -0.02],
      [0.64, -0.42],
      [0.57, -0.61],
      [0.48, -0.65],
      [0, -0.65],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    const body = new THREE.Mesh(geometry(new THREE.LatheGeometry(profile, 112)), glaze)
    group.add(body)
    const rim = new THREE.Mesh(geometry(new THREE.TorusGeometry(0.911, 0.023, 14, 112)), innerGlaze)
    rim.rotation.x = Math.PI / 2
    rim.position.y = 0.66
    group.add(rim)
    const handle = new THREE.Mesh(geometry(new THREE.TorusGeometry(0.4, 0.098, 18, 64)), glaze)
    handle.position.set(1.06, -0.025, 0)
    handle.scale.set(0.87, 1.23, 1)
    group.add(handle)
    const foot = new THREE.Mesh(geometry(new THREE.TorusGeometry(0.54, 0.027, 12, 80)), glaze)
    foot.rotation.x = Math.PI / 2
    foot.position.y = -0.79
    group.add(foot)
    coffeeMap = createCoffeeTexture()
    const liquid = new THREE.Mesh(
      geometry(new THREE.CircleGeometry(0.875, 112)),
      material(
        new THREE.MeshPhysicalMaterial({
          map: coffeeMap,
          roughness: 0.22,
          clearcoat: 0.8,
          clearcoatRoughness: 0.15,
          metalness: 0,
        }),
      ),
    )
    liquid.rotation.x = -Math.PI / 2
    liquid.position.y = 0.595
    group.add(liquid)
    const logo = drawTexture(1024, 512, (ctx) => {
      ctx.clearRect(0, 0, 1024, 512)
      ctx.fillStyle = '#a14630'
      ctx.textAlign = 'center'
      ctx.font = `700 ${Math.min(195, 1100 / Math.max(1, options.brandName.length))}px "DM Sans", sans-serif`
      ctx.fillText(options.brandName, 512, 290)
      ctx.font = '500 27px "DM Sans", sans-serif'
      ctx.fillText(options.tagline, 512, 355, 920)
    })
    const label = new THREE.Mesh(
      geometry(new THREE.CylinderGeometry(0.882, 0.744, 0.64, 64, 1, true, -0.65, 1.3)),
      material(
        new THREE.MeshBasicMaterial({
          map: logo,
          transparent: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -2,
        }),
      ),
    )
    label.position.y = -0.015
    group.add(label)
    saucer = new THREE.Group()
    const saucerProfile = [
      [0, -1.01],
      [0.65, -1.01],
      [0.83, -0.96],
      [1.05, -0.94],
      [1.44, -0.81],
      [1.61, -0.76],
      [1.65, -0.78],
      [1.63, -0.84],
      [1.4, -0.91],
      [1.02, -1.06],
      [0.7, -1.09],
      [0, -1.09],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    saucer.add(new THREE.Mesh(geometry(new THREE.LatheGeometry(saucerProfile, 112)), glaze))
    group.add(saucer)
    const steamMap = drawTexture(128, 512, (ctx) => {
      ctx.clearRect(0, 0, 128, 512)
      ctx.strokeStyle = '#f5ead5'
      ctx.lineWidth = 10
      ctx.filter = 'blur(12px)'
      ctx.beginPath()
      ctx.moveTo(60, 510)
      ctx.bezierCurveTo(5, 380, 125, 350, 68, 230)
      ctx.bezierCurveTo(15, 120, 100, 80, 73, 0)
      ctx.stroke()
    })
    steam = Array.from({ length: 3 }, (_, index) => {
      const sprite = new THREE.Sprite(
        material(
          new THREE.SpriteMaterial({
            map: steamMap,
            transparent: true,
            opacity: 0.12,
            depthWrite: false,
            blending: THREE.NormalBlending,
          }),
        ),
      )
      sprite.scale.set(0.48, 1.8 + index * 0.22, 1)
      sprite.position.set((index - 1) * 0.2, 1.5 + index * 0.08, 0)
      group.add(sprite)
      return sprite
    })
    return group
  }

  function createBeans(): THREE.InstancedMesh {
    const beanMaterial = material(
      new THREE.MeshStandardMaterial({ color: '#542c1c', roughness: 0.48, metalness: 0.02 }),
    )
    beanMaterial.onBeforeCompile = (shader) => {
      shader.vertexShader = 'varying vec3 vBeanPosition;\n' + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvBeanPosition = position;',
      )
      shader.fragmentShader = 'varying vec3 vBeanPosition;\n' + shader.fragmentShader
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        '#include <color_fragment>\nfloat seam = (1.0 - smoothstep(0.025, 0.15, abs(vBeanPosition.x + sin(vBeanPosition.y * 3.0) * 0.12))) * smoothstep(0.1, 0.45, vBeanPosition.z);\ndiffuseColor.rgb *= 1.0 - seam * 0.72;',
      )
    }
    const instances = new THREE.InstancedMesh(
      geometry(new THREE.SphereGeometry(1, 22, 14)),
      beanMaterial,
      30,
    )
    instances.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    instances.frustumCulled = false
    return instances
  }

  function renderFrame(): void {
    if (
      disposed ||
      !renderer ||
      !scene3D ||
      !camera ||
      !cup ||
      !beans ||
      !saucer ||
      document.hidden
    )
      return
    if (!cupIsVisible && !motionQuery.matches) return
    const time = motionQuery.matches ? 0 : performance.now() / 1000
    smoothPointer.lerp(pointer, 0.035)
    cup.position.set(state.x, state.y + Math.sin(time * 0.72) * 0.035, state.z)
    cup.scale.setScalar(state.scale)
    cup.rotation.set(
      state.rx + smoothPointer.y * 0.025,
      state.ry + smoothPointer.x * 0.06,
      state.rz,
    )
    saucer.position.y = state.saucerGap
    camera.position.set(0, state.cameraY, state.cameraZ)
    camera.lookAt(0, 0.1, 0)
    for (let i = 0; i < beans.count; i++) {
      const angle = i * 2.39996 + state.orbit + time * 0.045
      const radius = (1.75 + (i % 5) * 0.29) * state.spread
      const mobile = mobileQuery.matches
      transform.position.set(
        Math.cos(angle) * radius * (mobile ? 0.72 : 1.15) + state.x * 0.3,
        Math.sin(angle) * radius * 0.66 +
          (mobile && sceneProgress > 0.16 && sceneProgress < 0.35 ? 0.9 : 0.2),
        Math.sin(i * 7.1 + state.orbit) * 1.1 - 0.3,
      )
      transform.rotation.set(angle * 0.4 + time * 0.06, i * 2.3 + state.orbit, angle * 0.8)
      const size = (0.75 + (i % 4) * 0.16) * state.beans
      transform.scale.set(0.105 * size, 0.165 * size, 0.085 * size)
      transform.updateMatrix()
      beans.setMatrixAt(i, transform.matrix)
    }
    beans.instanceMatrix.needsUpdate = true
    steam.forEach((sprite, index) => {
      sprite.position.x = (index - 1) * 0.21 + Math.sin(time * 0.5 + index * 2) * 0.1
      sprite.material.opacity = state.steam * (0.08 + Math.sin(time * 0.4 + index) * 0.025)
    })
    renderer.render(scene3D, camera)
  }

  function resizeRenderer(): void {
    if (disposed || !renderer || !camera) return
    renderer.setSize(stage.clientWidth, window.innerHeight, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobileQuery.matches ? 1.5 : 1.75))
    camera.aspect = stage.clientWidth / window.innerHeight
    camera.fov = mobileQuery.matches ? 39 : 34
    camera.updateProjectionMatrix()
    renderFrame()
  }

  async function init3D(): Promise<void> {
    try {
      await document.fonts.ready
      if (disposed || signal.aborted) return
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 0.95
      renderer.setClearColor(0, 0)
      scene3D = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
      const environment = new RoomEnvironment()
      const pmrem = new THREE.PMREMGenerator(renderer)
      const environmentTarget = pmrem.fromScene(environment, 0.04)
      scene3D.environment = environmentTarget.texture
      scene3D.environmentIntensity = 0.55
      resources.push(environmentTarget)
      environment.dispose()
      pmrem.dispose()
      scene3D.add(new THREE.HemisphereLight('#fff6e5', '#80553c', 1.2))
      const key = new THREE.DirectionalLight('#fff4df', 2.2)
      key.position.set(-3, 6, 5)
      scene3D.add(key)
      const rim = new THREE.DirectionalLight('#f5c9a1', 1.8)
      rim.position.set(4, 3, -3)
      scene3D.add(rim)
      const fill = new THREE.DirectionalLight('#ffffff', 0.8)
      fill.position.set(-4, 0, 3)
      scene3D.add(fill)
      cup = buildCup()
      beans = createBeans()
      scene3D.add(cup, beans)
      resizeRenderer()
      root.classList.add('webgl-ready')
      canvas.dataset.renderer = 'webgl'
      if (wantsAnimation && !motionQuery.matches) renderer.setAnimationLoop(renderFrame)
      else renderFrame()
      canvas.addEventListener(
        'webglcontextlost',
        (event) => {
          event.preventDefault()
          root.classList.remove('webgl-ready')
          canvas.dataset.renderer = 'fallback'
          renderer?.setAnimationLoop(null)
        },
        { signal },
      )
    } catch (error) {
      canvas.dataset.renderer = 'fallback'
      root.classList.remove('webgl-ready')
      if (!disposed)
        console.warn('The 3D scene is unavailable; showing the photographic fallback.', error)
    }
  }

  function start(): void {
    wantsAnimation = true
    if (!disposed && !motionQuery.matches && !document.hidden)
      renderer?.setAnimationLoop(renderFrame)
    else renderFrame()
  }
  function stop(): void {
    wantsAnimation = false
    renderer?.setAnimationLoop(null)
  }
  function destroy(): void {
    if (disposed) return
    disposed = true
    renderer?.setAnimationLoop(null)
    beans?.dispose()
    resources.forEach((resource) => resource.dispose())
    materials.forEach((item) => item.dispose())
    scene3D?.clear()
    renderer?.dispose()
    renderer = null
    scene3D = null
    camera = null
    cup = null
    beans = null
    saucer = null
    root.classList.remove('webgl-ready')
    delete canvas.dataset.renderer
  }
  root.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse' || motionQuery.matches) return
      pointer.set((event.clientX / innerWidth - 0.5) * 2, (event.clientY / innerHeight - 0.5) * 2)
    },
    { passive: true, signal },
  )
  window.addEventListener('resize', resizeRenderer, { passive: true, signal })
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) renderer?.setAnimationLoop(null)
      else if (wantsAnimation) start()
    },
    { signal },
  )
  window.addEventListener('pagehide', () => renderer?.setAnimationLoop(null), { signal })
  window.addEventListener(
    'pageshow',
    () => {
      if (wantsAnimation) start()
    },
    { signal },
  )
  signal.addEventListener('abort', destroy, { once: true })
  void init3D()
  return {
    state,
    setProgress: (value) => {
      sceneProgress = value
    },
    setVisible: (value) => {
      cupIsVisible = value
    },
    resize: resizeRenderer,
    start,
    stop,
    destroy,
  }
}
