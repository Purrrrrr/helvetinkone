var getMachine =(function() {
  var machines = {};
  function machine(code, name, consumption, workings) {
    var machina = {
      consumption: consumption,
      name: name,
      powah: 1,
      speed: 1,
    };
    machina.run = function(sampo) {
      var p = machina.speed;
      sampo.print("Käynnistetään "+machina.name+"...");
      while(p>0) {
        sampo.vars.powah -= machina.consumption;
        if (machina.consumption > 1) {
          sampo.print("Ohjataan laitteeseen "+machina.consumption+" yksikköä tehoa");
        } else if (machina.consumption == 1) {
          sampo.print("Ohjataan laitteeseen yksi yksikkö tehoa");
        }
        if (sampo.vars.powah < 0) {
          sampo.fail();
          return false;
        }
        if (!workings.call(machina,sampo)) return false;
        p--;
      }
      return true;
    }
    machines[code] = machina;
  }

  machine(1,"Suolan ja viljan vipstaakkelit", 3, function(sampo) {
    sampo.vars.suola += 10;
    sampo.vars.vilja += 10;
    sampo.print("Lorem ipsum dolor sit amet, consectetur adipisicing elit.");
    sampo.print("Viljaa käytettävissä "+sampo.vars.vilja+" paunaa. Suolaa käytettävissä "+sampo.vars.suola+" paunaa.");
  });
  machine(7,"Käymiskammio", 5, function(sampo) {
    var v = sampo.consume("vilja", 15);
    var s = sampo.consume("suomut", 15);
    sampo.vars.etanoli += v;
    sampo.vars.saostetut_suomut += s;
    sampo.print("Kärrätään viljaa varastosta "+v+" paunaa...");
    sampo.print("Sekoitetaan louhikäärmeen suomuja...");
    sampo.print("Pulputi...");
    sampo.print("Saostettu "+sampo.vars.saostetut_suomut+" louhiukäärmeen suomua.");
    sampo.print("Väkiviinaa käytettävissä "+sampo.vars.etanoli+" litraa.");
  });
  machine(3,"Pronssi-Wolframi-Ilmariittisaostin", 20, function(sampo) {
    var v = sampo.consume("etanoli", 30);
    var i = sampo.consume("ilmariitti", 30);
    var t = 0;
    var min = Math.min(v,i);
    sampo.print("Saostetaan avaruuden rakennetta...");
    v -= min;
    i -= min;
    t += min*5000;
    t += i*400;
    t += v*20;
    sampo.vars.powah += t;
    sampo.print("Saostettu "+t+" yksikköä tehoa!");
  });
  machine(15,"Tyhjiöimaisin", 1, function(sampo) {
    var i = sampo.consume("ilmariitti", 1);
    p = i > 0 ? 250 : 100;
    sampo.vars.powah += p;
    sampo.print("Tyhjiöstä imaistu yhteensä "+p+" yksikköä tehoa!");
    if (i > 0) {
      sampo.print("Ilmariittia kului tähän yksi pauna.");
    }
  });

  return function(code) {
    return machines[code];
  };
  
})();

var Sampo = (function() {
  function sampo(c) {
    var s = this;
    
    this.console = c;
    this.phase = 1;
    this.failed = false;
    this.vars = {
      powah: 10,
      suomut: 30,
      saostetut_suomut: 0,
      suola: 0,
      vilja: 0,
      etanoli: 0,
      ilmariitti: 0,
    };
    this.machines = [];
    this.consume = function(item, amount) {
      if (this.vars[item] < amount) {
        amount = this.vars[item];
      }
      this.vars[item] -= amount;
      return amount;
    }
    this.print = function(str) { s.console.addLine(str); };
    this.runPhase = function(machineCode) {
      var newMachine = getMachine(machineCode);
      s.print("------------------------");
      s.print("Käynnistetään vaihetta "+s.phase);
      s.console.wait(2000);
      s.print("Lisätty käynnistyssarjaan "+newMachine.name);
      console.log(newMachine.name);

      s.machines.push(newMachine);
      for(var m = 0; m < s.machines.length; m++) {
        if (s.machines[m].run(s) !== false) break;
        s.print("Teholukema: "+s.vars.powah);
        s.console.wait(200);
      }

      s.console.wait(2000);
      s.phase++;
    };
    this.fail = function() {
      this.print("Ylikuormitus!!");
      s.failed = true;
      s.console.queue(this.failFun);
    };
    this.failFun = function() { this.print("Ylikuormitus!"); };

  }
  return sampo;
})();
