export var fragment = `

uniform float time;
uniform float progress;
uniform vec3 color;
uniform float offset;
uniform sampler2D texture1;
uniform vec4 resolution;

varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;

float qinticOut(float t) {
  return 1.0 - (pow(t - 1.0, 5.0));
}
void main(){



  float localProgress = mod(mod(time*2. ,1.) + offset*1.,1.);

  localProgress = qinticOut(localProgress/2.) * 2.;

  if (vUv.x > localProgress || vUv.x + 0.8 < localProgress) discard;
  gl_FragColor = vec4(color,1.);
  

}
`;
