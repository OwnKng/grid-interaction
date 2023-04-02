import { noise } from "./noise"

export const vertex = /*glsl*/ `
    attribute vec3 offset; 
    uniform vec3 uMouse; 
    uniform float uTime; 
    varying float vOffset; 
    varying vec2 vUv; 
    varying float isVisible;

    ${noise}

    void main() {
        vec3 transformedPosition = position; 
        transformedPosition += offset; 

        float distanceToMouse = length(offset - uMouse); 

        float inRange = step(distanceToMouse, 1.5); 
        float zOffset = 0.5; 

        // noise
        vec3 noiseCoords = vec3(offset.x, offset.y, uTime); 
        float noise = snoise(noiseCoords) * 0.5 + 0.5;
        noise *= 0.2; 

        zOffset = (zOffset + noise) * inRange; 
        transformedPosition.z += zOffset; 

        vOffset = zOffset; 
        vUv = uv; 
        isVisible = inRange; 

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0); 
    }
`
