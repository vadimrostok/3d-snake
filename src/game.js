import * as THREE from 'three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import lights from './lights';
import { size, padding, sideSize } from './config';
import { getPosition, addSphere } from './helpers';
import { TransBlue } from './materials';

export default function Game () {

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  lights.map(light => scene.add(light));

  const controls = new OrbitControls( camera, renderer.domElement );

  function addCubes(sideQuantity) {
    const geometry = new THREE.BoxGeometry( sideSize, sideSize, sideSize );

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          var cube = new THREE.Mesh( geometry, TransBlue );
          cube.position.set(
            getPosition(x), getPosition(y), getPosition(z)
          );
          scene.add( cube );
        }
      }
    }
  }

  let head, headPosition;

  function addHead(initialHeadPosition) {
    const geometry = new THREE.BoxGeometry( sideSize, sideSize, sideSize );                              
    var material = new THREE.MeshPhongMaterial( {
      color: 0xff0000, emissive:1, side: THREE.DoubleSide, flatShading: true
    } );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.set(...initialHeadPosition.map(getPosition));
    headPosition = initialHeadPosition;
    head = cube;
    scene.add( cube );
  }

  addSphere(scene);
  addCubes(size);

  const multiplier = 1;
  camera.position.set(size*multiplier,size*multiplier,size*multiplier);
  addHead([0,0,0]);

  return {
    initialize() {

    },
    tick() {
      
    },
    move() {
      headPosition[2] += sideSize;
      head.position.set(...headPosition.map(getPosition));
    },
    update() {
      controls.update();

      renderer.render( scene, camera );
    },
    onFrame: (function() {
      let time = (new Date).getTime();
      let timeDiff = 0;

      const updateInterval = 1000;

      return function() {
        let newTime = (new Date).getTime();
        timeDiff = newTime - time;

        if (timeDiff >= updateInterval) {
          time = newTime;
          this.move();
        }

        this.update();
      };
    })()
  };
};
