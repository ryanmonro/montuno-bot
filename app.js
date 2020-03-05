var piano = loadPiano();

var major = [0, 0, 2, 4, 5, 7, 9, 11];
var dorian = [0, 0, 2, 3, 5, 7, 9, 10];
var aeolian = [0, 0, 2, 3, 5, 7, 8, 10];
var harmonicminor = [0, 0, 2, 3, 5, 7, 8, 11];

var pattern = [[1, 8], [3], [5], [1, 8], -1, [3, 5], -1, [1, 8], -1, [3, 5], -1, [1, 8], -1, [3, 5], -1, [1, 8]];

var key, progression;
var progressions = [[[0, major], [2, major]], [[0, dorian], [-2, dorian]], [[0, dorian], [5, major]]];

function randomise(){
  key = 54 + Math.floor(Math.random() * 12);// 60 "C4"
  progression = pickFrom(progressions);
  Tone.Transport.bpm.value = 80 + Math.floor(Math.random() * 50);
}
randomise();

function montunoNote(step){
  var bar = Math.floor(step / 8);
  if (step == 7 ) {
    bar++;
  }
  var progressionStep = progression[bar % progression.length]
  var progress = progressionStep[0];
  var scale = progressionStep[1];
  var thisInversion = inversion(key + progress, scale, key);

  var chord = pattern[step];
  var newChord = [];
  if (chord === -1) {
    newChord = -1;
  } else {
    for(note of chord){
      var newNote = Tone.Frequency(key + scale[note % scale.length] + progress, 'midi');
      newChord.push(newNote);
    }
  }

  console.log(inversion(key, scale, key));

  return newChord;  
}

function inversion(tonic, scale, targetNote){

}

var loop = new Tone.Sequence(function(time, step){
  var note = montunoNote(step);
  console.log(note)
  if (note !== -1) {
      piano.triggerAttackRelease(note, "16n", time);
  }
}, range(0, 15), "16n").start(0);

Tone.Transport.scheduleRepeat(function(time){
  Tone.Draw.schedule(function(){
    randomise();
  })
}, "4m", "4m");

document.querySelector("#start").onclick = function(e){
  Tone.Transport.start();
};

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
  "baseUrl" : "/salamander/"
}).toMaster();
}