
// code from tutorial:
// https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/

uniform float u_time;

varying vec2 vUv;
varying float vZ;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.y += sin(modelPosition.x * 4.0 + u_time * 2.0) * 0.2;
  
  // Uncomment the code and hit the refresh button below for a more complex effect
   modelPosition.y += sin(modelPosition.z * 6.0 + u_time * 2.0) * 0.1;

   vZ = modelPosition.y;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

   vUv = uv;

  gl_Position = projectedPosition;
}
