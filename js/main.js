$(function() {
  $('#logoscreen .titletext').fitText(0.9);

  var init_c = $("#logoscreen .console").console();
  var c = $("#mainconsole").console(100);
  var skip = parseInt(getURLParameter("skip"), 10) || 0;

  init_c.skip(skip > 0);
  init_c.addLine("Please wait..."); 
  init_c.addLine("Urstrix initializing..."); 
  init_c.wait(1500); 

  init_c.skip(false);
  init_c.queue(function() {
    $('#logoscreen').fadeOut(function() {
      c.playNoise();

      c.skip(skip > 1);
      c.addLine("Connecting to ffff:K311481:54MP0:1...");
      c.wait(5500);
      c.addLine("SUCCESS");
      c.addLine("Käynnistetään härveliä");
      c.wait(1000);


      c.skip(skip > 2);
      for(var i = 0;i < strings.alkusae.length;i++) {
        c.addLine(strings.alkusae[i]); 
      }

      c.skip(skip > 3);
      c.faster();
      c.setQueueParallelDelay(80);
      for(var i = 0;i < strings.technobabble.length;i++) {
        c.addLine(strings.technobabble[i]); 
      }
      c.setQueueParallelDelay(false);
      c.queue(function() {
        $('#mainconsole').fadeOut(function() {
        });
      });
    });
  });
});
