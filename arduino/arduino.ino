struct drum {
  word total;
  byte pin;
  byte on_ctr;
  byte off_ctr;
  byte event;
};

#define THRESHOLD_VAL 2
#define THRESHOLD_ON 3
#define THRESHOLD_OFF 16
#define SCALE 1

#define EV_NONE 0
#define EV_NOTE_ON 1
#define EV_NOTE_OFF 2

struct event {
  byte type;
  byte value;
};

void readDrum(struct drum *d, struct event *e) {
  /* Clear event */
  e->type = 0;
  e->value = 0;
  byte val = analogRead(d->pin);
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
    e->value = min(127, SCALE * d->total / d->on_ctr);
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

void setup() {
  Serial.begin(9600);  // Initializing the serial port at 9600 baud
}

void loop() {
  int i = 0;
  drum *d = NULL;
  unsigned long t = millis();
  while (d = drums[i]) {
    event e;
    readDrum(d, &e);
    if (e.type == EV_NOTE_ON) {
      Serial.print("Note on for: ");
      Serial.print(d->pin);
      Serial.print(", value: ");
      Serial.println(e.value, DEC);
    } else if (e.type == EV_NOTE_OFF) {
      Serial.print("Note off for: ");
      Serial.println(d->pin);
    }
    ++i;
  }
  unsigned long diff = millis() - t;
  if (diff < 10) {
    delay(10 - diff);
  }
}
