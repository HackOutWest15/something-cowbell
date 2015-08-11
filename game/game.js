
  var game = new Phaser.Game(640, 368, Phaser.AUTO, '', {
    preload: preload,
    create: create
  });

  var body, head, notes, explosions;
  var health = 100;
  var value = 0;
  var hitX;

  function preload () {

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    game.load.image('walken_body', 'resources/walken_body.png');
    game.load.image('walken_head', 'resources/walken_head.png');
    game.load.spritesheet('background', 'resources/bg_pirates_cheering_sprite.png', 640, 368, 4);
    game.load.spritesheet('kaboom', 'resources/explode.png', 128, 128);

  }

  function create () {

    game.physics.startSystem(Phaser.Physics.ARCADE);
    hitX = game.width / 2;

    //  Animated background for our game
    var background = game.add.sprite(0, 0, 'background');
    background.frame = 0;
    background.animations.add('bg_moving', [0, 1, 2, 3], 5, true);
    background.animations.play('bg_moving');

    var walken = game.add.group()

    body = game.add.sprite(0, 0, 'walken_body');
    head = game.add.sprite(330, 630, 'walken_head');
    head.anchor.setTo(0.5, 0.9);

    walken.add(body)
    walken.add(head)
    walken.scale.setTo(0.3, 0.3)

    walken.x = 380;
    walken.y = 80;

    // keep the spacebar from propogating up to the browser
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

    var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(moreCowbell);

    // Add hit bar
    game.add.graphics(0, 0)
      .lineStyle(3, 0x00ff00, 1)
      .moveTo(hitX, 0)
      .lineTo(hitX, game.height)

    // A note pool
    notes = game.add.group(); // Create a group
    notes.enableBody = true;  // Add physics to the group
    notes.createMultiple(10, 'walken_head'); // Create 10 pipes
    notes.forEach(function(note) {
      note.anchor.x = 0.5;
      note.anchor.y = 0.5;
    })

    // An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(function(explosion) {
      explosion.anchor.x = 0.5;
      explosion.anchor.y = 0.5;
      explosion.animations.add('kaboom');
    });

    addOneNote(0, 100);
  }

  function moreCowbell () {

    addOneNote();

    var closest = notes.children.slice().map(function(note) {
      note._hitDistance = Math.abs(hitX - note.x);
      return note;
    }).sort(function(a, b) {
      return a._hitDistance - b._hitDistance;
    })[0];

    if (closest._hitDistance < 10) {
      var explosion = explosions.getFirstExists(false);
      explosion.reset(closest.x, closest.y);
      explosion.play('kaboom', 30, false, true);
      closest.kill();
    } else {
      game.add.tween(head.scale)
        .to({
          x: head.scale.x + 0.05,
          y: head.scale.y + 0.05
        }, 200, Phaser.Easing.Back.Out, true);
    }
  }

  function addOneNote() {
    // Get the first dead note of our group
    var note = notes.getFirstDead();
    if (!note) return;

    // Set the new position of the note
    note.reset(0, 260);
    note.scale.setTo(0.1, 0.1)

    // Add velocity to the note to make it move left
    note.body.velocity.x = 100;

    // Kill the note when it's no longer visible
    note.checkWorldBounds = true;
    note.outOfBoundsKill = true;
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
