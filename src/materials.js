import {
  MeshPhongMaterial, MeshBasicMaterial, MeshPhysicalMaterial, DoubleSide, FrontSide,
  MeshStandardMaterial,
} from 'three';

export const RedPhong = new MeshPhongMaterial( {
  color: 0xff0000, emissive: 0x072534, side: DoubleSide, flatShading: true
} );

export const GuidePink = new MeshBasicMaterial( {
    color: 0x3500D3, emissive: 0x072534, side: DoubleSide, flatShading: true,
    transparent: true,
    opacity: 0.6,
} );

export const GuideGreen = new MeshBasicMaterial( {
  color: 0x3FEEE6, emissive: 0x072534, side: DoubleSide, flatShading: true,
  transparent: true,
  opacity: 0.6,
} );

export const TransBlue = new MeshStandardMaterial({
  roughness: 0.5, metalness: 1.0 ,
  color: 0x156289,
  // side: DoubleSide,
  // transparent: true,
  // opacity: 0.2,
}); 
