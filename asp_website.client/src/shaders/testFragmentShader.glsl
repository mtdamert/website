varying vec2 vUv;
varying float vZ;

uniform float u_time;
uniform bool u_hover;
vec3 colorA = vec3(0.912,0.191,0.652);
vec3 colorB = vec3(1.000,0.777,0.052);

void main() {
  float editedTime = u_hover ? 0.0 : u_time;

  colorA.x = editedTime * vZ * 0.2 + 2.0;
  vec3 color = mix(colorA, colorB, vZ * 2.0 + 0.5);

  gl_FragColor = vec4(color,1.0);
}
