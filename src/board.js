import range from 'lodash/range';
import without from 'lodash/without';
import {
  BoxGeometry, Mesh, WireframeGeometry, LineSegments, BufferGeometry,
  Float32BufferAttribute,
} from 'three';
import { SnakeHead, SnakeTail, Food, Dashed } from './materials';
import {
  getRealPosition, checkBoundariesHit, eqPositions, resetNearPlaceholderCubesOpacity,
  changeNearPlaceholderCubesOpacity, getBoardPosition,
} from './helpers';
import { cubeSize, boardSize, cubePointKoef,
         DIRECTION_xUP, DIRECTION_xDOWN,
         DIRECTION_yUP, DIRECTION_yDOWN,
         DIRECTION_zUP, DIRECTION_zDOWN,
         cubePointDefaultOpacity, cubePointNearLevel,
       } from './config';

export function addCubes(scene) {
  const geometryCube = cubeBufferGeometry(cubeSize*cubePointKoef);
  const cubeMap = [];

  for (let x = 0; x < boardSize; x++) {

    cubeMap[x] = cubeMap[x] || [];

    for (let y = 0; y < boardSize; y++) {

      cubeMap[x][y] = cubeMap[x][y] || [];

      for (let z = 0; z < boardSize; z++) {

	const cube = new LineSegments(geometryCube, Dashed.clone());
	cube.computeLineDistances();

        cube.material.transparent = true;
        cube.material.opacity = cubePointDefaultOpacity;

        cube.position.set(
          getRealPosition(x), getRealPosition(y), getRealPosition(z)
        );

        scene.add( cube );

        cubeMap[x][y][z] = cube;

      }
    }
  }
  return cubeMap;
}

export function addHead(scene, initialHeadPosition) {
  const geometry = new BoxGeometry( cubeSize, cubeSize, cubeSize );
  const cube = new Mesh( geometry, SnakeHead );
  cube.position.set(...initialHeadPosition.map(getRealPosition));
  scene.add( cube );
  return cube;
}

const getRandomPosition = (...occupied) => {
  const items = without(range(0, boardSize), ...occupied);
  return items[Math.round(Math.random()*(items.length - 1))];
};

export function createNewFood(scene, headPosition, tail) {
  const geometry = new BoxGeometry( cubeSize, cubeSize, cubeSize );
  const cube = new Mesh( geometry, Food );
  const position = [
    getRandomPosition(headPosition[0], ...tail.map(item => item.position.x)),
    getRandomPosition(headPosition[1], ...tail.map(item => item.position.y)),
    getRandomPosition(headPosition[2], ...tail.map(item => item.position.z))
  ];
  cube.position.set(...position.map(getRealPosition));
  scene.add( cube );
  return [position, cube];
}

export function updateFoodPosition(food, headPosition, tail) {
  const position = [
    getRandomPosition(headPosition[0], ...tail.map(item => item.position.x)),
    getRandomPosition(headPosition[1], ...tail.map(item => item.position.y)),
    getRandomPosition(headPosition[2], ...tail.map(item => item.position.z))
  ];
  food.position.set(...position.map(getRealPosition));
  return position;
}

export function addTail(scene, position) {
  const geometry = new BoxGeometry( cubeSize, cubeSize, cubeSize );
  const cube = new Mesh( geometry, SnakeTail );
  cube.position.set(...position.map(getRealPosition));
  scene.add( cube );
  return cube;
}

function moveTail(tail, headPosition) {
  range(0, tail.length).reverse().forEach((index) => {
    if (tail[index - 1]) {
      tail[index].position.set(...tail[index - 1].position.toArray());
    } else {
      tail[index].position.set(...headPosition.map(getRealPosition));
    }
  });
}

function moveHead(direction, headPosition) {
  switch(direction) {
  case DIRECTION_xUP:
    headPosition[0] += 1;
    break;
  case DIRECTION_xDOWN:
    headPosition[0] -= 1;
    break;
  case DIRECTION_yUP:
    headPosition[1] += 1;
    break;
  case DIRECTION_yDOWN:
    headPosition[1] -= 1;
    break;
  case DIRECTION_zUP:
    headPosition[2] += 1;
    break;
  case DIRECTION_zDOWN:
    headPosition[2] -= 1;
    break;
  }

}

let previousRunSurroundingCubes = [];
export function moveSnake({
  cubeMap,
  head, headPosition,
  tail,
  food, foodPosition,
  direction,
  scene,
}) {
  resetNearPlaceholderCubesOpacity(previousRunSurroundingCubes);

  const tailEndPosition = tail.length && tail[tail.length - 1].position.toArray();
  moveTail(tail, headPosition);

  moveHead(direction, headPosition);

  if (checkBoundariesHit(...headPosition)) {
    return [/*the end*/true];
  } else {
    console.log(headPosition, foodPosition);
    if (eqPositions(headPosition, foodPosition)) {
      tail.push(addTail(scene, tailEndPosition.map(getBoardPosition)));
      foodPosition = updateFoodPosition(food, headPosition, tail);
    }

    // Move head:
    head.position.set(...headPosition.map(getRealPosition));

    // Hide "placeholder" cube in head's place:
    cubeMap[headPosition[0]][headPosition[1]][headPosition[2]].visible = false;

    // Make near cubes brighter:
    previousRunSurroundingCubes = changeNearPlaceholderCubesOpacity(cubeMap, headPosition);

    return [/*the end*/false, headPosition, foodPosition, tail];
  }
}

// "Placeholder" cube goemetry:
function cubeBufferGeometry( size ) {
  var h = size * 0.5;
  var geometry = new BufferGeometry();
  var position = [];
  position.push(
    - h, - h, - h,
    - h, h, - h,
    - h, h, - h,
    h, h, - h,
    h, h, - h,
    h, - h, - h,
    h, - h, - h,
    - h, - h, - h,
    - h, - h, h,
    - h, h, h,
    - h, h, h,
    h, h, h,
    h, h, h,
    h, - h, h,
    h, - h, h,
    - h, - h, h,
    - h, - h, - h,
    - h, - h, h,
    - h, h, - h,
    - h, h, h,
    h, h, - h,
    h, h, h,
    h, - h, - h,
    h, - h, h
  );
  geometry.addAttribute('position', new Float32BufferAttribute(position, 3));
  return geometry;
}
