function audio(src) {
  var audioElement = document.createElement('audio');
  audioElement.setAttribute('src', src);
  audioElement.fadeTo = function(vol, step, time) {
    var down = audioElement.volume > vol;

    function f() {
      if (down) {
        audioElement.volume = Math.max(vol, audioElement.volume - step);
      } else {
        audioElement.volume = Math.min(vol, audioElement.volume + step);
      }
      if (audioElement.volume != vol) {
        setTimeout(f, time);
      } else if (vol == 0) {
        audioElement.pause();
      }
    }
    setTimeout(f, time);
  }
  return audioElement;
}

