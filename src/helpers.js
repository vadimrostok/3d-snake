import range from 'lodash/range';
import {
  cubePointDefaultOpacity, cubePointNearLevel,
  DIRECTION_xUP, DIRECTION_xDOWN,
  DIRECTION_yUP, DIRECTION_yDOWN,
  DIRECTION_zUP, DIRECTION_zDOWN,
  boardSize, cubeSize, padding,
} from './config';
import { SphereGeometry, MeshPhongMaterial, Mesh, DoubleSide } from 'three';
import { GuidePink } from './materials';

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

export function checkTailHit(head, tail) {
  return tail.reduce((previousTailItemHit, tailItem) => {
    const currentTailItemHit = head.position.equals(tailItem.position);
    if (currentTailItemHit) {
      tailItem.material = GuidePink;
    }
    return previousTailItemHit || currentTailItemHit;
  }, false);
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

export function isValidDirectionChange(currentDirection, newDirection) {
  const pair = [currentDirection, newDirection].sort().toString();
    
  return ![
    [DIRECTION_xUP, DIRECTION_xDOWN],
    [DIRECTION_yUP, DIRECTION_yDOWN],
    [DIRECTION_zUP, DIRECTION_zDOWN], 
  ].reduce((isInvalid, invalidPair) => {
    return isInvalid || (invalidPair.sort().toString() === pair);
  }, false);
}

export function keyToGameDirection(keyCode, angle) {
  const screenDirectionInversion = angle > -135 && angle < 45;
  const useXPlane = angle > 135 || angle < -135 || (angle > -45 && angle < 45);

  switch(keyCode) {
  case 38: // up
  case 87:
    return DIRECTION_yUP;
    break;
  case 40: // down
  case 83:
    return DIRECTION_yDOWN;
    break;
  case 39: // right
  case 68:
    if (useXPlane) {
      return screenDirectionInversion ? DIRECTION_xUP : DIRECTION_xDOWN;
    } else {
      return screenDirectionInversion ? DIRECTION_zUP : DIRECTION_zDOWN;
    }
    break;
  case 37: // left
  case 65:
    if (useXPlane) {
      return screenDirectionInversion ? DIRECTION_xDOWN : DIRECTION_xUP;
    } else {
      return screenDirectionInversion ? DIRECTION_zDOWN : DIRECTION_zUP;
    }
    break;
  default:
    return null;
  }
}

export function tapToGameDirection(clientX, clientY, angle) {
  const deviceY = document.documentElement.clientHeight;
  const deviceX = document.documentElement.clientWidth;
  const x = clientX - deviceX/2;
  const y = clientY - deviceY/2;
  const downhill = x > y*deviceY/deviceX;
  const uphill = y > -x*deviceX/deviceY;

  const left = !downhill && !uphill;
  const right = downhill && uphill;
  const up = downhill && !uphill;
  const down = !downhill && uphill;

  const screenDirectionInversion = angle > -135 && angle < 45;
  const useXPlane = angle > 135 || angle < -135 || (angle > -45 && angle < 45);

  switch(true) {
  case up:
    return DIRECTION_yUP;
    break;
  case down:
    return DIRECTION_yDOWN;
    break;
  case right:
    if (useXPlane) {
      return screenDirectionInversion ? DIRECTION_xUP : DIRECTION_xDOWN;
    } else {
      return screenDirectionInversion ? DIRECTION_zUP : DIRECTION_zDOWN;
    }
    break;
  case left:
    if (useXPlane) {
      return screenDirectionInversion ? DIRECTION_xDOWN : DIRECTION_xUP;
    } else {
      return screenDirectionInversion ? DIRECTION_zDOWN : DIRECTION_zUP;
    }
    break;
  default:
    return null;
  }
}

