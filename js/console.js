(function( $ ){

  $.fn.console = function(width) {

    // Setup options
    var w = width || 60;
    var effectOptions = {
      fps: 20,
      repeat: 5,
    };
    var skip = false;
    var queueRunPallalelDelay = false;
    this.fitText(w/23);

    var $this = $(this);
    function putNewline(text) {
      var line = $("<p class='line'></p>");
      line.append(text);
      $this.append(line);
      return line;
    };

    //this.randomString = function(l) { l = l || w; return getRandomString(l);}
    //this.testString = getTestString(w);

    this.skip = function(t) { skip = t; };
    this.faster = function() {
      queue(function(n) { 
        effectOptions.fps = 10;
        effectOptions.repeat = 1;
        n();
      });
    };
    this.setQueueParallelDelay = function(t) {
      queueRunPallalelDelay = t;
    };
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
      if (skip) return;
      if (running) {
        if (queueRunPallalelDelay !== false) {
          var d = queueRunPallalelDelay;
          tasks.push(function(next) {
            var nextHasRan = false;
            function cont() {
              if (!nextHasRan) next();
              nextHasRan = true;
            }

            func(cont);
            setTimeout(cont, d);
          });
        } else {
          tasks.push(func);
        }
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

  function getRandomString(w) {
    console.log(w);
    var possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+-=[];;0123456789";
    var str = '';
    var getRandomChar = function() {
      return possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
    };
    while (w>0) {
      str+=getRandomChar();
      w--;
    }
    console.log(str);
    console.log(str.length);
    return str;
  }

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


