import { PointLight } from 'three';

export const staticLights = [];
staticLights[ 0 ] = new PointLight( 0xffffff, 1, 0 );
staticLights[ 1 ] = new PointLight( 0xffffff, 1, 0 );
staticLights[ 2 ] = new PointLight( 0xffffff, 1, 0 );

staticLights[ 0 ].position.set( 0, 200, 0 );
staticLights[ 1 ].position.set( 100, 200, 100 );
staticLights[ 2 ].position.set( - 100, - 200, - 100 );
