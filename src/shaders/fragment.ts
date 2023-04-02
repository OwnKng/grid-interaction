export const fragment = /*glsl*/ `
    varying float vOffset; 
    varying vec2 vUv; 
    varying float isVisible; 

    void main() {
        // colors
        vec3 color = vec3(0.0/255.0, 211.0/255.0, 255.0/255.0); 

        // alpha
        float alpha = vOffset * 0.1;  

        //border
        float border = step(0.49, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
        border *= 1.0 - step(0.5, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
        border *= 0.1; 
        
        alpha += border * isVisible; 
        
        gl_FragColor = vec4(color, alpha); 
    }
`
