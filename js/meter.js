(function( $ ){

  $.fn.meter = function(scale, factor1, factor2) {
    
    var m = $(this);
    m.find(".title").fitText(factor1, {useHeight: true});
    var c = m.find('.value').console(factor2, 1, {useHeight: true});
    var bar = $('<div class="bar"></div>');
    m.append(bar);

    this.update = function(v) {
      if (c.text() == v) return;
      c.empty();
      c.addLine(v);
      //console.log(scale);

      var totalWidth = m.width()*0.9; 
      var newWidth = 0;
      var scaleMin = scale > 1 ? Math.pow(10, scale-1) : 0;
      var scaleMax = Math.pow(10, scale);
      var scaleChanged = false;
      function updateScale(i) {
        scaleChanged = true;
        scale += i;
        scaleMin = scale > 1 ? Math.pow(10, scale-1) : 0;
        scaleMax = Math.pow(10, scale);
      }

      do {
        if (v < scaleMin * 0.5) {
          updateScale(-1);

          newWidth = totalWidth/10;
          //console.log("minned: "+newWidth);
          bar.animate({width: newWidth}, 500, "easeInExpo", function() {
            bar.width(totalWidth); 
          });
        } else if ( v > scaleMax * 1.1) {
          updateScale(1);

          newWidth = totalWidth;
          //console.log("maxed: "+newWidth);
          bar.animate({width: newWidth}, 500, "easeInExpo", function() {
            bar.width(totalWidth/10); 
          });
        } else {
          newWidth = Math.ceil(totalWidth * v / scaleMax);
          //console.log("v: "+newWidth);
          bar.animate({width: newWidth}, 800, scaleChanged ? "easeOutBounce" : "swing");
          break;
        }
        //console.log("Scale: "+scale+" "+scaleMin+"-"+scaleMax);
      } while (true);
    };
    
    return this;
  };

})(jQuery);
