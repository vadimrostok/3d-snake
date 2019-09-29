import { MeshPhongMaterial, MeshPhysicalMaterial, DoubleSide, FrontSide } from 'three';

export const RedPhong = new MeshPhongMaterial( {
  color: 0xff0000, emissive: 0x072534, side: DoubleSide, flatShading: true
} );
export const TransBlue = new MeshPhysicalMaterial({
  color: 0x156289, emissive: 0x072534, side: FrontSide, flatShading: false,
  transparency: 0.80,
  envMapIntensity: 1,
  lightIntensity: 1,
  exposure: 1,
  transparent: true
}); 
