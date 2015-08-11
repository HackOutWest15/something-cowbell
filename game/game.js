window.onload = function() {

  var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
    preload: preload,
    create: create
  });

  var bar;
  var health = 100;

  function preload () {

    game.load.image('logo', 'phaser.png');

  }

  function create () {

    var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
    logo.anchor.setTo(0.5, 0.5);

    // keep the spacebar from propogating up to the browser
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

    var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(onSpaceDown);

    bar = game.add.graphics(10, 10);
    bar.lineStyle(3, 0x00ff00, 1);
    bar.moveTo(0, 0);
    bar.lineTo(100, 0);
  }

  function onSpaceDown () {
    health -= 10;
    bar.scale.x = health / 100;
  }

};
