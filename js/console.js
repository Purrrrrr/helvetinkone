(function( $ ){

  $.fn.console = function(width) {

    // Setup options
    var w = width || 60;
    var effectOptions = {
      fps: 20,
      repeat: 5,
    };

    var $this = $(this);
    function putNewline(text) {
      var line = $("<p></p>");
      line.append(text);
      $this.append(line);
      return line;
    };

    this.testString = getTestString(w);
    this.fitText(w/23);
    this.playNoise = playNoise;
    this.addLine = function addLine(text) {
      queue(function(next) {      
        putNewline(text).textEffect(effectOptions, next);
      });
    };
    this.wait = function(t) {
      var frameLen = 500;

      queue(function(next) {
        var text = "."
        var l = putNewline(text);
        (function nextText() {
          if (t <= 0) {
            next();
            return;
          }
          text+= ".";
          l.html(text);

          setTimeout(function() {
            t -= frameLen;
            nextText()
          }, Math.min(t, frameLen));
        })();
      });
    }
    
    /* Vars for the queue */
    var tasks = [];
    var running = false;
    /* Take an animator function with an end callback and execute it or put it into a queue */
    var queue = this.queue = function queue(func) {
      if (running) {
        tasks.push(func);
        return;
      }
      running = true;
      func(function runNext() { 
        if (tasks.length > 0) {
          var next = tasks.shift();
          next(runNext);
        } else {
          running = false;
        }
      });
    };

    return this;

  };

  function getTestString(w) {
    var chars = "1234567890abcdef";
    var i = 0;
    var str = '';
    while(w > 10) {
      str += chars[i%chars.length].repeat(10);
      i++;
      w -= 10;
    }
    str += chars[i%chars.length].repeat(w);
    return str;
  }

  function playNoise() {
    audioElement.play();
  }

  var audioElement = document.createElement('audio');
  audioElement.setAttribute('src', 'dial_up.ogg');

})( jQuery );


