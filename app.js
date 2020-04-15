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

var lastBarPercussionPhrases = [
  "22020220",
  "10101020",
  "00011020",
  "20011020"
]

// scales in one octave, distance from tonic
var scales = {
  major: [0, 2, 4, 5, 7, 9, 11],
  dom7: [0, 2, 4, 5, 7, 9, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10]
}

var scaleNames = {
  major: "△7",
  dom7: "7",
  dorian: "m7",
  aeolian: "m7",
  locrian: "m7b5"
}

// indices of the scale for a chord
var triad = [0, 2, 4];

// the index of the chord we play on each step of the bar(s)
// add one to everything to make an inversion
var chordPattern = [[0,3], [1], [2], [0,3], -1, [1, 2], -1, [0,3], -1, [1, 2], -1, [0,3], -1, [1, 2], -1, [0,3]];
var variationChordPattern = [[0,3], [1], [2], [0,3], -1, [1, 2], -1, [0,3], -1, [1, 2], -1, [0,3], [0,3], -1, [1, 2], -1];

var key, progression, percussionPhrase, bar = 0;
var progressions = [
  [[0, "dorian"], [2, "locrian"], [7, "dom7"], [0, "dorian"]], // i ii V i 
  [[0, "dorian"], [5, "dorian"], [7, "dom7"], [0, "dorian"]], // mambo con dancehall
  [[0, "dorian"], [3, "major"], [8, "major"], [7, "dom7"]], // feline
  [[0, "aeolian"], [-2, "major"], [-4, "major"], [-5, "dom7"]], // descending
  [[2, "dorian"], [7, "dom7"], [0, "dom7"], [5, "major"]], // rhythm
  [[1, "dorian"], [6, "dom7"], [1, "dorian"], [6, "dom7"] ,[0, "dorian"], [5, "dom7"], [0, "dorian"], [5, "dom7"]], // sol y
  [[0, "dorian"], [5, "dom7"], [-2, "dorian"], [3, "dom7"]], // beanni
  [[0, "aeolian"],[5, "dorian"],[2, "locrian"],[7, "dom7"]], // minor 1 4 2 5
  [[0, "aeolian"],[8, "major"],[2, "locrian"],[7, "dom7"]], // minor 1 b6 2 5
];

function randomise(){
  bar = 0;
  key = nextKey;
  progression = nextProgression;
  display();
  Tone.Transport.bpm.value = 80 + Math.floor(Math.random() * 40);
}

function randomiseNext(){
  nextProgression = pickFrom(progressions);
  nextKey = 54 + Math.floor(Math.random() * 12);
}

randomiseNext();

function display(){
  document.querySelector('#nextChords').textContent = "";
  document.querySelector('#chords').textContent = progressionString(progression, key);
  document.querySelector('#tempo').textContent = Math.round(Tone.Transport.bpm.value) + " bpm";
}

function displayNext(){
  randomiseNext()
  document.querySelector('#nextChords').textContent = progressionString(nextProgression, nextKey);
}

function progressionString(prog, key){
  var output = "";
  for(var i in prog){
    var step = prog[i];
    if (i % 2 == 0) {
      output += "| ";
    }
    var root = new Tone.Frequency(key + step[0], 'midi').toNote();
    root = root.substring(0, root.length - 1);
    if (root.length == 2) {
      root = new Tone.Frequency(key + step[0] + 1, 'midi').toNote()[0] + "b";
    }
    output += root + scaleNames[step[1]] + " ";
  }
  output += "|";
  return output;
}

function buildChord(notes, key, chord, scale, targetNote){
  var output = [];
  // find root note of chord below targetNote
  var root = key;
  while(root > targetNote){
    root -= 12;
  }
  // find inversion with first note closest to targetNote
  var inversion = 0;
  var lowestDistance = Math.abs(root - targetNote);
  for(var i = 1; i < 4; i++){
    var thisNote = root + scaleNote(scale, chordNote(chord, i));
    var distance = Math.abs(thisNote - targetNote);
    if (distance < lowestDistance) {
      lowestDistance = distance;
      inversion = i;
    }
  }
  // get notes of this inversion
  for(note of notes){
    var thisNote = root + scaleNote(scale, chordNote(chord, note + inversion));
    output.push(thisNote);
  }
  // debugging inversions:
  // console.log(output.map(function(n){return n - targetNote}), output, targetNote, inversion);
  return output;
}

function keyScaleChordNote(note, key, chord, scale){
  return 0;
}

function chordNote(chord, note){
  var newNote = note % chord.length;
  var octave = Math.floor(note / chord.length);
  var result = chord[newNote] + octave * 7
  return result;
}

function scaleNote(scale, note){
  var octave = Math.floor(note / 7);
  var newNote = note % 7;
  var result = scale[newNote] + octave * 12;
  return result;
}


