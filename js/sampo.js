// unit, plural unit, partitiivi
var vardata = (function() {
  var d = {};
  $.each({
    powah: ["hornanliekin", "hornanliekkiä", "voimaa"],
    suomut: ["louhikäärmeen suomun", "louhikäärmeen suomua", ""],
    saostetut_suomut: ["saostetun louhikäärmen suomun", "saostettua louhikäärmeen suomua", ""],
    suola: ["paunan", "paunaa", "suolaa"],
    vilja: ["paunan", "paunaa", "viljaa"],
    terva: ["kapan", "kappaa", "tervaa"],
    ilmariitti: ["paunan", "paunaa", "ilmariittia"],
  }, function(i,v) {
    d[i] = {
      units: function(a, m) {
        m = m || (v[2] != "" ? " "+v[2] : "");
        return (a == 1 ? "yhden "+v[0] : a+" "+v[1]) + m;
      },
      unit_singular: v[0],
      unit: v[1],
      partitive: v[2],
    }
  });
  return d;
})();

function generateMachineFunction() {
  var machines = {};
  function machine(code, name, description, vars, workings) {
    var machina = {
      code: code,
      name: name,
      description: description,
      consumption: 0,
      consumes: {},
      consumesTexts: [],
      consumed: {},
      produces: {},
      produced: {},
      producesTexts: [],
      speed: 1,
    };
    $.extend(machina, vars);
    var consume = machina.consume = function(k, a) {
      var c = machina.sampo.consume(k,a);
      if (machina.consumed.hasOwnProperty(k)) {
        machina.consumed[k] += c;
      } else {
        machina.consumed[k] = c;
      }
      return c;
    }
    var produce = machina.produce = function(k, a) {
      machina.produced[k] += a;
      machina.sampo.vars[k] += a;
    }
    machina.run = function(sampo) {
      $.each(vardata, function(k) {
        machina.consumed[k] = machina.produced[k] = 0;
      });

      var p = 1, s = machina.speed; //No machine can rerun itself!
      var consumed = 0;
      while(p<=s) {
        consumed += machina.consume("powah", machina.consumption);
        $.each(machina.consumes, consume);
        $.each(machina.produces, produce);
        p++;
      }
      var runText = "Ajetaan vipstaakkelia "+machina.name+".";
      if (consumed > 0) {
        runText += " Se syö "+vardata.powah.units(consumed);
      }
      sampo.print(runText);
      if (sampo.vars.powah == 0) {
        sampo.fail();
        return;
      }

      p = 1;
      while(p<=s) {
        if (workings.call(machina,sampo,p) === false) break;
        if (sampo.failed) return;
        p++;
      }
    }
    machina.productions = function() {
      var l = [];
      $.each(machina.produces, function(i,v) {
        l.push(vardata[i].units(v));
      });

      return l.concat(machina.producesTexts);
    }
    machina.consumptions = function() {
      var l = [];
      var c = machina.consumption;
      if (typeof(c) == "string" && c.match(/^(\d+)%$/)) {
        c += " kaikesta käytettävissä olevasta voimasta";
        l.push(c);
      } else if (c != 0) {
        l.push(vardata.powah.units(c));
      }
      $.each(machina.consumes, function(i,v) {
        l.push(vardata[i].units(v) + ", jos saatavilla");
      });

      return l.concat(machina.consumesTexts);
    }
    machines[code] = machina;
  }

  machine(1,"Suolan ja viljan vipstaakkelit", 
  [
    "Loihtii viljaa ja suolaa kuin tyhjästä!",
  ].join("\n"),
  {
    consumption: 3,
    produces: {
      suola: 10,
      vilja: 10
    }
  }, function(sampo) {
    sampo.print("Lorem ipsum dolor sit amet, consectetur adipisicing elit.");
  });
  machine(2,"Tyhjiöimaisin", 
  [
    "Imaisee tyhjiöstä voimaa",
  ].join("\n"),
  {
    consumption: 1,
    consumes: { ilmariitti: 1 },
    produces: { powah: 100 },
    producesTexts: ["250 hornanliekkiä mikäli ilmariittia on käytettävissä"]
  }, function(sampo) {
    p = this.consumed.ilmariitti * 150 + this.produced.powah;
    sampo.print("Tyhjiöstä imaistu yhteensä "+p+" hornanliekkiä voimaa!");
    if (this.consumed.ilmariitti > 0) {
      sampo.print("Ilmariittia kului tähän yksi pauna.");
    }
  });
  machine(3,"Tervakammio", 
  [
    "Tervakammio pulputtaa sisällään laadukasta mineraalitervaa ja saostaa samalla louhikäärmeen suomuja.",
  ].join("\n"),
  {
    consumption: 5,
    consumes: { suola: 15, suomut: 10 },
    producesTexts: [
      "Kapan jokaista ottamaansa suolapaunaa kohden.",
      "Saostettuja suomuja ottamansa määrän"
    ],
  }, function(sampo) {
    this.produce("terva", this.consumed.suola);
    this.produce("saostetut_suomut", this.consumed.suomut);
    sampo.print("Kärrätään suolaa varastosta "+this.consumed.suola+" paunaa...");
    if (this.consumed.suomut) {
      sampo.print("Sekoitetaan sekaan louhikäärmeen suomuja...");
    }
    sampo.print("Pulputi...");
    if (this.consumed.suomut) {
      sampo.print("Saostettu "+this.consumed.suomut+" louhikäärmeen suomua.");
    }
  });
  machine(4,"Alkemiaydin", 
  [
    "Muuttaa:",
    "  puolet varaston viljasta suolaksi,",
    "  kolmanneksen varaston suolastapaunoista kapoiksi tervaa",
    "  neljänneksen varaston tervakapoista louhikäärmeen suomuiksi",
    "  viidenneksen kaikista louhikäärmeen suomuista ilmariittipaunoiksi.",
  ].join("\n"),
  {
    consumption: "15%",
  }, function(sampo) {
    this.consume("vilja", "50%");
    this.produce("salt", this.consumed.vilja);
    sampo.print("Loihditaan viljaa suolaksi "+this.produced.suola+" paunaa!");

    this.consume("salt", "33.3333%");
    this.produce("terva", this.consumed.salt);
    sampo.print("Suolaa muuttuu tervaksi "+this.produced.terva+" paunaa...");

    this.consume("terva", "25%");
    this.produce("suomut", this.consumed.terva);
    sampo.print("Tervaa saostuu louhikäärmeen suomuiksi "+this.produced.suomut+" kappaa...");

    this.consume("suomut", "20%");
    this.consume("saostetut_suomut", "20%");
    this.produce("ilmariitti", this.consumed.suomut+this.consumed.saostetut_suomut);
    sampo.print("Suomujen rakenne muutttuu...");
    sampo.print("Poltetaan "+this.produced.ilmariitti+" louhikäärmeen suomuista ilmariitiksi...");
    
  });
  machine(5,"Louhikäärme-takonaattori", 
  [
    "Takoo saostetuista louhikäärmeen suomuista ilmariittia 15 paunaa per suomu.",
    "Normaaleista suomuista saa vain 3 paunaa suomua kohden",
  ].join("\n"),
  {
    consumption: 13,
    consumes: { saostetut_suomut: 17 },
    consumesTexts: ["täydentää tavallisista suomuista, jos saostetut eivät riitä"]
  }, function(sampo) {
    var taottu = 15*this.consumed.saostetut_suomut;
    var suomut = this.consumed.saostetut_suomut;
    if (this.consumed.saostetut_suomut < 17) {
      taottu += 3*this.consume("suomut", 17-suomut);
      suomut += this.consumed.suomut;
    }
    console.log(this.consumed);
    this.produce("ilmariitti", taottu);

    sampo.print("Taotaan "+suomut+" louhikäärmeen suomusta "+vardata.ilmariitti.units(taottu, " verran ilmariittia..."));
  });
  machine(6,"Pronssi-Wolframi-Ilmariittireaktori", 
  [
    "Laitteen tuottama voima puolitoistakertaistuu, mikäli saostettuja louhikäärmeen suomuja on tarjolla.",
  ].join("\n"),
  {
    consumption: 20,
    consumes: {
      ilmariitti: 30,
      terva: 30,
      saostetut_suomut: 1
    },
    producesTexts: [
      "5000 hornanliekkiä voimaa jokaista yhdistetyä ilmariittipaunaa ja tervakappaa kohden",
      "400 hornanliekkiä voimaa jokaista ilmariittipaunaa kohden",
      "20 hornanliekkiä voimaa jokaista tervakappaa kohden",
    ]
  }, function(sampo) {
    var min = Math.min(this.consumed.terva,this.consumed.ilmariitti);
    sampo.print("Saostetaan avaruuden rakennetta...");
    t = min*5000;
    t += this.consumed.ilmariitti*400;
    t += this.consumed.terva*20;
    t *= 1 + (this.consumed.saostetut_suomut*1.5);
    this.produce("powah",t);
    sampo.print("Sekoitetaan reaktioaineita...");
    if (t > 0) {
      var msg = "";
      if (this.consumed.ilmariitti) {
        msg += "Ilmariitti lisätty... ";
      }
      if (this.consumed.terva) {
        msg += "Terva lisätty... ";
      }
      if (this.consumed.saostetut_suomut) {
        msg += "Louhikäärmeen suomu lisätty...";
      }
      sampo.print(msg);
      sampo.print("Saostettu "+t+" hornanliekkiä voimaa!");
    } else {
      sampo.print("Reaktio lopahti, ei saatu tarveaineita.");
    }
  });
  machine(8,"Kierteishyypiöintikäämi", 
  [
    "Laskee valtaosan käytettävissä olevasta voimasta yli-eteerisille taajuuuksille ja siirtyy sitten lepotilaan imemään seuraavien laitteiden eetterivärähdyksiä.",
    "Jokainen laitteen käynnistymisen aiheuttama eetterivärähdys lisää yli-eteerisen energian määrää puolella!",
    "Viimeisen laitteen ajettua käämi hakee kaiken kasvattamansa voiman takaisin!",
  ].join("\n"), {
    consumption: "90%",
    producesTexts: ["Vähintään ottamansa määrän voimaa"]
  }, function(sampo) {
    var kaami = this;
    sampo.print("Lähetetään energiaa ylä-eetteriin..");
    
    var macs = sampo.machines;
    var last = macs[macs.length-1];
    if (last == this) {
      this.produce("powah",this.consumed.powah);
      sampo.print("Haettiin ylä-eetterin energia takaisin muuttumattomana");
    } else {
      var coeff = 1;
      for (var m = 6; m > kaami.sequenceNumber; m--) {
        coeff *= 1.5;
      }
      var payback = Math.ceil(this.consumed.powah*coeff);

      var original = last.run;
      var n = this.name;
      last.run = function(sampo) {
        original(sampo);
        sampo.console.wait(400);
        sampo.print(n+" jälkiaktivoituu...");
        sampo.print("Saatiin ylä-eetterin energiaa takaisin "+payback+" hornanliekkiä!");
        sampo.console.queue(function(cont) {
          kaami.produce("powah", payback);
        });
        last.run = original;
      };
    }
    
    return false;
  });
  machine(9,"Hilavitkutin", 
  [
    "Tuplaa kaikkien tulevien vipstaakkelien käymisnopeuden siten, että ne seuraaavassa vaiheessa suoritetaan kahdesti.",
    "Nopeutetut vipstaakkelit vievät tietenkin nopeutuksen verran enemmän voimaa ja ainehia.",
  ].join("\n"), {
    consumption: 200
  }, function(sampo, countOfRunsInPhase) {
    for (var m = this.sequenceNumber+1; m < sampo.machines.length; m++) {
      var mach = sampo.machines[m];
      (function(mach) {
        var originalFun = mach.run;
        mach.speed *= 2;
        mach.run = function(sampo) {
          sampo.print(mach.name + " nopetettu kahdestilaukeavaksi.");
          originalFun(sampo);
        };
      })(mach);
    }
    sampo.print("Hiloja vetkutetaan... Nopetukset asennettu!");
  });
  var spaceStrings = [
    "Ammutaan sädeaseita...",
    "Lasketaan hyperavaruuslentoratoja...",
    "Laukaistaan protonitorpedoja...",
    "Käännetään kuolemantähteä...",
    "Teroitetaan valomiekkoja...",
    "Kaupataan droideja...",
    "Tiivistetään roskakuilua...",
    "Surmataan kapinallisia jedejä...",
    "Tuhotaan rauhanomaisia planeettoja...",
    "Manipuloidaan Galaaktista Senaattia...",
  ];
  machine(10,"Anakronismi", 
  [
    "Tähtituhoojan keskustietokone v3.4",
    "Ohjaa imperiumin ylpeyttä kaukaisessa ajassa kaukaisessa galaksissa. Tuottaa samalla tervaa savuisten saasteiden kera.",
  ].join("\n"), {
    consumption: 10,
    produces: { terva: 10 }
  }, function(sampo) {
    var s = spaceStrings.shift();
    sampo.print(s);
    spaceStrings.push(s);
  });

  return function() {
    return machines;
  };
  
}
var getMachines = generateMachineFunction();
function getMachine(code) {
  var machines = getMachines();
  if (machines.hasOwnProperty(code)) {
    return machines[code];
  }
  return undefined;
};

