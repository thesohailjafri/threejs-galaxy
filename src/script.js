import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import dat from 'dat.gui'
/*
GUI */

const gui = new dat.GUI()

/* 
Canvas */

const canvas = document.querySelector('.webgl')

/* 
Scene */

const scene = new THREE.Scene()

/* 
Sizes */

const sizes = { width: window.innerWidth, height: window.innerHeight }

/* 
Camera */

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.set(-4, 6, 4)
scene.add(camera)

/* 
Shapes */

//Galaxy

const parameters = {
    size: 0.01,
    stars: 50000,
    radius: 5,
    branches: 3,
    spin: 0.66,
    randomness: 0.35,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
}

let galaxyGeometry = null
let galaxyMaterial = null
let galaxy = null

// generateGalaxy start
const generateGalaxy = () => {

    //reduce earlier galaxies
    if (galaxy !== null) {
        galaxyGeometry.dispose()
        galaxyMaterial.dispose()
        scene.remove(galaxy)
    }

    //generate new galaxy
    galaxyGeometry = new THREE.BufferGeometry()
    galaxyMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })


    const positions = new Float32Array(parameters.stars * 3)
    const colors = new Float32Array(parameters.stars * 3)


    for (let i = 0; i < parameters.stars; i++) {

        //Variables
        const radius = Math.random() * parameters.radius
        const pointAngle = ((i % parameters.branches) / parameters.branches) * (2 * Math.PI)
        const spinAngle = (parameters.spin * Math.PI * radius)
        const colorInside = new THREE.Color(parameters.insideColor)
        const colorOutside = new THREE.Color(parameters.outsideColor)

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius

        //Position
        let i3 = i * 3
        positions[i3] = (radius * Math.sin(pointAngle + spinAngle)) + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = (radius * Math.cos(pointAngle + spinAngle)) + randomZ

        // Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }

    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))


    galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial)
    scene.add(galaxy)

}
// generateGalaxy end

const galaxyControls = gui.addFolder('Galaxy Controls')
// galaxyControls.open()
gui.width = 400

galaxyControls.add(parameters, 'size', 0, 0.03, 0.0001).onFinishChange(generateGalaxy)
galaxyControls.add(parameters, 'stars', 1, 100000, 1).onFinishChange(generateGalaxy)
galaxyControls.add(parameters, 'radius', 1, 10, 1).onFinishChange(generateGalaxy)
galaxyControls.add(parameters, 'branches', 2, 8, 1).onFinishChange(generateGalaxy)
galaxyControls.add(parameters, 'spin', 0, Math.PI, 0.1).onFinishChange(generateGalaxy)
galaxyControls.add(parameters, 'randomness', 0, 0.5, 0.01).onFinishChange(generateGalaxy)
galaxyControls.add(parameters, 'randomnessPower', 1, 10, 0.001).onFinishChange(generateGalaxy)
galaxyControls.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
galaxyControls.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)


generateGalaxy()







/* 
Controls */

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/* 
Shapes */

/* 
Renderer */

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera)

/*
Animation */

const clock = new THREE.Clock()
const loop = () => {
    const elapsedTime = clock.getElapsedTime()

    //rotatng galaxy
    galaxy.rotation.y = -elapsedTime * 0.15

    //update controls
    controls.update()

    //update renderer
    renderer.render(scene, camera)

    //request frame
    window.requestAnimationFrame(loop)
}
loop()

/* 
Resize */

window.addEventListener('resize', () => {

    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    //update camera ratio
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    //update renderer ratio

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

})


