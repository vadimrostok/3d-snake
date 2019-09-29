import Game from './game.js';

const game = new Game();

const animate = function() {
  window.requestAnimationFrame(animate);
  game.onFrame();
};

animate();

if (module.onReload) {
  module.onReload(() => {
    window.location.reload();
  });
}
