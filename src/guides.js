import {
  BoxGeometry, ConeGeometry, Mesh, Shape, ShapeGeometry, Quaternion, Vector3, AxesHelper, Euler,
  Object3D
} from 'three';
import { GuidePink, GuideGreen } from './materials';
import {
  boardSize, cubeSize, padding,
  bigGuideConeWidth, bigGuideConeHeight, bigGuideWidth, bigGuideLength,
  smallGuideConeWidth, smallGuideConeHeight, smallGuideWidth, smallGuideLength,
  boardHeight,
} from './config';

const coneGeometry = new ConeGeometry( bigGuideConeWidth, bigGuideConeHeight, 12 );

const halfBoardLength = boardHeight/2;

function getArrowShape(guideWidth, guideLength, guideConeWidth, guideConeHeight) {
  const arrow = new Shape();
  
  arrow.moveTo(guideWidth/2, 0);
  arrow.lineTo(guideWidth/2, guideLength/2 - guideConeHeight);
  arrow.lineTo(guideConeWidth/2, guideLength/2 - guideConeHeight);
  arrow.lineTo(0, guideLength/2);
  arrow.lineTo(-guideConeWidth/2, guideLength/2 - guideConeHeight);
  arrow.lineTo(-guideWidth/2, guideLength/2 - guideConeHeight);

  arrow.lineTo(-guideWidth/2, -guideLength/2 + guideConeHeight);
  arrow.lineTo(-guideConeWidth/2, -guideLength/2 + guideConeHeight);
  arrow.lineTo(0, -guideLength/2);

  arrow.lineTo(guideConeWidth/2, -guideLength/2 + guideConeHeight);
  arrow.lineTo(guideWidth/2, -guideLength/2 + guideConeHeight);

  return arrow;
}

export function addHeadGuides(head) {
  const dimensions = {
    xz: {
      material: GuideGreen,
      position(y, z) {
        return [0, y*(halfBoardLength + padding), z*(halfBoardLength + padding)];
      },
      rotation() {
        return [0, 0, Math.PI/2];
      }
    },
    y: {
      material: GuidePink,
      position(x, y) {
        return [x*(halfBoardLength + padding), y*(halfBoardLength + padding), 0];
      },
      rotation() {
        return [0, Math.PI/2, 0];
      }
    }
  };

  return Object.keys(dimensions).map(dimension => {
    const { material, position, rotation } = dimensions[dimension];
    const ignoreDepthMaterial = material.clone();
    ignoreDepthMaterial.depthTest = false;
    //ignoreDepthMaterial.opacity = 1;
    const guide = new Mesh( new ShapeGeometry(
      getArrowShape(smallGuideWidth, smallGuideLength, smallGuideConeWidth, smallGuideConeHeight)
    ), ignoreDepthMaterial);
    guide.rotation.set(...rotation());
    const wrapper = new Object3D();
    wrapper.add(guide);
    head.add(wrapper);
    return wrapper;
  });
}

export function addGuides(scene) {
  const dimensions = {
    x: {
      material: GuideGreen,
      position(y, z) {
        return [0, y*(halfBoardLength + padding), z*(halfBoardLength + padding)];
      },
      rotation() {
        return [0, 0, Math.PI/2];
      }
    },
    y: {
      material: GuidePink,
      position(x, z) {
        return [x*(halfBoardLength + padding), 0, z*(halfBoardLength + padding)];
      },
      rotation() {
        return [0, 0, 0];
      }
    },
    z: {
      material: GuideGreen,
      position(x, y) {
        return [x*(halfBoardLength + padding), y*(halfBoardLength + padding), 0];
      },
      rotation() {
        return [Math.PI/2, Math.PI/2, 0];
      }
    }
  };

  return Object.keys(dimensions).map(dimension => {
    const { material, position, rotation } = dimensions[dimension];
    return [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([otherDimension1, otherDimension2]) => {
      const guide = new Mesh( new ShapeGeometry(
        getArrowShape(bigGuideWidth, bigGuideLength, bigGuideConeWidth, bigGuideConeHeight)
      ), material);
      guide.position.set(...position(otherDimension1, otherDimension2));
      guide.rotation.set(...rotation(otherDimension1, otherDimension2));
      scene.add(guide);
      return guide;
    }).flat();
  });
}


export function updateGuides(
  [xGuides, yGuides, zGuides],
  [xzHeadGuides, yHeadGuides],
  azimuthalRotationRads,
  polarRotation,
  camera,
) {
  const azimuthalRotation = azimuthalRotationRads*180/Math.PI;
  [xGuides, yGuides, zGuides].flat().forEach(guide => guide.visible = false);
  const angles = [
    (azimuthalRotation > -45) && (azimuthalRotation <= 135),
    (azimuthalRotation > -135) && (azimuthalRotation <= 45),
    (azimuthalRotation > 135) || (azimuthalRotation <= -45),
    (azimuthalRotation > 45) || (azimuthalRotation <= -135)
  ];

  yGuides[0].visible = angles[0];
  xGuides[0].visible = xGuides[1].visible = angles[0] && angles[1];

  yGuides[1].visible = angles[1];
  zGuides[1].visible = zGuides[2].visible = angles[1] && angles[2];

  yGuides[2].visible = angles[2];
  xGuides[2].visible = xGuides[3].visible = angles[2] && angles[3];

  yGuides[3].visible = angles[3];
  zGuides[0].visible = zGuides[3].visible = angles[3] && angles[0];

  yHeadGuides.rotation.y = Math.PI/2 + azimuthalRotationRads;

  xzHeadGuides.rotation.y = azimuthalRotationRads;
  xzHeadGuides.children[0].rotation.x = Math.PI/2 + polarRotation;

  yGuides[0].rotation.y = yGuides[1].rotation.y =
    yGuides[2].rotation.y = yGuides[3].rotation.y = azimuthalRotationRads;
  xGuides[0].rotation.x = xGuides[1].rotation.x = Math.PI/2 + polarRotation;
  xGuides[2].rotation.x = xGuides[3].rotation.x = Math.PI/2 - polarRotation;
  zGuides[0].rotation.y = zGuides[3].rotation.y = -polarRotation;
  zGuides[1].rotation.y = zGuides[2].rotation.y = polarRotation;
}
