$(function() {
  $('#logoscreen .titletext').fitText(0.9);

  var init_c = $("#logoscreen .console").console();
  var skip = parseInt(getURLParameter("skip"), 10) || 0;

  init_c.skip(skip > 0);
  init_c.addLine("Please wait..."); 
  init_c.addLine("Urstrix initializing..."); 
  init_c.wait(3500); 

  init_c.skip(false);
  init_c.queue(function() {
    $('#logoscreen').fadeOut(connectionScreen);
  });

  // Connection screen phase
  var c = $("#mainconsole").console(100);
  var noise = audio('dial_up.ogg');
  function connectionScreen() {
    noise.play();

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
    c.addLine("Ladataan kirjastoja..."); 
    c.wait(3000);
    c.skip(false);
    c.queue(function(cont) {
      $('#connectionscreen').fadeOut(1000,function() {
        noise.pause();
        sampoScreen();
        cont();
      });
    });
  };

  var bach = audio('floppybach.ogg');
  //sox -n fail.ogg synth 60 sin 667 bend 0,-1520,4
  var fail = audio('fail.ogg');
  //sox -n tone.ogg synth 180 square 20+550  gain -20 bass 1 fade 0.5 180 0.5
  var tone = audio('tone.ogg');
  tone.volume = 0.8;
  var sampo_c = $("#sampoconsole").console(40, 10);
  var rand_c = $("#rand").console(6, 15);
  var rand_c2 = $("#rand2").console(6, 15);
  rand_c.faster(25);
  rand_c2.faster(25);
  var sampo = new Sampo(sampo_c);

  function sampoScreen() {
    bach.currentTime=18;
    bach.play();
    tone.play();
    sampo.failFun = sampoShutDown;
    sampo_c.skip(skip > 4);

    //Laitetaan numerohärpäke päälle
    var randchars = "ABCDEF";
    for (var i = 1000; i > 0; i--) {
      var n = Math.floor(100000 + Math.random()*900000);
      rand_c.addLine(""+ n);
      var s = "";
      for (var ii = 0; ii < 6; ii++) {
        s += randchars[Math.floor(Math.random()*6)];
      }
      rand_c2.addLine(""+ s);
    }
    
    var codes = typeof(localStorage.sampoCodes) == 'string' ? localStorage.sampoCodes.split(",") : [2, 9, 1, 3, 5, 6];
    sampo.run(codes, skip, sampoShutDown);
  }

  function sampoShutDown() {
    sampo.print("Käyttöteho: "+sampo.vars.powah);
    sampo_c.wait(1000);
    sampo.print("Käynnistetään automaattinen alasajo...");
    sampo_c.queue(function(cont) { 
      tone.fadeTo(0, 0.10, 80);
      fail.play();
      var t = 23;
      setInterval(function() { bach.currentTime = t; }, 50);
      setTimeout(function() { 
        bach.fadeTo(0, 0.05, 80);
        fail.fadeTo(0, 0.05, 80);
      }, 8000);
      cont();
    });
    sampo_c.wait(1500);
    for(var m = sampo.machines.length-1; m >= 0; m--) {
      sampo.print("Sammutetaan: "+sampo.machines[m].name+"...");
      sampo_c.wait(300);
    }
    sampo.print("Katkaistaan yhteyksiä");
    sampo_c.queue(function() { 
      bach.fadeTo(0, 0.10, 80);
      $('#samposcreen').fadeOut(5000, function() {
        $('#connectionscreen').show();
        c.addLine("Connection lost...");
        c.addLine("The remote system reported a power rating of "+sampo.vars.powah+" terawatts.");
      });
    });
  }
});
