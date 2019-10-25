import throttle from 'lodash/throttle';
import * as THREE from 'three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { DeviceOrientationControls }
  from '../node_modules/three/examples/jsm/controls/DeviceOrientationControls.js';
import { staticLights, addHeadLight } from './lights';
import { boardSize, padding, sideSize,
         DIRECTION_xUP, DIRECTION_xDOWN,
         DIRECTION_yUP, DIRECTION_yDOWN,
         DIRECTION_zUP, DIRECTION_zDOWN, 
       } from './config';
import {
  getRealPosition, boardPositionToCoordinates, isValidDirectionChange,
  keyToGameDirection, tapToGameDirection,
} from './helpers';
import { addCubes, addHead, createNewFood, addTail, moveSnake } from './board';
import { addGuides, addHeadGuides, updateGuides } from './guides';

const TYPE_EMPTY = 0;
const TYPE_BODY = 1;
const TYPE_HEAD = 2;
const TYPE_FOOD = 3;

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

  const extra = new DeviceOrientationControls(camera);

  const cubeMap = addCubes(scene);
  const [xGuides, yGuides, zGuides] = addGuides(scene);

  let headPosition, head, tail, food, foodPosition, xzHeadGuides, yHeadGuides,
      theEnd, currentDirection;

  function initRestartableObjects() {
    headPosition = [Math.floor(boardSize/3), Math.floor(boardSize/3), Math.floor(boardSize/3)];
    head = addHead(scene, headPosition);
    tail = [
      addTail(scene, [headPosition[0], headPosition[1], headPosition[2] + 1]),
      addTail(scene, [headPosition[0], headPosition[1], headPosition[2] + 2]),
      // addTail(scene, [headPosition[0], headPosition[1], headPosition[2] + 3]),
      // addTail(scene, [headPosition[0], headPosition[1], headPosition[2] + 4]),
    ];
    [foodPosition, food] = createNewFood(scene, headPosition, tail);

    [xzHeadGuides, yHeadGuides] = addHeadGuides(head);

    theEnd = false;
    currentDirection = DIRECTION_xUP;

    camera.lookAt(0, 0, 0);
    camera.position.set(0, 0, -boardSize*2);
    controls.update();

    document.querySelector('#mobile-controls').style.opacity = '0';
  }

  function deleteRestartableObjects() {
    scene.remove(head);
    tail.concat([foodPosition, food, xzHeadGuides, yHeadGuides]).map(item => scene.remove(item));
  }

  initRestartableObjects();

  // FIXME:
  window.head = head;
  window.scene = scene;
  window.tail = tail;
  window.cubeMap = cubeMap;
  window.canvas = renderer.domElement;
  window.camera = camera;
  window.controls = controls;
  window.guides = zGuides;
  window.xzHeadGuides = xzHeadGuides;

  const logNode = document.querySelector('#log');
  function log() {
    const toLog = {};
    //toLog.angle = controls.getAzimuthalAngle();
    //toLog.AzimuthalAngleDeg = controls.getAzimuthalAngle()*180/Math.PI;
    //toLog.PolarAngleDeg = controls.getPolarAngle()*180/Math.PI;

    const logStr = Object.keys(toLog).map((key) => `${key}: ${toLog[key].toFixed(3)}<br />`).join('');
    logNode.innerHTML = logStr;
  }

  return {
    initialize() {

      this.onKeyDown = (e) => {
        const angle = controls.getAzimuthalAngle()*180/Math.PI;
        const newDirection = keyToGameDirection(e.keyCode, angle);
        if (newDirection && isValidDirectionChange(currentDirection, newDirection)) {
          currentDirection = newDirection;
          resetTime();
          this.move();
        }
      };
      this.onMouseMove = throttle(function (e) {
        if (e.buttons === 1) {
          callUpdateGuides();
        }
      }, 50);

      this.onTouchMove = throttle(function (e) {
        callUpdateGuides();
      }, 100);

      this.onTouchStart = (e) => {
        if (theEnd) {
          document.querySelector('#the-end').style.display = 'none';
          deleteRestartableObjects();
          initRestartableObjects();
          callUpdateGuides();
          this.restartCb();
          this.restartCb = null;
        }
        const x = e.touches[0].pageX;
        const y = e.touches[0].pageY;
        const angle = controls.getAzimuthalAngle()*180/Math.PI;
        const newDirection = tapToGameDirection(x, y, angle);
        if (newDirection && isValidDirectionChange(currentDirection, newDirection)) {
          currentDirection = newDirection;
          resetTime();
          this.move();
        }
      };

      this.move();

      function callUpdateGuides() {
        updateGuides(
          [xGuides, yGuides, zGuides],
          [xzHeadGuides, yHeadGuides],
          controls.getAzimuthalAngle(),
          controls.getPolarAngle(),
          camera,
        );
      }

      document.addEventListener('keydown', this.onKeyDown, true);
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        controls.domElement.addEventListener('touchmove', this.onTouchMove);
        controls.domElement.addEventListener('touchstart', this.onTouchStart);
        window.setTimeout(() => {
          document.querySelector('#mobile-controls').style.display = 'none';
        }, 3000);
      } else {
        document.querySelector('#mobile-controls').style.display = 'none';
        controls.domElement.addEventListener('mousemove', this.onMouseMove);
      }
      
      controls.update();
      callUpdateGuides();

      // Restart logic:
      document.addEventListener('keydown', (e) => {
        if (e.keyCode === 82 && !e.ctrlKey && !e.metaKey) {
          const actions = () => {
            deleteRestartableObjects();
            initRestartableObjects();
            document.querySelector('#the-end').style.display = 'none';
            document.addEventListener('keydown', this.onKeyDown, true);
            document.addEventListener('mousemove', this.onMouseMove);
            callUpdateGuides();
          };
          if (this.restartCb) {
            actions();
            this.restartCb();
            this.restartCb = null;
          } else if (window.confirm('Are you sure you want to restart?')) {
            actions();
          }
        };
      }, true);
    },
    onReastart(cb) {
      this.restartCb = cb;
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
        document.removeEventListener('keydown', this.onKeyDown, true);
        document.removeEventListener('mousemove', this.onMouseMove);
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

      const moveUpdateInterval = 2000;

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
