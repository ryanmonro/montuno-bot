var PERC = {
  HIGH: "C3", 
  LOW: "D3"
};
var CROWD = "E3";
var DRUM = {
  KICK: "C4",
  SNARE: "D4",
  HIGH: "E4",
  LOW: "F4",
  CRASH: "G4"
};
var reverb = new Tone.Reverb().toMaster();
reverb.generate(1.7);
var piano = loadPiano();
var drums = loadDrums();
drums.connect(reverb)
var bass = loadBass();

var percussionPhrases = [
  // timbale solo from Se a Cabo split into two-beat phrases
  "20022010",
  "22010000",
  "00020202",
  "10101100",
  "00022011",
  "10222011",
  // some others
  "22210111",
  "22210110",
  "20002210",
  "20102010",
  "02020210",
  "00200010",
  "10102010"
];

// scales in one octave, distance from tonic
var scales = {
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  harmonicminor: [0, 2, 3, 5, 7, 8, 11]
}

// indices of the scale for a chord
var triad = [0, 2, 4];

// the index of the chord we play on each step of the bar(s)
// add one to everything to make an inversion
var chordPattern = [[0,3], [1], [2], [0,3], -1, [1, 2], -1, [0,3], -1, [1, 2], -1, [0,3], -1, [1, 2], -1, [0,3]];

var clavePattern = [0,0,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0];

var key, progression, percussionPhrase, bar = 0;
var progressions = [[[0, scales.major], [2, scales.major]], [[0, scales.dorian], [-2, scales.dorian]], [[0, scales.dorian], [5, scales.major]]];

function randomise(){
  key = 54 + Math.floor(Math.random() * 12);// 60 "C4"
  progression = pickFrom(progressions);
  Tone.Transport.bpm.value = 80 + Math.floor(Math.random() * 50);
}
randomise();

function buildChord(notes, key, chord, scale, inversion, targetNote){
  var output = [];
  // targetNote should do something.
  for(note of notes){
    output.push(key + scaleNote(scale, chordNote(chord, note + inversion)));
  }
  return output;
}

function chordNote(chord, note){
  var newNote = note % chord.length;
  var octave = Math.floor(note / chord.length);
  return chord[newNote] + octave * 7;
}

function scaleNote(scale, note){
  var octave = Math.floor(note / 7);
  var newNote = note % 7;
  return scale[newNote] + octave * 12;
}


function montunoNotes(step){
  var progressionBar = Math.floor(step / 8);
  // anticipate the chord in the next progressionBar
  if (step == 7 ) {
    progressionBar++;
  }
  var progressionStep = progression[progressionBar % progression.length]
  var root = progressionStep[0];
  var scale = progressionStep[1];

  var scaleDegrees = chordPattern[step];
  var newChord = [];
  if (scaleDegrees === -1) {
    newChord = -1;
  } else {
    var chord = buildChord([0,1,2,3], key + root, triad, scale, 0, key)
    for(note of scaleDegrees){
      var newNote = Tone.Frequency(chord[note], 'midi'); 
      newChord.push(newNote);
    }
  }
  return newChord;  
}

function bassNote(step, shift=0){
  var progressionBar = Math.floor(step / 8);
  // anticipate the chord in the next progressionBar
  if (step == 7 ) {
    progressionBar++;
  }
  var progressionStep = progression[progressionBar % progression.length]
  var root = progressionStep[0];
  return [Tone.Frequency(key + root - 12 + shift, 'midi')]; 
}

