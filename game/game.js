
  var game = new Phaser.Game(640, 368, Phaser.AUTO, '', {
    preload: preload,
    create: create
  });

  var bar, body, head;
  var health = 100;
  var value = 0;

  function preload () {

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    game.load.image('walken_body', 'resources/walken_body.png');
    game.load.image('walken_head', 'resources/walken_head.png');
    game.load.spritesheet('background', 'resources/bg_pirates_cheering_sprite.png', 640, 368, 4);

  }

  function create () {

    //  Animated background for our game
    var background = game.add.sprite(0, 0, 'background');
    background.frame = 0;
    background.animations.add('bg_moving', [0, 1, 2, 3], 5, true);
    background.animations.play('bg_moving');
    body = game.add.sprite(400, 400, 'walken_body');
    body.anchor.setTo(0.5, 0.5);
    body.scale.setTo(0.5, 0.5);

    head = game.add.sprite(288, 430, 'walken_head');
    head.anchor.setTo(0.5, 0.9);
    head.scale.setTo(0.5, 0.5);

    // keep the spacebar from propogating up to the browser
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

    var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(moreCowbell);

    bar = game.add.graphics(10, 10);
    bar.lineStyle(3, 0x00ff00, 1);
    bar.moveTo(0, 0);
    bar.lineTo(100, 0);
  }

  function moreCowbell () {
    health -= 10;
    bar.scale.x = health / 100;

    game.add.tween(head.scale)
      .to({
        x: head.scale.x + 0.05,
        y: head.scale.y + 0.05
      }, 200, Phaser.Easing.Back.Out, true);
  }


  // From http://www.keithmcmillen.com/blog/making-music-in-the-browser-web-midi-api/
  var midi, data;
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
      sysex: false
    }).then(onMIDISuccess, onMIDIFailure);
  } else {
    console.error("No MIDI support in your browser.");
  }

  // midi functions
  function onMIDISuccess(midiAccess) {
    // when we get a succesful response, run this code
    midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status

    var inputs = midi.inputs.values();
    // loop over all available inputs and listen for any MIDI input
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
      // each time there is a midi message call the onMIDIMessage function
      input.value.onmidimessage = onMIDIMessage;
    }
  }

  function onMIDIFailure(error) {
    // when we get a failed response, run this code
    console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + error);
  }

  function onMIDIMessage(message) {
    var isNoteOn = (message.data[0] & 0xf0) == 144;
    if (isNoteOn) {
      moreCowbell();
    }
  }
