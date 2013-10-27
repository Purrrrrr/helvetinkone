(function( $ ){

  $.fn.console = function() {

    var $this = $(this);
    function putNewline(text) {
      var line = $("<p class='line'></p>");
      line.append(text);
      $this.append(line);
      return line;
    };

    this.skip = function(t) {};
    this.faster = function(f) {};
    this.setQueueParallelDelay = function(t) {};
    this.setRunWhenComplete = function(t) {};
    this.addLine = function addLine(text) {
      putNewline(text);
    };
    this.wait = function(t) {
      this.addLine("...");
    }
    
    var queue = this.queue = function queue(func) {
      func();
    };

    return this;

  };

})( jQuery );


