uniform vec3 u_sandColor;

uniform float u_ambientLightIntensity;
uniform float u_pointLightIntensity;
uniform vec3 u_lightColor;


void main() {
  //vec3 fragmentColor = vec3(0.93, 0.79, 0.69); // test with sand color
  vec3 fragmentColor = u_sandColor * u_lightColor;

  gl_FragColor = vec4(fragmentColor, 1.0);
}
