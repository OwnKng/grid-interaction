import { useFrame, useThree } from "@react-three/fiber"
import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { vertex } from "./shaders/vertex"
import { fragment } from "./shaders/fragment"

const gridSize = 15

const tempStart = new THREE.Vector3(0, 0, 0)
const tempEnd = new THREE.Vector3(0, 0, 0)

const uniforms = {
  uMouse: { value: new THREE.Vector3(0, 0, 0) },
  uTime: { value: 0 },
}

export default function Sketch() {
  const { viewport } = useThree()
  const ref = useRef<THREE.ShaderMaterial>(null!)
  const points = useRef<THREE.Points>(null!)

  const [
    numSquares,
    cellSize,
    offsets,
    verticalLines,
    horizontalLines,
    pointPositions,
  ] = useMemo(() => {
    // Set dimensions and square size
    const dim = Math.max(viewport.width, viewport.height)
    const cellSize = dim / gridSize
    const columns = Math.ceil(viewport.width / cellSize)
    const rows = Math.ceil(viewport.height / cellSize)
    const numSquares = rows * columns

    const verticalLines = new Array(columns).fill(0).map((_, i) => {
      let x = (i % columns) * cellSize + cellSize * 0.5

      x -= viewport.width * 0.5

      const start = tempStart.clone().set(x, -viewport.height * 0.5, 0.05)
      const end = tempEnd.clone().set(x, viewport.height * 0.5, 0.05)

      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([start, end]),
        new THREE.LineBasicMaterial({
          color: "#00d4ff",
          transparent: true,
          opacity: 0.15,
        })
      )
    })

    const horizontalLines = new Array(rows).fill(0).map((_, i) => {
      let y = (i % rows) * cellSize + cellSize * 0.5
      y -= viewport.height * 0.5

      const start = tempStart.clone().set(-viewport.width * 0.5, y, 0.05)
      const end = tempEnd.clone().set(viewport.width * 0.5, y, 0.05)

      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([start, end]),
        new THREE.LineBasicMaterial({
          color: "#00d4ff",
          transparent: true,
          opacity: 0.15,
        })
      )
    })

    const pointPositions = Float32Array.from(
      new Array(numSquares + 2).fill(0).flatMap((_, i) => {
        let x = (i % columns) * cellSize + cellSize * 0.5
        let y = Math.floor(i / columns) * cellSize + cellSize * 0.5

        // offset the positions using the viewport width and height
        x += -viewport.width * 0.5
        y += -viewport.height * 0.5

        return [x, y, 0.05]
      })
    )

    return [
      numSquares,
      cellSize,
      // create a grid
      Float32Array.from(
        new Array(numSquares).fill(0).flatMap((_, i) => {
          let x = (i % columns) * cellSize
          let y = Math.floor(i / columns) * cellSize

          x += -viewport.width * 0.5 + cellSize
          y += -viewport.height * 0.5 + cellSize

          return [x, y, 0]
        })
      ),
      verticalLines,
      horizontalLines,
      pointPositions,
    ]
  }, [viewport])

  useLayoutEffect(() => {
    points.current.geometry.attributes.position.needsUpdate = true
  }, [viewport])

  useFrame(({ clock }) => {
    ref.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <>
      <instancedMesh args={[undefined, undefined, numSquares]}>
        <planeGeometry args={[cellSize, cellSize]}>
          <instancedBufferAttribute
            attach={"attributes-offset"}
            array={offsets}
            itemSize={3}
          />
        </planeGeometry>
        <shaderMaterial
          ref={ref}
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={uniforms}
          transparent
        />
      </instancedMesh>
      {verticalLines.map((line, i) => (
        <primitive key={`v-line-${i}`} object={line} />
      ))}
      {horizontalLines.map((line, i) => (
        <primitive key={`h-line-${i}`} object={line} />
      ))}
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute
            attach='attributes-position'
            count={numSquares}
            itemSize={3}
            array={pointPositions}
          />
        </bufferGeometry>
        <pointsMaterial size={0.025} color='#00d4ff' />
      </points>
      <mesh
        position={[0, 0, 0.01]}
        onPointerMove={(e) => (ref.current.uniforms.uMouse.value = e.point)}
      >
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  )
}
