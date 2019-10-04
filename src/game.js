import * as THREE from 'three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { staticLights } from './lights';
import { size, padding, sideSize,
         DIRECTION_xUP, DIRECTION_xDOWN,
         DIRECTION_yUP, DIRECTION_yDOWN,
         DIRECTION_zUP, DIRECTION_zDOWN, 
       } from './config';
import { getPosition, boardPositionToCoordinates } from './helpers';
import { addCubes, addHead, moveSnake } from './board';

const TYPE_EMPTY = 0;
const TYPE_BODY = 1;
const TYPE_HEAD = 2;
const TYPE_FOOD = 3;

function hitTail() {
  //
}

function trackDirectionChanges(getAngle, onChange, doExtraMove) {
  document.addEventListener('keydown', function (e) {
    const angle = getAngle();
    const screenDirectionInversion = angle > -135 && angle < 45;
    const useXPlane = angle > 135 || angle < -135 || (angle > -45 && angle < 45);

    switch(e.keyCode) {
    case 38: // up
      onChange(DIRECTION_yUP);
      break;
    case 40: // down
      onChange(DIRECTION_yDOWN);
      break;
    case 39: // right
      if (useXPlane) {
        onChange(screenDirectionInversion ? DIRECTION_xUP : DIRECTION_xDOWN);
      } else {
        onChange(screenDirectionInversion ? DIRECTION_zUP : DIRECTION_zDOWN);
      }
      break;
    case 37: // left
      if (useXPlane) {
        onChange(screenDirectionInversion ? DIRECTION_xDOWN : DIRECTION_xUP);
      } else {
        onChange(screenDirectionInversion ? DIRECTION_zDOWN : DIRECTION_zUP);
      }
      break;
    }
    if ([37,38,39,40].indexOf(e.keyCode) !== -1) {
      doExtraMove();
    }
  }, true);
}

export default function Game () {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  staticLights.map(light => scene.add(light));

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.enableKeys = false;

  const cubeMap = addCubes(scene);

  let headPosition = [0,0,0];
  const head = addHead(scene, headPosition);

  // FIXME:
  window.head = head;
  window.cubeMap = cubeMap;
  window.canvas = renderer.domElement;
  window.camera = camera;
  window.controls = controls;

  const multiplier = 2;
  camera.position.set(0, 0, -size*multiplier);

  let theEnd = false;
  let currentDirection = DIRECTION_xUP;

  const logNode = document.querySelector('#log');
  function log() {
    const toLog = {};
    toLog.angle = controls.getAzimuthalAngle();
    toLog.angleDeg = toLog.angle*180/Math.PI;

    const logStr = Object.keys(toLog).map((key) => `${key}: ${toLog[key].toFixed(3)}<br />`).join('');
    logNode.innerHTML = logStr;
  }

  return {
    initialize() {
      trackDirectionChanges(() => controls.getAzimuthalAngle()*180/Math.PI, (newDirection) => {
        currentDirection = newDirection;
      }, () => {
        this.move();
      });
    },
    tick() {},
    move() {
      [theEnd, headPosition] = moveSnake(cubeMap, head, headPosition, currentDirection);
      if (theEnd) {
        document.querySelector('#the-end').style.display = 'block';
      }
    },
    update() {
      controls.update();

      renderer.render( scene, camera );
    },
    onFrame: (function() {
      let time = (new Date).getTime();
      let logTime = (new Date).getTime();
      let timeDiff = 0;
      let logTimeDiff = 0;

      //const moveUpdateInterval = 10000;
      // FIXME:
      const moveUpdateInterval = 1000;

      const logUpdateInterval = 100;

      return function() {
        let newTime = (new Date).getTime();
        timeDiff = newTime - time;
        logTimeDiff = newTime - logTime;

        if (timeDiff >= moveUpdateInterval) {
          time = newTime;
          this.move();
        }

        if (logTimeDiff >= logUpdateInterval) {
          logTime = newTime;
          log();
        }

        this.update();

        return !theEnd;
      };
    })()
  };
};