import throttle from 'lodash/throttle';
import * as THREE from 'three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { staticLights, addHeadLight } from './lights';
import { boardSize, padding, sideSize,
         DIRECTION_xUP, DIRECTION_xDOWN,
         DIRECTION_yUP, DIRECTION_yDOWN,
         DIRECTION_zUP, DIRECTION_zDOWN, 
       } from './config';
import { getRealPosition, boardPositionToCoordinates } from './helpers';
import { addCubes, addHead, createNewFood, addTail, moveSnake } from './board';
import { addGuides, updateGuides } from './guides';

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
  let time;
  const resetTime = function () {
    time = (new Date).getTime();
  };
  resetTime();
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize( window.innerWidth, window.innerHeight );

  scene.background = new THREE.Color( 0x342326 );
  scene.fog = new THREE.Fog( 0x040306, 1, 150 );

  document.body.appendChild( renderer.domElement );

  staticLights.map(light => scene.add(light));

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.update();
  controls.enableKeys = false;

  const cubeMap = addCubes(scene);
  const [xGuides, yGuides, zGuides] = addGuides(scene);

  let headPosition = [Math.floor(boardSize/3), Math.floor(boardSize/3), Math.floor(boardSize/3)];
  const head = addHead(scene, headPosition);
  let tail = [
    addTail(scene, [headPosition[0], headPosition[1], headPosition[2] + 1]),
    addTail(scene, [headPosition[0], headPosition[1], headPosition[2] + 2])
  ];
  let [foodPosition, food] = createNewFood(scene, headPosition, tail);

  // FIXME:
  window.head = head;
  window.tail = tail;
  window.cubeMap = cubeMap;
  window.canvas = renderer.domElement;
  window.camera = camera;
  window.controls = controls;
  window.guides = zGuides;

  const multiplier = 2;
  camera.position.set(0, 0, -boardSize*multiplier);

  let theEnd = false;
  let currentDirection = DIRECTION_xUP;

  const logNode = document.querySelector('#log');
  function log() {
    const toLog = {};
    //toLog.angle = controls.getAzimuthalAngle();
    toLog.AzimuthalAngleDeg = controls.getAzimuthalAngle()*180/Math.PI;
    toLog.PolarAngleDeg = controls.getPolarAngle()*180/Math.PI;

    const logStr = Object.keys(toLog).map((key) => `${key}: ${toLog[key].toFixed(3)}<br />`).join('');
    logNode.innerHTML = logStr;
  }

  return {
    initialize() {
      this.move();
      trackDirectionChanges(() => controls.getAzimuthalAngle()*180/Math.PI, (newDirection) => {
        currentDirection = newDirection;
      }, () => {
        resetTime();
        this.move();
      });
      controls.domElement.addEventListener('mousemove', throttle(function (e) {
        if (e.buttons === 1) {
          updateGuides(
            [xGuides, yGuides, zGuides],
            controls.getAzimuthalAngle(),
            controls.getPolarAngle()
          );
        }
      }, 100));
      controls.update();
      updateGuides(
        [xGuides, yGuides, zGuides],
        controls.getAzimuthalAngle(),
        controls.getPolarAngle()
      );
    },
    tick() {},
    move() {
      [theEnd, headPosition, foodPosition, tail] = moveSnake({
        cubeMap,
        head, headPosition,
        tail,
        food, foodPosition,
        direction: currentDirection,
        scene,
      });
      if (theEnd) {
        document.querySelector('#the-end').style.display = 'block';
      }
    },
    update() {
      renderer.render( scene, camera );
    },
    onFrame: (function() {
      resetTime();
      let logTime = (new Date).getTime();
      let timeDiff = 0;
      let logTimeDiff = 0;

      const moveUpdateInterval = 10000;
      // FIXME:
      //const moveUpdateInterval = 1000;

      const logUpdateInterval = 100;

      return function() {
        let newTime = (new Date).getTime();
        timeDiff = newTime - time;
        logTimeDiff = newTime - logTime;

        if (timeDiff >= moveUpdateInterval) {
          resetTime();
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
