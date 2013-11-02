(function( $ ){

  $.fn.console = function() {

    var $this = $(this);
    function putNewline(text) {
      var line = $("<p class='line'></p>");
      line.append(text);
      $this.append(line);
      return line;
    };
    function putText(text) {
      var line = $("<span></span>");
      line.append(text);
      $this.find(".line:last").append(line);
      return line;
    }

    this.skip = function(t) {};
    this.faster = function(f) {};
    this.setQueueParallelDelay = function(t) {};
    this.setRunWhenComplete = function(t) {};
    this.addLine = function addLine(text) {
      putNewline(text);
    };
    this.addText = function addText(text) {
      putText(text);
    };
    this.wait = function(t) {
      this.addLine("...");
    }
    
    var queue = this.queue = function queue(func) {
      func(function() {});
    };

    return this;

  };

})( jQuery );


