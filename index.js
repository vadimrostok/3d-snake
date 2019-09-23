let time = (new Date).getTime();
let diff = 0;

let interval = 1000;

const size = 10;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var lights = [];
lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

lights[ 0 ].position.set( 0, 200, 0 );
lights[ 1 ].position.set( 100, 200, 100 );
lights[ 2 ].position.set( - 100, - 200, - 100 );

scene.add( lights[ 0 ] );
scene.add( lights[ 1 ] );
scene.add( lights[ 2 ] );

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.update();


const padding = 0.3;
const sideSize = 1;

function getPosition(dimension) {
  return -size*(sideSize + padding)/2 + dimension*(sideSize + padding) + (sideSize + padding)/2;
}

function addCenter() {
  let geometry = new THREE.SphereGeometry( 1, 5, 5 );
  let material = new THREE.MeshPhongMaterial( {
    color: 0xff0000, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true
  } );
  var cube = new THREE.Mesh( geometry, material);
  cube.position.set(
    0,0,0
  );
  scene.add( cube );
}

function addCubes(sideQuantity) {
  const geometry = new THREE.BoxGeometry( sideSize, sideSize, sideSize );
  
  // var material = new THREE.MeshPhongMaterial( {
  //   color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true
  // } );
  var material = new THREE.MeshPhysicalMaterial( {
    color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true,
    transparency: 0.90,
    envMapIntensity: 1,
    lightIntensity: 1,
    exposure: 1,
    transparent: true
  } );
  

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        var cube = new THREE.Mesh( geometry, material );
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

function move() {
  headPosition[2] += sideSize;
  head.position.set(...headPosition.map(getPosition));
}

addCenter();
addCubes(size);
const multiplier = 1;
camera.position.set(size*multiplier,size*multiplier,size*multiplier);
addHead([0,0,0]);

var animate = function () {
  requestAnimationFrame( animate );

  let newTime = (new Date).getTime();
  diff = newTime - time;
  if (diff >= interval) {
    time = newTime;
    move();
  }

  controls.update();

  renderer.render( scene, camera );
};

animate();
