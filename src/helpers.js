import range from 'lodash/range';
import {
  cubePointDefaultOpacity, cubePointNearLevel,
} from './config';
import { SphereGeometry, MeshPhongMaterial, Mesh, DoubleSide } from 'three';
import { boardSize, cubeSize, padding } from './config';
import { RedPhong } from './materials';

export function getBoardHeight() {
  return boardSize*cubeSize + boardSize*cubeSize*padding;
}

export function getRealPosition(dimension) {
  return -boardSize*(cubeSize + padding)/2 + dimension*(cubeSize + padding) + (cubeSize + padding)/2;
}

export function getBoardPosition(dimension) {
  return Math.round(
    boardSize/2 - 1/2 + dimension/(cubeSize + padding)
  );
}

window.getBoardPosition = getBoardPosition;
window.getRealPosition = getRealPosition;

export function boardPositionToCoordinates([a, b, c]) {
  return [getRealPosition(a), getRealPosition(b), getRealPosition(c)];
}

export function addSphere(scene, position = [0, 0, 0]) {
  const object = new Mesh(new SphereGeometry( 1, 15, 15 ), RedPhong);
  object.position.set(...position);
  scene.add(object);
}

export function checkBoundariesHit(x, y, z) {
  return x < 0 || x >= boardSize || y < 0 || y >= boardSize || z < 0 || z >= boardSize;
}

export function eqPositions(a, b) {
  return (a[0] === b[0]) && (a[1] === b[1]) && (a[2] === b[2]);
}

export function resetNearPlaceholderCubesOpacity(previousRunSurroundingCubes) {
  previousRunSurroundingCubes.forEach(cube => cube.material.opacity = cubePointDefaultOpacity);
}

export function changeNearPlaceholderCubesOpacity(cubeMap, headPosition) {
  const surroundingCubes = [];
  const closenessOpacityMap = range(-cubePointNearLevel, cubePointNearLevel + 1);
  closenessOpacityMap.map(x => closenessOpacityMap.map(y => closenessOpacityMap.map(z => {
    const xPosition = headPosition[0] + x;
    const yPosition = headPosition[1] + y;
    const zPosition = headPosition[2] + z;
    if (cubeMap[xPosition] &&
        cubeMap[xPosition][yPosition] &&
        cubeMap[xPosition][yPosition][zPosition]) {
      const cube = cubeMap[xPosition][yPosition][zPosition];
      surroundingCubes.push(cube);
      const closenessKoef = (cubePointNearLevel*3 - Math.abs(x) - Math.abs(y) - Math.abs(z)) /
            (cubePointNearLevel*3);
      cube.material.opacity = cubePointDefaultOpacity +
        (1 - cubePointDefaultOpacity)*closenessKoef;
    }
  })));
  return surroundingCubes;
}
