import range from 'lodash/range';
import {
  BoxGeometry, Mesh, WireframeGeometry, LineSegments, BufferGeometry,
  Float32BufferAttribute,
} from 'three';
import { SnakeHead, SnakeTail, Dashed } from './materials';
import { getPosition, checkBoundariesHit } from './helpers';
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
          getPosition(x), getPosition(y), getPosition(z)
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
  cube.position.set(...initialHeadPosition.map(getPosition));
  scene.add( cube );
  return cube;
}

export function addTail(scene, position) {
  const geometry = new BoxGeometry( cubeSize, cubeSize, cubeSize );
  const cube = new Mesh( geometry, SnakeTail );
  cube.position.set(...position.map(getPosition));
  scene.add( cube );
  return cube;
}

let previousRunSurroundingCubes = [];
export function moveSnake(cubeMap, head, tail, headLight, headPosition, direction) {
  //cubeMap[headPosition[0]][headPosition[1]][headPosition[2]].visible = true;
  previousRunSurroundingCubes.map(cube => cube.material.opacity = cubePointDefaultOpacity);
  previousRunSurroundingCubes = [];

  range(0, tail.length).reverse().forEach((index) => {
    if (tail[index - 1]) {
      tail[index].position.set(...tail[index - 1].position.toArray());
    } else {
      tail[index].position.set(...headPosition.map(getPosition));
    }
  });

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
  if (checkBoundariesHit(...headPosition)) {
    return [true];
  } else {
    head.position.set(...headPosition.map(getPosition));
    headLight.position.set(...headPosition.map(getPosition));
    cubeMap[headPosition[0]][headPosition[1]][headPosition[2]].visible = false;
    const closenessOpacityMap = range(-cubePointNearLevel, cubePointNearLevel + 1);
    closenessOpacityMap.map(x => closenessOpacityMap.map(y => closenessOpacityMap.map(z => {
      const xPosition = headPosition[0] + x;
      const yPosition = headPosition[1] + y;
      const zPosition = headPosition[2] + z;
      if (cubeMap[xPosition] &&
          cubeMap[xPosition][yPosition] &&
          cubeMap[xPosition][yPosition][zPosition]) {
        const cube = cubeMap[xPosition][yPosition][zPosition];
        previousRunSurroundingCubes.push(cube);
        const closenessKoef = (cubePointNearLevel*3 - Math.abs(x) - Math.abs(y) - Math.abs(z)) /
              (cubePointNearLevel*3);
        cube.material.opacity = cubePointDefaultOpacity +
          (1 - cubePointDefaultOpacity)*closenessKoef;
      }
    })));
    return [false, headPosition, tail];
  }
};

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
