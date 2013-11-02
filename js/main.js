function uniq(c) {
  c = c.slice(0);
  var p;
  while(p = c.pop()) {
    for(var i = 0; i < c.length; i++) {
      if (c[i] == p) return false;
    }
  }
  return true;
}

$(function() {
  $('#logoscreen .titletext').fitText(0.9);

  var init_c = $("#logoscreen .console").console();
  var skip = parseInt(getURLParameter("skip"), 10) || 0;
  var codes = (getURLParameter("code") ? getURLParameter("code").split(",") : false) || [];

  init_c.skip(skip > 0);
  init_c.addLine("Please wait..."); 
  init_c.addLine("Urstrix initializing..."); 
  init_c.wait(1500); 

  init_c.skip(false);

  function query_number(next) {
    codes = [];
    var listening = true;

    document.addEventListener("keyup", function(event) {
      if (!listening) return;
      switch(event.which) {
        case 13: //Enter
        listening = false;
        if (codes.length != 6 || !uniq(codes)) {
          if (!uniq(codes)) {
            init_c.addLine("Code has repeated command codes!");
          }
          init_c.addLine("Please input a valid command code:"); 
          query_number(next);
        } else {
          console.log(codes);
          init_c.addLine("Code accepted!"); 
          next(codes);
        }
        break;
        case 8: //Backspace
        if (codes.length > 0) {
          $("#logoscreen .console .line:last span:last").remove();
          codes.pop();
        }
        break;
        default:
          var c = event.which;
          var i = -1;
          if (c >= 97 && c <= 102) c -= (97-65);
          if (c >= 65 && c <= 70) i = c+10-65;
          if (c >= 48 && c <= 57) i = c-48;
          if (i > 0 && i < 11 && codes.length < 6) {
            codes.push(i);
            init_c.addText(i.toString(16).toUpperCase()); 
          }
      }
    });
  };

  if (codes.length != 6) {
    init_c.addLine("Please input command code:"); 
    query_number(fadeToConnectionScreen);
  } else {
    fadeToConnectionScreen(codes);
  }

  function fadeToConnectionScreen(codes) {
    var s = [];
    console.log(codes);
    for(var i = 0; i < 6; i++) {
      s[i] = codes[i].toString(16).toUpperCase();
    }
    init_c.addLine("Executing command code "+s.join("")); 
    init_c.queue(function() {
      $('#logoscreen').fadeOut(connectionScreen);
    });
  }

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
  meters = {
    powah: $("#powah").meter(3, 1.1, 1.1),
    suomut: $("#suomut").meter(2, 1.1, 1.1),
    saostetut_suomut: $("#saostetut_suomut").meter(2, 1.1, 1.1),
    suola: $("#suola").meter(2, 1.1, 1.1),
    vilja: $("#vilja").meter(2, 1.1, 1.1),
    terva: $("#terva").meter(2, 1.1, 1.1),
    ilmariitti: $("#ilmariitti").meter(2, 1.1, 1.1),
  };
  $.each(meters, function(k) {
    meters[k].update(sampo.vars[k]);
    meters[k].hide();
  });
  sampo.updateFun = function(i, v) {
    //console.log(i+": "+v);
    meters[i].update(v);
  }

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

    setTimeout(function() {
      var i = 0;
      $.each(meters, function(k) {
        setTimeout(function() {
          meters[k].fadeIn();
        }, i*400 + 100);
        i++;
      });
    }, 1000);
    
    sampo.run(codes, skip, sampoShutDown);
  }

  function sampoShutDown() {
    sampo.print("Käyttöteho: "+sampo.vars.powah);
    sampo_c.wait(1000);
    sampo.print("Käynnistetään automaattinen alasajo...");
    sampo_c.wait(2000);
    sampo_c.queue(function(cont) {
      tone.fadeTo(0, 0.10, 80);
      setTimeout(function() { 
        fail.play();
        var t = 23;
        setInterval(function() { bach.currentTime = t; }, 50);
      }, 1000);
      setTimeout(function() { 
        bach.fadeTo(0, 0.03, 80);
        fail.fadeTo(0, 0.03, 80);
      }, 16000);

      var i = 8;
      $.each(meters, function(k) {
        setTimeout(function() {
          meters[k].fadeOut();
        }, i*400 + 100);
        i--;
      });
      setTimeout(function() {
        $("#meters").animate({top: -200});
        setTimeout(function() { 
          $("#rand").animate({left: -$("#rand").width()}, 700) 
        }, 200);
        setTimeout(function() { 
          $("#rand2").animate({left: $(document).width()+$("#rand").width()}, 700)
        }, 1200);
      }, 9*400 + 100);
      cont();
    });
    sampo_c.wait(1500);
    for(var m = sampo.machines.length-1; m >= 0; m--) {
      sampo.print("Sammutetaan: "+sampo.machines[m].name+"...");
      sampo_c.wait(500);
    }
    sampo.print("Alasajo valmis!");
    sampo_c.wait(501);
    sampo.print("Katkaistaan yhteyttä...");
    sampo_c.queue(function() { 
      bach.fadeTo(0, 0.10, 80);
      $('#samposcreen').fadeOut(5000, function() {
        $('#connectionscreen').show();
        c.addLine("Connection lost...");
        c.addLine("The remote system reported a power rating of "+sampo.vars.powah+" terawatts.");
        c.addLine("Press any key to reboot");
        document.addEventListener("keypress", function(event) {
          location.reload();
        });

      });
    });
  }
});
