import { BoxGeometry, Mesh, WireframeGeometry, LineSegments, Color } from 'three';
import { TransBlue, RedPhong } from './materials';
import { getPosition, checkBoundariesHit } from './helpers';
import { cubeSize, boardSize,
         DIRECTION_xUP, DIRECTION_xDOWN,
         DIRECTION_yUP, DIRECTION_yDOWN,
         DIRECTION_zUP, DIRECTION_zDOWN, 
       } from './config';

export function addCubes(scene) {
  //const geometry = new WireframeGeometry(new BoxGeometry( cubeSize, cubeSize, cubeSize ));
  const geometry = new BoxGeometry( cubeSize, cubeSize, cubeSize );
  const cubeMap = [];

  for (let x = 0; x < boardSize; x++) {
    cubeMap[x] = cubeMap[x] || [];
    for (let y = 0; y < boardSize; y++) {
      cubeMap[x][y] = cubeMap[x][y] || [];
      for (let z = 0; z < boardSize; z++) {

        const wireframe = new WireframeGeometry( geometry );

        const cube = new LineSegments( wireframe );
        cube.material.depthTest = true;
        cube.material.color = new Color(0x404040);
        cube.material.opacity = 0.25;
        //cube.material.transparent = true;

        //scene.add( cube );

        //const cube = new Mesh( geometry, TransBlue );

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
  const cube = new Mesh( geometry, RedPhong );
  cube.position.set(...initialHeadPosition.map(getPosition));
  scene.add( cube );
  return cube;
}

export function moveSnake(cubeMap, head, headLight, headPosition, direction) {
  cubeMap[headPosition[0]][headPosition[1]][headPosition[2]].visible = true;
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
    return [false, headPosition];
  }
};
