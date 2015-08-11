struct drum {
  word total;
  byte pin;
  byte on_ctr;
  byte off_ctr;
  byte event;
};

#define THRESHOLD_VAL 20
#define THRESHOLD_ON 1
#define THRESHOLD_OFF 4
#define SCALE 1

#define EV_NONE 0
#define EV_NOTE_ON 1
#define EV_NOTE_OFF 2

struct event {
  byte type;
  byte value;
};

boolean midi = true;

void readDrum(struct drum *d, struct event *e) {
  /* Clear event */
  e->type = 0;
  e->value = 0;
  byte val = analogRead(d->pin);
  if (!midi && val > 0) {
    Serial.println(val);
  }
  /* if (d->event == EV_NOTE_ON) { */
  /*   Serial.print(val); */
  /*   Serial.print(" "); */
  /*   Serial.print(d->total); */
  /*   Serial.print(" "); */
  /*   Serial.println(d->num); */
  /* } */

  /* Some debouncing */
  if (val < THRESHOLD_VAL) {
    if (d->event == EV_NOTE_ON) {
      ++d->off_ctr;
    } else {
      if (d->on_ctr > 0) {
        --d->on_ctr;
      }
    }
  } else {
    if (d->event != EV_NOTE_ON) {
      ++d->on_ctr;
    } else {
      d->off_ctr = 0;
    }
  }

  if (d->on_ctr > 0) {
    d->total += val;
  }

  /* Check for note on */
  if (d->on_ctr >= THRESHOLD_ON && d->event == EV_NONE) {
    e->type = EV_NOTE_ON;
    byte ev_val = (SCALE * d->total);
    e->value = min(127, ev_val);
    d->event = EV_NOTE_ON;
  }

  /* Check for note off */
  if (d->off_ctr >= THRESHOLD_OFF && d->event == EV_NOTE_ON) {
    e->type = EV_NOTE_OFF;
    e->value = 0;
    d->total = 0;
    d->on_ctr = 0;
    d->off_ctr = 0;
    d->event = EV_NONE;
  }
}

drum d1 = {0, 0, 0, 0, 0};
drum* drums[] = {
  &d1,
  NULL
};

#define MIDI_NOTE_ON 0x90
#define MIDI_NOTE_OFF 0x80
#define MIDI_CC 0xB0
#define MIDI_C3 60

void sendMidi(byte event, byte note, byte velocity) {
  Serial.write(event);
  Serial.write(note);
  Serial.write(velocity);
}

void setup() {
  if (midi) {
    Serial.begin(31250);
  } else {
    Serial.begin(9600);
  }
}

void loop() {
  int i = 0;
  drum *d = NULL;
  unsigned long t = millis();
  while (d = drums[i]) {
    event e;
    readDrum(d, &e);
    if (e.type == EV_NOTE_ON) {
      if (midi) {
        sendMidi(MIDI_NOTE_ON, MIDI_C3 + i, e.value);
      } else {
        Serial.print("Note on: ");
        Serial.println(e.value);
      }
    } else if (e.type == EV_NOTE_OFF) {
      if (midi) {
        sendMidi(MIDI_NOTE_OFF, MIDI_C3 + i, 0);
      } else {
        Serial.println("Note off.");
      }
    }
    ++i;
  }
  unsigned long diff = millis() - t;
  if (diff < 10) {
    delay(10 - diff);
  }
}
