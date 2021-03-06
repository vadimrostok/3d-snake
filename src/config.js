export const padding = 0.3;

// fixme:
export const size = 8;
export const sideSize = 1;

export const boardSize = 8;
export const cubeSize = 1; // snake cubes
export const cubePointKoef = 0.33;
export const cubePointDefaultOpacity = 0.1;
export const cubePointNearLevel = 2;

export const TYPE_EMPTY = 0;
export const TYPE_BODY = 1;
export const TYPE_HEAD = 2;
export const TYPE_FOOD = 3;

export const DIRECTION_zUP = 1;
export const DIRECTION_zDOWN = 2;
export const DIRECTION_xUP = 3;
export const DIRECTION_xDOWN = 4;
export const DIRECTION_yUP = 5;
export const DIRECTION_yDOWN = 6;

export const boardHeight = boardSize*cubeSize + boardSize*cubeSize*padding;

export const bigGuideLength = boardHeight;
export const bigGuideWidth = cubeSize/10;
export const bigGuideConeWidth = cubeSize/2;
export const bigGuideConeHeight = cubeSize/2;

export const smallGuideLength = cubeSize*3;
export const smallGuideWidth = cubeSize/3;
export const smallGuideConeWidth = cubeSize;
export const smallGuideConeHeight = cubeSize/2;
