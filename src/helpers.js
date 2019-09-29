import { SphereGeometry, MeshPhongMaterial, Mesh, DoubleSide } from 'three';
import { size, sideSize, padding } from './config';
import { RedPhong } from './materials';

export function getPosition(dimension) {
  return -size*(sideSize + padding)/2 + dimension*(sideSize + padding) + (sideSize + padding)/2;
}

export function addSphere(scene, position = [0,0,0]) {
  const object = new Mesh(new SphereGeometry( 1, 15, 15 ), RedPhong);
  object.position.set(...position);
  scene.add(object);
}
