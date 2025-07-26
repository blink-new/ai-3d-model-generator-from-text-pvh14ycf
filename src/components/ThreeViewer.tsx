import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

interface ThreeViewerProps {
  model: THREE.Object3D | null
  className?: string
}

export const ThreeViewer: React.FC<ThreeViewerProps> = ({ model, className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const frameRef = useRef<number>()

  useEffect(() => {
    const currentMount = mountRef.current
    if (!currentMount) return

    // Создаем сцену
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f0f23)
    sceneRef.current = scene

    // Создаем камеру
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 5)
    cameraRef.current = camera

    // Создаем рендерер
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    currentMount.appendChild(renderer.domElement)

    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x6366f1, 0.5, 100)
    pointLight.position.set(-10, -10, -10)
    scene.add(pointLight)

    // Анимация
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      
      // Вращаем модель если она есть
      if (sceneRef.current) {
        const modelObject = sceneRef.current.getObjectByName('generatedModel')
        if (modelObject) {
          modelObject.rotation.y += 0.01
        }
      }
      
      renderer.render(scene, camera)
    }
    animate()

    // Обработка изменения размера
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // Обновляем модель в сцене
  useEffect(() => {
    if (!sceneRef.current) return

    // Удаляем предыдущую модель
    const existingModel = sceneRef.current.getObjectByName('generatedModel')
    if (existingModel) {
      sceneRef.current.remove(existingModel)
    }

    // Добавляем новую модель
    if (model) {
      model.name = 'generatedModel'
      model.position.set(0, 0, 0)
      sceneRef.current.add(model)
    }
  }, [model])

  return (
    <div 
      ref={mountRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  )
}