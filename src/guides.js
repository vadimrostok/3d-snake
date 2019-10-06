import { BoxGeometry, ConeGeometry, Mesh, Shape, ShapeGeometry } from 'three';
import { GuidePink, GuideGreen } from './materials';
import { size, cubeSize, padding, guideConeWidth, guideConeHeight } from './config';
import { getBoardHeight } from './helpers';

const coneGeometry = new ConeGeometry( guideConeWidth, guideConeHeight, 12 );

export function addGuides(scene) {
  const guideLength = getBoardHeight() - guideConeHeight*2;
  const halfBoardLength = getBoardHeight()/2;
  const xGeometry = new BoxGeometry( guideLength, cubeSize/10, cubeSize/10 );
  const yGeometry = new BoxGeometry( cubeSize/10, guideLength, cubeSize/10 );
  const zGeometry = new BoxGeometry( cubeSize/10, cubeSize/10, guideLength );

  const dimensions = {
    x: {
      geometry: xGeometry,
      material: GuideGreen,
      coneMaterial: GuideGreen,
      position(y, z) {
        return [0, y*halfBoardLength, z*halfBoardLength];
      },
      coneRotation(coneDirection) {
        return [0, 0, -coneDirection*Math.PI/2];
      },
      conePosition(coneDirection) {
        return [coneDirection*(getBoardHeight()/2 - guideConeHeight/2), 0, 0];
      }
    },
    y: {
      geometry: yGeometry,
      material: GuidePink,
      coneMaterial: GuidePink,
      position(x, z) {
        return [x*halfBoardLength, 0, z*halfBoardLength];
      },
      coneRotation(coneDirection) {
        return [0, 0, Math.PI/2 - coneDirection*Math.PI/2];
      },
      conePosition(coneDirection) {
        return [0, coneDirection*(getBoardHeight()/2 - guideConeHeight/2), 0];
      }
    },
    z: {
      geometry: zGeometry,
      material: GuideGreen,
      coneMaterial: GuideGreen,
      position(x, y) {
        return [x*halfBoardLength, y*halfBoardLength, 0];
      },
      coneRotation(coneDirection) {
        return [coneDirection*Math.PI/2, 0, 0];
      },
      conePosition(coneDirection) {
        return [0, 0, coneDirection*(getBoardHeight()/2 - guideConeHeight/2)];
      }
    }
  };

  return Object.keys(dimensions).map(dimension => {
    const {
      geometry, material, position, conePosition, coneMaterial, coneRotation,
    } = dimensions[dimension];
    return [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([otherDimension1, otherDimension2]) => {
      const guide = new Mesh( geometry, material );
      guide.position.set(...position(otherDimension1, otherDimension2));

      // const arrow = new Shape();
      // arrow.moveTo(0,0);
      // arrow.lineTo(0,0.5);
      // arrow.lineTo(0.5,0);
      // arrow.lineTo(0,-0.5);
      // guide.add(new Mesh( new ShapeGeometry(arrow), coneMaterial ));

      [-1, 1].map(coneDirection => {
        const cone = new Mesh( coneGeometry, coneMaterial );
        cone.rotation.set(...coneRotation(coneDirection));
        cone.position.set(...conePosition(coneDirection));
        guide.add( cone );
      });

      scene.add( guide );
      return guide;
    }).flat();
  });

  // const xGuides = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([y, z]) => {
  //   const guide = new Mesh( xGeometry, GuideGreen );
  //   guide.position.set(
  //     0, y*getBoardHeight()/2, z*getBoardHeight()/2
  //   );
  //   scene.add( guide );
  //   return guide;
  // }).flat();
  
  const yGuides = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([x, z]) => {
    const guide = new Mesh( yGeometry, GuidePink );
    guide.position.set(
      x*getBoardHeight()/2, 0, z*getBoardHeight()/2
    );

    [-1, 1].map(coneDirection => {
      const cone = new Mesh( coneGeometry, GuidePink );
      cone.rotation.z = Math.PI/2 - coneDirection*Math.PI/2;
      cone.position.set(0, coneDirection*(getBoardHeight()/2 - guideConeHeight/2), 0);
      guide.add( cone );
    });

    scene.add( guide );
    return guide;
  }).flat();

  const zGuides = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([x, y]) => {
    const guide = new Mesh( zGeometry, GuideGreen );
    guide.position.set(
      x*getBoardHeight()/2, y*getBoardHeight()/2, 0
    );
    scene.add( guide );
    return guide;
  }).flat();
  
  return [xGuides, yGuides, zGuides];
}

export function updateGuidesVisibility([xGuides, yGuides, zGuides], yRotation) {
  [xGuides, yGuides, zGuides].flat().forEach(guide => guide.visible = false);
  const angles = [
    (yRotation > -45) && (yRotation <= 135),
    (yRotation > -135) && (yRotation <= 45),
    (yRotation > 135) || (yRotation <= -45),
    (yRotation > 45) || (yRotation <= -135)
  ];

  yGuides[0].visible = angles[0];
  xGuides[0].visible = xGuides[1].visible = angles[0] && angles[1];

  yGuides[1].visible = angles[1];
  zGuides[1].visible = zGuides[2].visible = angles[1] && angles[2];

  yGuides[2].visible = angles[2];
  xGuides[2].visible = xGuides[3].visible = angles[2] && angles[3];

  yGuides[3].visible = angles[3];
  zGuides[0].visible = zGuides[3].visible = angles[3] && angles[0];

  console.log(...angles);
}
