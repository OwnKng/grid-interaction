import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import Sketch from "./Sketch"

function App() {
  return (
    <div className='App'>
      <div className='title'>
        <h1>the grid</h1>
      </div>
      <Canvas>
        <Sketch />
      </Canvas>
    </div>
  )
}

export default App
