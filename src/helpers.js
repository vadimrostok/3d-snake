import { SphereGeometry, MeshPhongMaterial, Mesh, DoubleSide } from 'three';
import { size, sideSize, padding } from './config';
import { RedPhong } from './materials';

export function getPosition(dimension) {
  return -size*(sideSize + padding)/2 + dimension*(sideSize + padding) + (sideSize + padding)/2;
}

export function boardPositionToCoordinates([a, b, c]) {
  return [getPosition(a), getPosition(b), getPosition(c)];
}

export function addSphere(scene, position = [0, 0, 0]) {
  const object = new Mesh(new SphereGeometry( 1, 15, 15 ), RedPhong);
  object.position.set(...position);
  scene.add(object);
}

export function checkBoundariesHit(x, y, z) {
  return x < 0 || x >= size || y < 0 || y >= size || z < 0 || z >= size;
}