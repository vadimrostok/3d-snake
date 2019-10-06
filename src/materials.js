import {
  MeshPhongMaterial, MeshBasicMaterial, MeshPhysicalMaterial, DoubleSide, FrontSide,
  //MeshToonMaterial,
} from 'three';
export const GuideGreen = new MeshBasicMaterial( {
  color: 0x33ee50, emissive: 0x072534, side: DoubleSide, flatShading: true,
  transparent: true,
  opacity: 0.5,
} );

export const RedPhong = new MeshPhongMaterial( {
  color: 0xff0000, emissive: 0x072534, side: DoubleSide, flatShading: true
} );

export const GuidePink = new MeshPhongMaterial( {
  color: 0xff00ff, emissive: 0x072534, side: DoubleSide, flatShading: true
} );

// export const GuideGreen = new MeshPhongMaterial( {
//   color: 0x00ff00, emissive: 0x072534, side: DoubleSide, flatShading: true
// } );

export const TransBlue = new MeshPhysicalMaterial({
  color: 0x156289, emissive: 0x072534, side: FrontSide, flatShading: false,
  transparency: 0.80,
  envMapIntensity: 1,
  lightIntensity: 1,
  exposure: 1,
  transparent: true
}); 
