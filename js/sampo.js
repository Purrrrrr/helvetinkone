// unit, plural unit, partitiivi
var vardata = (function() {
  var d = {};
  $.each({
    powah: ["hornanliekin", "hornanliekkiä", "voimaa", "voimasta", "voiman"],
    suomut: ["louhikäärmeen suomun", "louhikäärmeen suomua", "", "suomuista", "suomuvarannon"],
    saostetut_suomut: ["saostetun louhikäärmen suomun", "saostettua louhikäärmeen suomua", "", "saostetuista suomuista", "saostetun suomuvarannon"],
    suola: ["paunan", "paunaa", "suolaa", "suolasta", "suolan"],
    vilja: ["vakallisen", "vakallista", "viljaa", "viljasta", "viljan"],
    terva: ["kapan", "kappaa", "tervaa", "tervasta", "tervan"],
    ilmariitti: ["paunan", "paunaa", "ilmariittia", "ilmariitista", "ilmariitin"],
  }, function(i,v) {
    d[i] = {
      units: function(a, m) {
        m = m || (v[2] != "" ? " "+v[2] : "");
        return (a == 1 ? "yhden "+v[0] : a+" "+v[1]) + m;
      },
      unit_singular: v[0],
      unit: v[1],
      partitive: v[2],
      sta: v[3],
      gen: v[4],
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
      needs: {},
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
      machina.consumed[k] += c;
      return c;
    }
    var produce = machina.produce = function(k, a) {
      machina.produced[k] += a;
      machina.sampo.produce(k, a);
    }
    machina.run = function(sampo) {
      $.each(vardata, function(k) {
        machina.consumed[k] = machina.produced[k] = 0;
      });

      var p = 1, s = machina.speed; //No machine can rerun itself!
      var consumed = 0;
      while(p<=s) {
        var failNeed = false;
        $.each(machina.needs, function(k, a) {
          if (!sampo.hasEnough(k,a)) {
            failNeed = k;
          }
        });
        if (failNeed) {
          var runText = "Ajetaan vipstaakkelia "+machina.name+".";
          sampo.print(machina.name+" ei voinut käynnistyä, koska "+vardata[failNeed].partitive+" ei ollut tarpeeksi");
          return;
        };

        consumed += machina.consume("powah", machina.consumption);
        $.each(machina.needs, consume);
        $.each(machina.consumes, consume);
        $.each(machina.produces, produce);
        p++;
      }
      var runText = "Ajetaan vipstaakkelia "+machina.name+".";
      if (consumed > 0) {
        runText += "\nSe syö "+vardata.powah.units(consumed);
      }
      sampo.queueUpdate("powah");
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
      function makeTxt(i, v, ofWhat, post) {
        post = post || "";
        if (typeof(v) == "string" && v.match(/^(\d+)%$/)) {
          if (v == "100%") {
            return "Kaiken käytettävissä oleva "+vardata[i].gen;
          } else {
            return c+" kaikesta käytettävissä olevasta "+vardata[i].sta;
          }
        } else if (v != 0) {
          return vardata[i].units(v)+post;
        }
      }
      l.push(makeTxt("powah", c));
      $.each(machina.needs, function(i,v) {
        l.push(makeTxt(i, v));
      });
      $.each(machina.consumes, function(i,v) {
        l.push(makeTxt(i, v,", jos saatavilla"));
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
    consumption: 32,
    produces: {
      suola: 10,
      vilja: 10
    }
  }, function(sampo) {
    sampo.queueUpdate("suola","vilja");
    sampo.print("Lorem ipsum dolor sit amet, consectetur adipisicing elit.");
  });
  machine(2,"Tyhjiöimaisin", 
  [
    "Imaisee tyhjiöstä voimaa",
  ].join("\n"),
  {
    consumption: 1,
    consumes: { ilmariitti: 100 },
    produces: { powah: 100 },
    producesTexts: ["250 hornanliekkiä jokaista käytettyä ilmariittipaunaa kohden"]
  }, function(sampo) {
    p = this.consumed.ilmariitti * 150 + this.produced.powah;
    sampo.queueUpdate("powah", "ilmariitti");
    sampo.print("Tyhjiöstä imaistu yhteensä "+vardata.powah.units(p)+"!");
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
    consumes: { suola: "100%", suomut: 10 },
    producesTexts: [
      "Kapan jokaista ottamaansa suolapaunaa kohden.",
      "Saostettuja suomuja ottamansa määrän"
    ],
  }, function(sampo) {
    this.produce("terva", this.consumed.suola);
    if (this.consumed.suola > 0) {
      this.produce("saostetut_suomut", this.consumed.suomut);
      sampo.queueUpdate("suola");
      sampo.print("Kärrätään suolaa varastosta "+this.consumed.suola+" paunaa...");
      if (this.consumed.suomut) {
        sampo.queueUpdate("suomut");
        sampo.print("Sekoitetaan sekaan louhikäärmeen suomuja...");
      }
      sampo.print("Pulputi...");
      if (this.consumed.suomut) {
        sampo.queueUpdate("saostetut_suomut");
        sampo.print("Saostettu "+this.consumed.suomut+" louhikäärmeen suomua.");
      }
    } else {
      this.produce("suomut", this.consumed.suomut);
      sampo.print("Varastoista ei löytynyt yhtään suolaa mineraalitervan keittoon!");
    }
    sampo.queueUpdate("terva");
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
    this.produce("suola", this.consumed.vilja);
    sampo.queueUpdate("vilja", "suola");
    sampo.print("Loihditaan viljaa suolaksi "+this.produced.suola+" vakallista!");

    this.consume("suola", "33.3333%");
    this.produce("terva", this.consumed.suola);
    sampo.print("Suolaa muuttuu tervaksi "+this.produced.terva+" paunaa...");
    sampo.queueUpdate("suola", "terva");

    this.consume("terva", "25%");
    this.produce("suomut", this.consumed.terva);
    sampo.print("Tervaa saostuu louhikäärmeen suomuiksi "+this.produced.suomut+" kappaa...");
    sampo.queueUpdate("terva", "suomut");

    this.consume("suomut", "20%");
    this.consume("saostetut_suomut", "20%");
    this.produce("ilmariitti", this.consumed.suomut+this.consumed.saostetut_suomut);
    sampo.print("Suomujen rakenne muuttuu...");
    sampo.queueUpdate("suomut", "saostetut_suomut", "ilmariitti");
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
    if (this.consumed.saostetut_suomut < 17) {
      taottu += 3*this.consume("suomut", 17-this.consumed.saostetut_suomut);
    }
    this.produce("ilmariitti", taottu);

    var suomut = this.consumed.saostetut_suomut + this.consumed.suomut;
    sampo.queueUpdate("suomut", "saostetut_suomut", "ilmariitti");
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
    sampo.queueUpdate("terva", "saostetut_suomut", "ilmariitti");
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
      sampo.queueUpdate("powah");
      sampo.print("Saostettu "+vardata.powah.units(t)+"!");
    } else {
      sampo.print("Reaktio lopahti, ei saatu tarveaineita.");
    }
  });
  machine(7,"Ahtopaahdin", 
  [
    "Paahtaa viljasta ensiluokkaista ajoainetta, joka ajetaan Ahdin kidusten läpi tervan kera tuottaen ihmeellisiä aineita ja mahtavasti voimaa!",
  ].join("\n"),
  {
    consumption: 80,
    needs: { vilja: 10 },
    consumes: { terva: 18 },
    producesTexts: [
      "Jos tervaa saatiin yli "+vardata.terva.units(9)+", laite tuottaa:",
      "  "+vardata.saostetut_suomut.units(70),
      "  "+vardata.powah.units(900),
      "Jos tervaa saatiin alle "+vardata.terva.units(9)+", laite tuottaa:",
      "  "+vardata.ilmariitti.units(30),
      "  "+vardata.powah.units(13000),
      "Laite tekee molemmat jos tervaa on tasan 9 kappaa"
    ]

  }, function(sampo) {
    sampo.queueUpdate("vilja","terva");
    sampo.print("Paahdetaan viljaa...");
    sampo.print("Ohjataan paahdettu ajoaine Ahdin kiduksiin...");
    if (this.consumed.terva >= 9) {
      sampo.queueUpdate("saostetut_suomut");
      sampo.print("Kiduksista löytyy saostettuja louhikäärmeen suomuja!");
      this.produce("powah", 900);
      this.produce("saostetut_suomut", 70);
    }
    if (this.consumed.terva <= 9) {
      sampo.queueUpdate("ilmariitti");
      sampo.print("Kiduksista kalastetaan ilmariittia!");
      this.produce("powah", 13000);
      this.produce("ilmariitti", 30);
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
      sampo.queueUpdate("powah");
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
        kaami.produce("powah", payback);
        sampo.queueUpdate("powah");
        sampo.print("Saatiin ylä-eetterin energiaa takaisin "+vardata.powah.units(payback," verran voimaa!"));
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
    sampo.queueUpdate("terva");
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
      terva: 0,
      ilmariitti: 10,
    };
    this.updateFun = function() {};
    this.queueUpdate = function() {
      for( var i = 0; i < arguments.length; i++ ) {
        var k = arguments[i];
        var v = this.vars[k];
        (function(k,v) {
          s.console.queue(function(cont) {
            s.updateFun(k, v);
            cont();
          }, true);
        })(k,v);
      }
    };
    this.failFun = function(cont) {cont();};
    this.machines = [];
    this.hasEnough = function(item, amount) {
      if (typeof(amount) == "string") {
        var m = amount.match(/^([0-9.]+)%$/);
        if (!m) return 0;
        amount = Math.floor(this.vars[item] * (m[1]/100));
      }
      return amount <= this.vars[item];
    }
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
    this.produce = function(item, amount) {
      this.vars[item] += amount;
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
        s.console.queue(function(cont) {
          sampoShutDown();
          cont();
        });
      }
      this.postScore();
    }

  }
  return sampo;
})();
