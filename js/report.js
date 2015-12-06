var status = 0;

$(function() {
  function make_console() {
    var console = {}
    console.skip = function(t) {};
    console.faster = function(f) {};
    console.setQueueParallelDelay = function(t) {};
    console.setRunWhenComplete = function(t) {};
    console.addLine = function() {};
    console.addText = function () {};
    console.wait = function(t) {}
    console.queue = function queue(func) {
      func(function() {});
    };
    return console;
  };

  var c = make_console();
  function perms(codes, maxlength, built, callback) {
    var last_index = built.length;

    if (built.length == maxlength || codes.length == 0) {
      ++status;
      return callback(built);
    } else {
      built.push(0);
      for(var i = 0; i < codes.length; i++) {
        var next = codes[i];
        built[last_index] = next;
        var rest = [];
        for(var l = 0; l < codes.length; l++) {
          if (i!=l) rest.push(codes[l]);
        }
        if (perms(rest, maxlength, built, callback) === false) return false;
      }
      built.pop();
    }
  }
  var ok = true;
  var maxPowah = 0;
  var minPowah = 10000000;
  var powerlevels = {};
  var phases = {};
  var codes = [1,2,3,4,5,6,7,8];
  var log10 = Math.log(10);
  var bestcode = [];
  codes = [1,2,3,4,5,6,7,9,10];
  setTimeout(function() {
    perms(codes,6,[], function(a) {
      if ((status%1000) == 0) console.log(status+": "+a.join(","));
      getMachines = generateMachineFunction();
      var sampo = new Sampo(c);
      sampo.postScore = function() {};
      function complete() {
        var phase = sampo.phase;
        var powah = sampo.vars.powah;
        if (powah > maxPowah) {
          bestcode = a.join(",");
        }
        maxPowah = Math.max(maxPowah, powah);
        minPowah = Math.min(minPowah, powah);
        var level = Math.round(Math.log(powah)/log10);
        if (!phases.hasOwnProperty(phase)) {
          phases[phase] = 0;
        }
        if (!powerlevels.hasOwnProperty(level)) {
          powerlevels[level] = 0;
        }
        if (sampo.failed) {
          ok = false;
          asdf = sampo;
          asdf2 = a;
          //console.log(sampo);
        }
        ++phases[phase];
        ++powerlevels[level];
      }
      sampo.failFun = complete
      //var codes = [15, 1, 8, 14, 7, 3];
      sampo.run(a, 0, complete);
      return ok;
      //$("#powah").text("Lopullinen voima "+sampo.vars.powah+" hornanliekkiä");
    });
    console.log(status);
    console.log(phases);
    console.log(powerlevels);
    console.log(minPowah);
    console.log(maxPowah);
    console.log(bestcode);
  }, 400);
});
