$(function() {
  $('#logoscreen .titletext').fitText(0.9);

  var init_c = $("#logoscreen .console").console();
  var c = $("#mainconsole").console(100);
  
  init_c.addLine("Please wait..."); 
  init_c.addLine("Urstrix initializing..."); 
  init_c.queue(function() {
    $('#logoscreen').fadeOut(function() {
      c.playNoise();

      c.addLine("Connecting to ffff:K311481:54MP0:1...");
      c.wait(5500);
      c.addLine("SUCCESS");
      c.addLine("Käynnistetään härveliä");
      c.wait(1000);
      for(var i = 0;i < 10;i++) {
        c.addLine(c.testString); 
      }
    });
  });
});
