import * as THREE from 'three'

export interface ModelGenerationOptions {
  complexity: 'low' | 'medium' | 'high'
  size: number
  color: string
}

export class ModelGenerator {
  private static parsePrompt(prompt: string): {
    shape: string
    modifiers: string[]
    color: string
  } {
    const lowerPrompt = prompt.toLowerCase()
    
    // Определяем основную форму
    let shape = 'cube'
    if (lowerPrompt.includes('sphere') || lowerPrompt.includes('ball') || lowerPrompt.includes('шар')) {
      shape = 'sphere'
    } else if (lowerPrompt.includes('cylinder') || lowerPrompt.includes('цилиндр')) {
      shape = 'cylinder'
    } else if (lowerPrompt.includes('cone') || lowerPrompt.includes('конус')) {
      shape = 'cone'
    } else if (lowerPrompt.includes('torus') || lowerPrompt.includes('тор') || lowerPrompt.includes('donut')) {
      shape = 'torus'
    } else if (lowerPrompt.includes('plane') || lowerPrompt.includes('плоскость')) {
      shape = 'plane'
    } else if (lowerPrompt.includes('octahedron') || lowerPrompt.includes('октаэдр')) {
      shape = 'octahedron'
    } else if (lowerPrompt.includes('dodecahedron') || lowerPrompt.includes('додекаэдр')) {
      shape = 'dodecahedron'
    } else if (lowerPrompt.includes('icosahedron') || lowerPrompt.includes('икосаэдр')) {
      shape = 'icosahedron'
    } else if (lowerPrompt.includes('tetrahedron') || lowerPrompt.includes('тетраэдр')) {
      shape = 'tetrahedron'
    }

    // Определяем модификаторы
    const modifiers: string[] = []
    if (lowerPrompt.includes('wireframe') || lowerPrompt.includes('каркас')) {
      modifiers.push('wireframe')
    }
    if (lowerPrompt.includes('smooth') || lowerPrompt.includes('гладкий')) {
      modifiers.push('smooth')
    }
    if (lowerPrompt.includes('metallic') || lowerPrompt.includes('металлический')) {
      modifiers.push('metallic')
    }
    if (lowerPrompt.includes('glass') || lowerPrompt.includes('стекло')) {
      modifiers.push('glass')
    }

    // Определяем цвет
    let color = '#6366f1'
    if (lowerPrompt.includes('red') || lowerPrompt.includes('красный')) {
      color = '#ef4444'
    } else if (lowerPrompt.includes('blue') || lowerPrompt.includes('синий')) {
      color = '#3b82f6'
    } else if (lowerPrompt.includes('green') || lowerPrompt.includes('зеленый')) {
      color = '#22c55e'
    } else if (lowerPrompt.includes('yellow') || lowerPrompt.includes('желтый')) {
      color = '#eab308'
    } else if (lowerPrompt.includes('purple') || lowerPrompt.includes('фиолетовый')) {
      color = '#8b5cf6'
    } else if (lowerPrompt.includes('orange') || lowerPrompt.includes('оранжевый')) {
      color = '#f97316'
    } else if (lowerPrompt.includes('pink') || lowerPrompt.includes('розовый')) {
      color = '#ec4899'
    } else if (lowerPrompt.includes('white') || lowerPrompt.includes('белый')) {
      color = '#ffffff'
    } else if (lowerPrompt.includes('black') || lowerPrompt.includes('черный')) {
      color = '#000000'
    }

    return { shape, modifiers, color }
  }

  private static createGeometry(shape: string, complexity: string): THREE.BufferGeometry {
    const segments = complexity === 'low' ? 8 : complexity === 'medium' ? 16 : 32

    switch (shape) {
      case 'sphere':
        return new THREE.SphereGeometry(1, segments, segments)
      case 'cylinder':
        return new THREE.CylinderGeometry(1, 1, 2, segments)
      case 'cone':
        return new THREE.ConeGeometry(1, 2, segments)
      case 'torus':
        return new THREE.TorusGeometry(1, 0.4, segments / 2, segments)
      case 'plane':
        return new THREE.PlaneGeometry(2, 2, segments, segments)
      case 'octahedron':
        return new THREE.OctahedronGeometry(1, 0)
      case 'dodecahedron':
        return new THREE.DodecahedronGeometry(1, 0)
      case 'icosahedron':
        return new THREE.IcosahedronGeometry(1, 0)
      case 'tetrahedron':
        return new THREE.TetrahedronGeometry(1, 0)
      default:
        return new THREE.BoxGeometry(1, 1, 1, segments, segments, segments)
    }
  }

  private static createMaterial(color: string, modifiers: string[]): THREE.Material {
    const materialOptions: any = {
      color: new THREE.Color(color),
    }

    if (modifiers.includes('wireframe')) {
      materialOptions.wireframe = true
    }

    if (modifiers.includes('metallic')) {
      return new THREE.MeshStandardMaterial({
        ...materialOptions,
        metalness: 0.8,
        roughness: 0.2,
      })
    }

    if (modifiers.includes('glass')) {
      return new THREE.MeshPhysicalMaterial({
        ...materialOptions,
        transparent: true,
        opacity: 0.6,
        transmission: 0.9,
        thickness: 0.5,
      })
    }

    return new THREE.MeshStandardMaterial(materialOptions)
  }

  static async generateModel(
    prompt: string, 
    options: ModelGenerationOptions = {
      complexity: 'medium',
      size: 1,
      color: '#6366f1'
    }
  ): Promise<THREE.Object3D> {
    // Имитируем задержку генерации
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const parsed = this.parsePrompt(prompt)
    
    // Создаем геометрию
    const geometry = this.createGeometry(parsed.shape, options.complexity)
    
    // Создаем материал
    const material = this.createMaterial(parsed.color, parsed.modifiers)
    
    // Создаем меш
    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.setScalar(options.size)
    
    // Добавляем тени
    mesh.castShadow = true
    mesh.receiveShadow = true

    // Создаем группу для возможных дополнительных объектов
    const group = new THREE.Group()
    group.add(mesh)

    // Добавляем дополнительные элементы для сложных промптов
    if (prompt.toLowerCase().includes('complex') || prompt.toLowerCase().includes('сложный')) {
      const smallSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x8b5cf6 })
      )
      smallSphere.position.set(1.5, 0, 0)
      smallSphere.castShadow = true
      group.add(smallSphere)

      const smallCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xf97316 })
      )
      smallCube.position.set(-1.5, 0, 0)
      smallCube.castShadow = true
      group.add(smallCube)
    }

    return group
  }

  static getExamplePrompts(): string[] {
    return [
      'красный шар',
      'синий куб с металлическим покрытием',
      'зеленый цилиндр',
      'желтый конус',
      'фиолетовый тор',
      'стеклянная сфера',
      'каркасный октаэдр',
      'сложная композиция из геометрических фигур',
      'белый додекаэдр',
      'черный икосаэдр'
    ]
  }
}