var Sampo = (function() {
  function sampo(c) {
    var s = this;
    
    this.console = c;
    this.phase = 1;
    this.failed = false;
    this.vars = {
      powah: 1000,
      suomut: 30,
      saostetut_suomut: 0,
      suola: 0,
      vilja: 0,
      terva: 10,
      ilmariitti: 10,
    };
    this.failFun = function(cont) {cont();};
    this.machines = [];
    /* this.need = function(item, amount) {
      if (this.vars[item] < amount) {
        return false;
      }
      this.vars[item] -= amount;
      return true;
    } */
    this.consume = function(item, amount) {
      if (typeof(amount) == "string") {
        var m = amount.match(/^([0-9.]+)%$/);
        if (!m) return 0;
        amount = Math.floor(this.vars[item] * (m[1]/100));
      }
      if (amount > this.vars[item]) {
        amount = this.vars[item];
      }
      this.vars[item] -= amount;
      return amount;
    }
    this.print = function(str) { 
      //console.log(str); 
      s.console.addLine(str); 
    };
    this.fail = function() {
      this.print("Ylikuormitus!!");
      s.failed = true;
      s.console.queue(this.failFun);
    };
    this.init = function(codes) {
      for (var i = 0; i < codes.length; i++) {
        var newMachine = getMachine(codes[i]);
        s.machines.push(newMachine);
        newMachine.sampo = s;
        newMachine.sequenceNumber = i;
      }
    };
    this.runPhase = function() {
      var latestMachine = s.machines[s.phase-1];
      s.print("--------------------------------------------------------------------------------");
      s.print("Lisätty käynnistyssarjaan "+latestMachine.name);
      s.console.wait(2000);

      latestMachine.run(s);
      if (s.failed) return false;
      s.console.wait(400);

      s.print("Vipstaakeli "+s.phase+" ajettu");
      s.console.wait(400);
      s.phase++;
    };
    this.postScore = function() {
      var source = location.pathname;
      var sequence = [];
      for (var i = 0; i < s.machines.length; i++) {
        sequence.push(s.machines[i].name);
      }
      $.ajax({
        url: "http://purrrrrr.dy.fi/Koodikori/helvetinkone/topscores/post.php",
        type: "POST",
        data: { source: source, score: s.vars.powah, sequence: sequence.join(", ") }
      });
    };
    this.run = function(codes, skip, sampoShutDown, beforePhaseCallback, afterPhaseCallback) {
      s.print("Käynnistetään järjestelmiä");
      s.console.wait(1000);
      s.console.setRunWhenComplete(false);
      s.init(codes);
      
      // Target power is 3.83×10^26 Watts = 3.83×10^14 TW
      var skipnum = 5;
      var delays = [2300,1700,1200,1100,900,800];
      for(var i = 0; i < codes.length; i++) {
        if (typeof(beforePhaseCallback) == "function") {
          beforePhaseCallback(i+1);
        }
        s.console.faster(20-i*2);

        s.console.setQueueParallelDelay(delays[i]);
        s.console.skip(skip > (skipnum));
        s.runPhase();

        if (typeof(afterPhaseCallback) == "function") {
          afterPhaseCallback(i+1);
        }

        if (s.failed) break;
        skipnum++;

      }

      s.console.skip(false);
      if (!s.failed) {
        s.print("Järjestelmä käynnistetty!");
        sampoShutDown();
      }
      this.postScore();
    }

  }
  return sampo;
})();
