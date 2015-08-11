window.onload = function() {

  var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
    preload: preload,
    create: create
  });

  var bar, body, head;
  var health = 100;
  var value = 0;

  function preload () {

    game.load.image('walken_body', 'resources/walken_body.png');
    game.load.image('walken_head', 'resources/walken_head.png');

  }

  function create () {

    body = game.add.sprite(400, 400, 'walken_body');
    body.anchor.setTo(0.5, 0.5);
    body.scale.setTo(0.5, 0.5);

    head = game.add.sprite(288, 430, 'walken_head');
    head.anchor.setTo(0.5, 0.9);
    head.scale.setTo(0.5, 0.5);

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

    game.add.tween(head.scale)
      .to({
        x: head.scale.x + 0.05,
        y: head.scale.y + 0.05
      }, 200, Phaser.Easing.Back.Out, true);
  }

};