function montunoNotes(step){
  var progressionBar = (bar * 2 + Math.floor(step / 8)) % progression.length;
  // anticipate the chord in the next progressionBar
  if (step == 7 ) {
    progressionBar++;
  }
  var progressionStep = progression[progressionBar % progression.length];
  var root = progressionStep[0];
  var scaleName = progressionStep[1];
  var scale = scales[scaleName];

  // if it's a V at the end of the progression resolving to a I there's a 10% chance we'll do a tritone substitution
  var tritoneSub = Math.random() > 0.1;
  if (tritoneSub && root == 7 && scaleName === "dom7" && progression[0][0] == 0 && step > 10 && bar == progression.length / 2 - 1) {
    console.log("Achievement unlocked: tritone substitution")
    root -= 6;
  }

  var scaleDegrees = chordPattern[step];
  var newChord = [];
  if (scaleDegrees === -1) {
    newChord = -1;
  } else {
    var chord = buildChord([0,1,2,3], key + root, triad, scale, key)
    for(note of scaleDegrees){
      var newNote = Tone.Frequency(chord[note], 'midi'); 
      newChord.push(newNote);
    }
  }
  return newChord;  
}

function bassNote(step, shift=0){
  var progressionBar = (bar * 2 + Math.floor(step / 8)) % progression.length;
  var progressionStep = progression[progressionBar % progression.length];
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
    // make sure we end on a 'last bar' phrase
    if (bar == 3) {
      percussionPhrase = pickFrom(lastBarPercussionPhrases).split("");
    }
    else {
      percussionPhrase = pickFrom(percussionPhrases).split("");
    }
  }
  var notes = montunoNotes(step);
  // get all chromatic on step five if we can
  if (step == 5) {
    var step3 = montunoNotes(3)[0].toMidi();
    var step7 = montunoNotes(7)[0].toMidi()
    if (Math.abs(step3 - step7) == 2) {
      notes = [
        new Tone.Frequency(step3 - ((step3 - step7) / 2), 'midi'),
        new Tone.Frequency(12 + step3 - ((step3 - step7) / 2), 'midi')
      ];
    }
  }
  if (notes !== -1) {
    piano.triggerAttackRelease(notes, "16n", time);
  } 
  if (bar > 1) {
    var percNote = percussionPhrase[step % 8]
    if (percNote == 2) {
      drums.triggerAttackRelease([DRUM.SNARE, PERC.HIGH], "4n", time);
    } else if (percNote == 1) {
      drums.triggerAttackRelease([DRUM.KICK, PERC.LOW], "4n", time);
    }
    if ( percNote != 0 && bar == 3 && step > 7) {
      bass.triggerAttackRelease(bassNote(step), "4n", time);
    }
  }
  if (bar == 3 && step == 0) {
    displayNext();
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
    randomiseNext();
    randomise();
    document.querySelector('#start').textContent = "Stop";
    document.querySelector('.chart').style.display = "block"
    Tone.Transport.start();
  } else {
    Tone.Transport.stop();
    document.querySelector('#start').textContent = "Start";
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
    // "A0" : "A0.[mp3|ogg]",
    // "C1" : "C1.[mp3|ogg]",
    // "D#1" : "Ds1.[mp3|ogg]",
    // "F#1" : "Fs1.[mp3|ogg]",
    // "A1" : "A1.[mp3|ogg]",
    // "C2" : "C2.[mp3|ogg]",
    // "D#2" : "Ds2.[mp3|ogg]",
    // "F#2" : "Fs2.[mp3|ogg]",
    // "A2" : "A2.[mp3|ogg]",
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
    // "C7" : "C7.[mp3|ogg]",
    // "D#7" : "Ds7.[mp3|ogg]",
    // "F#7" : "Fs7.[mp3|ogg]",
    // "A7" : "A7.[mp3|ogg]",
    // "C8" : "C8.[mp3|ogg]"
  }, {
    "release" : 0.5,
    "baseUrl" : "samples/salamander/"
  }).toMaster();
}


function loadDrums(){
  return new Tone.Sampler({
    // http://machines.hyperreal.org/manufacturers/Roland/MT-32/samples/
    [PERC.HIGH]: "MTTimbaleHi.wav.m4a",
    [PERC.LOW]: "MTTimbaleLow.wav.m4a",
    [DRUM.KICK]: "MTKickDrum.wav.m4a",
    [DRUM.SNARE]: "MTSnareAcou.wav.m4a",
    [DRUM.HIGH]: "MTTomHigh.wav.m4a",
    [DRUM.LOW]: "MTTomMid.wav.m4a",
    [DRUM.CRASH]: "MTCrashCymbl.wav.m4a",
    [CROWD]: "../crowd.mp3"
  }, {
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

Tone.Buffer.on('load', function(){
  document.querySelector("#start").disabled = false;
  document.querySelector("#start").textContent = "Start";
})