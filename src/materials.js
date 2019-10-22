import {
  MeshPhongMaterial, MeshBasicMaterial, MeshPhysicalMaterial, DoubleSide, FrontSide,
  MeshStandardMaterial, LineDashedMaterial,
} from 'three';

import { cubeSize, cubePointKoef } from './config';

export const SnakeHead = new MeshBasicMaterial( {
  color: 0xffaa00, emissive: 0x072534, side: DoubleSide, flatShading: true, fog: false,
} );

export const SnakeTail = new MeshBasicMaterial( {
  color: 0xdd8800, emissive: 0x072534, side: DoubleSide, flatShading: true, fog: false,
} );

export const Food = new MeshBasicMaterial( {
  color: 0x00dd88, emissive: 0x072534, side: DoubleSide, flatShading: true, fog: false,
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

export const Dashed = new LineDashedMaterial({
  color: 0xffaa00,
  dashSize: cubeSize*cubePointKoef*cubePointKoef,
  gapSize: cubeSize*cubePointKoef*cubePointKoef/3,
});