var loop = new Tone.Sequence(function(time, step){
  if (step == 0 && bar % 4 == 0) {
    drums.triggerAttackRelease([CROWD], "4m", time);
    bass.triggerAttackRelease(bassNote(step), "4m", time);
    drums.triggerAttackRelease([DRUM.KICK, DRUM.SNARE, DRUM.CRASH], "2n", time);
  }
  // randomise percussion phrase every two beats
  if (step % 8 == 0) {
    percussionPhrase = pickFrom(percussionPhrases).split("");
  }
  var notes = montunoNotes(step);
  if (notes !== -1) {
    piano.triggerAttackRelease(notes, "16n", time);
  } 
  if (bar > 1) {
    var percNote = percussionPhrase[step % 8]
      if (percNote == 2) {
        drums.triggerAttackRelease([DRUM.SNARE, PERC.HIGH], "4n", time);
      } else if (percNote == 1) {
        drums.triggerAttackRelease([DRUM.KICK, PERC.LOW], "4n", time);
      if ( percNote != 0 && bar == 3 && step > 7) {
        bass.triggerAttackRelease(bassNote(step), "4n", time);
      }
    }
  }
  if (step == 15 ) {
    bar++;
    if (bar == 4) {
      bar = 0;
      randomise();
    }
  }
}, range(0, 15), "16n").start(0);


document.querySelector("#start").onclick = function(e){
  if (Tone.Transport.state === "stopped") {
    Tone.Transport.start();
  } else {
    Tone.Transport.stop();
  }
};


// Utility functions

function pickFrom(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}

function range(from, to){
  var output = [];
  for(var i = from; i <= to; i++){
    output.push(i);
  }
  return output;
}

// Sample loading functions

function loadPiano(){
  return new Tone.Sampler({
    "A0" : "A0.[mp3|ogg]",
    "C1" : "C1.[mp3|ogg]",
    "D#1" : "Ds1.[mp3|ogg]",
    "F#1" : "Fs1.[mp3|ogg]",
    "A1" : "A1.[mp3|ogg]",
    "C2" : "C2.[mp3|ogg]",
    "D#2" : "Ds2.[mp3|ogg]",
    "F#2" : "Fs2.[mp3|ogg]",
    "A2" : "A2.[mp3|ogg]",
    "C3" : "C3.[mp3|ogg]",
    "D#3" : "Ds3.[mp3|ogg]",
    "F#3" : "Fs3.[mp3|ogg]",
    "A3" : "A3.[mp3|ogg]",
    "C4" : "C4.[mp3|ogg]",
    "D#4" : "Ds4.[mp3|ogg]",
    "F#4" : "Fs4.[mp3|ogg]",
    "A4" : "A4.[mp3|ogg]",
    "C5" : "C5.[mp3|ogg]",
    "D#5" : "Ds5.[mp3|ogg]",
    "F#5" : "Fs5.[mp3|ogg]",
    "A5" : "A5.[mp3|ogg]",
    "C6" : "C6.[mp3|ogg]",
    "D#6" : "Ds6.[mp3|ogg]",
    "F#6" : "Fs6.[mp3|ogg]",
    "A6" : "A6.[mp3|ogg]",
    "C7" : "C7.[mp3|ogg]",
    "D#7" : "Ds7.[mp3|ogg]",
    "F#7" : "Fs7.[mp3|ogg]",
    "A7" : "A7.[mp3|ogg]",
    "C8" : "C8.[mp3|ogg]"
  }, {
    "release" : 0.5,
    "baseUrl" : "samples/salamander/"
  }).toMaster();
}

// Thank you Hyperreal
// http://machines.hyperreal.org/manufacturers/Roland/MT-32/samples/

function loadDrums(){
  return new Tone.Sampler({
    [PERC.HIGH]: "MTTimbaleHi.wav",
    [PERC.LOW]: "MTTimbaleLow.wav",
    [DRUM.KICK]: "MTKickDrum.wav",
    [DRUM.SNARE]: "MTSnareAcou.wav",
    [DRUM.HIGH]: "MTTomHigh.wav",
    [DRUM.LOW]: "MTTomMid.wav",
    [DRUM.CRASH]: "MTCrashCymbl.wav",
    [CROWD]: "../crowd.mp3"
  }, {
    // "release" : 1,
    "baseUrl": "samples/drums/"
  }).toMaster();
}

function loadBass(){
  return new Tone.Sampler({
    "A2": "bass_a2.mp3"
  }, {
    "baseUrl": "samples/"
  }).toMaster();
}