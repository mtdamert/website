
// code from tutorial:
// https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/

uniform float u_time;
uniform bool u_hover;

varying vec2 vUv;
varying float vZ;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.y += sin(modelPosition.x * 5.0 + u_time * 3.0) * (u_hover ? 0.05 : 0.1);
  modelPosition.y += sin(modelPosition.z * 6.0 + u_time * 2.0) * (u_hover ? 0.05 : 0.1);

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  vUv = uv;
  vZ = modelPosition.y;

  gl_Position = projectedPosition;
}
