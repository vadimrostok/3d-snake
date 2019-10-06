import { PointLight, AmbientLight } from 'three';

export const staticLights = [];
staticLights[0] = new PointLight( 0xffffff, 100 );
staticLights[1] = new AmbientLight( 0x404040 ); // soft white light
//staticLights[1] = new PointLight( 0xffffff, 1, 0 );
//staticLights[2] = new PointLight( 0xffffff, 1, 0 );

// staticLights[0].castShadow = true;
// staticLights[1].castShadow = true;
// staticLights[2].castShadow = true;

staticLights[ 0 ].position.set( 40, 40, 40 );
//staticLights[ 1 ].position.set( 100, 200, 100 );
//staticLights[ 2 ].position.set( - 100, - 200, - 100 );

export function addHeadLight() {
  const light = new PointLight( 0xff00ff, 100 );
  return light;
}
