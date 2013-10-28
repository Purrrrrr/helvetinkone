function generateMachineFunction() {
  var machines = {};
  function machine(code, name, description, consumption, workings) {
    var machina = {
      consumption: consumption,
      code: code,
      name: name,
      description: description,
      powah: 1,
      speed: 1,
    };
    machina.run = function(sampo) {
      var p = 1, s = machina.speed; //No machine can rerun itself!
      sampo.print("Käynnistetään "+machina.name+"...");
      sampo.vars.powah -= machina.consumption*s;
      if (machina.consumption > 1) {
        sampo.print("Ohjataan laitteeseen "+machina.consumption*s+" yksikköä tehoa");
      } else if (machina.consumption*s == 1) {
        sampo.print("Ohjataan laitteeseen yksi yksikkö tehoa");
      }
      if (sampo.vars.powah < 0) {
        sampo.fail();
        return;
      }
      while(p<=s) {
        if (workings.call(machina,sampo,p) === false) break;
        if (sampo.failed) return;
        p++;
      }
    }
    machines[code] = machina;
  }

  machine(1,"Suolan ja viljan vipstaakkelit", 
  [
    "Kulutus: 3",
    "Tuottaa: 10 paunaa viljaa ja suolaa kuin tyhjästä!",
  ].join("\n"),
    3, function(sampo) {
    sampo.vars.suola += 10;
    sampo.vars.vilja += 10;
    sampo.print("Lorem ipsum dolor sit amet, consectetur adipisicing elit.");
    sampo.print("Viljaa käytettävissä "+sampo.vars.vilja+" paunaa. Suolaa käytettävissä "+sampo.vars.suola+" paunaa.");
  });
  machine(2,"Tyhjiöimaisin", 
  [
    "Kulutus: 1 yksikkö tehoa",
    "Tuottaa: 100 yksikköä tehoa + 150 ilmariittipaunaa kohden max 1x",
  ].join("\n"),
    1, function(sampo) {
    var i = sampo.consume("ilmariitti", 1);
    p = i > 0 ? 250 : 100;
    sampo.vars.powah += p;
    sampo.print("Tyhjiöstä imaistu yhteensä "+p+" yksikköä tehoa!");
    if (i > 0) {
      sampo.print("Ilmariittia kului tähän yksi pauna.");
    }
  });
  machine(3,"Tervakammio", 
  [
    "Kulutus: 5 + max. 15 paunaa suolaa",
    "Tuottaa: Litran laadukasta mineraalitervaa jokaista suolayksikköä kohden.",
    "         Saostaa samalla 10 kpl louhikäärmeen suomuja mikäli niitä on jäljellä.",
  ].join("\n"),
    5, function(sampo) {
    var v = sampo.consume("suola", 15);
    var s = sampo.consume("suomut", 15);
    sampo.vars.terva += v;
    sampo.vars.saostetut_suomut += s;
    sampo.print("Kärrätään suolaa varastosta "+v+" paunaa...");
    sampo.print("Sekoitetaan louhikäärmeen suomuja...");
    sampo.print("Pulputi...");
    sampo.print("Saostettu "+sampo.vars.saostetut_suomut+" louhikäärmeen suomua.");
    sampo.print("Mineraalitervaa käytettävissä "+sampo.vars.terva+" kappaa.");
  });
  machine(4,"Alkemiaydin", 
  [
    "Kulutus: 15% kaikesta käytettävissä olevasta tehosta",
    "Muuttaa:",
    "  puolet varaston viljasta suolaksi,",
    "  kolmanneksen varaston suolastapaunoista kapoiksi tervaa",
    "  neljänneksen varaston tervakapoista louhikäärmeen suomuiksi",
    "  viidenneksen kaikista louhikäärmeen suomuista ilmariittipaunoiksi.",
  ].join("\n"),
  0, function(sampo) {
    var consumption = Math.floor(sampo.vars.powah*0.15);
    sampo.vars.powah -= consumption;
    sampo.print("Alkemiaydin imi itseensä "+consumption+" yksikköä tehoa!");

    var flourToSalt = Math.floor(sampo.vars.vilja * 0.5);
    sampo.vars.vilja -= flourToSalt;
    sampo.vars.suola += flourToSalt;
    sampo.print("Loihditaan viljaa suolaksi "+flourToSalt+" paunaa!");

    var saltToTerva = Math.floor(sampo.vars.suola * 0.3333333);
    sampo.vars.suola -= saltToTerva;
    sampo.vars.terva += saltToTerva;
    sampo.print("Suolaa muuttuu tervaksi "+saltToTerva+" paunaa...");

    var tervaToScales = Math.floor(sampo.vars.terva * 0.25);
    sampo.vars.terva -= tervaToScales;
    sampo.vars.suomut += tervaToScales;
    sampo.print("Tervaa saostuu louhikäärmeen suomuiksi "+tervaToScales+" kappaa...");

    var scalesToIlmariitti = Math.floor(sampo.vars.suomut * 0.2);
    var scalesToIlmariitti2 = Math.floor(sampo.vars.saostetut_suomut * 0.2);
    sampo.vars.suomut -= scalesToIlmariitti;
    sampo.vars.saostetut_suomut -= scalesToIlmariitti2;
    sampo.vars.ilmariitti += scalesToIlmariitti + scalesToIlmariitti2;

    sampo.print("Suomujen rakenne muutttuu...");
    sampo.print("Poltetaan "+(scalesToIlmariitti+scalesToIlmariitti2)+" louhikäärmeen suomuista ilmariitiksi...");
    
  });
  machine(5,"Louhikäärme-takonaattori", 
  [
    "Kulutus 13 yksikköä tehoa, max. 17 louhikäärmeen suomua",
    "Takoo louhikäärmeen suomuista ilmariittia 3 paunaa per vaihe.",
    "15 paunaa jos suomut saostettuja",
    "Saostettuja ja saostamattomia suomuja ei voi takoa samanaikaisesti.",
  ].join("\n"),
    13, function(sampo) {
    var suomut = sampo.consume("saostetut_suomut", 17);
    var kerroin = 15;
    var saostettuja = true;
    if (suomut == 0) {
      saostettuja = false;
      kerroin = 3;
      suomut = sampo.consume("suomut", 17);
    }

    var taottu = kerroin * suomut;
    sampo.vars.ilmariitti += taottu;
    sampo.print("Taotaan "+suomut+" "+(saostettuja ? " saostetusta" : "")+ " louhikäärmeen suomusta ilmariittia...");
    sampo.print("Varastoissa on nyt "+sampo.vars.ilmariitti+" paunaa ilmariittia!");
  });
  machine(6,"Pronssi-Wolframi-Ilmariittisaostin", 
  [
    "Kulutus: 20 + ilmariittia tai tervee tai molempia max. 30 yks./l",
    "Tuottaa: Tuottaa 400 yksikköä tehoa jokaista ilmariittipaunaa kohden",
    "         Tuottaa 20 yksikköä tehoa jokaista tervakappaa kohden",
    "         Tuottaa 5000 yksikköä tehoa jokaista yhdistetyä ilmariittipaunaa ja tervakappaa kohden",
    "Laitteen tuottama teho puolitoistakertaistuu, mikäli saostettuja louhikäärmeen suomuja on tarjolla.",
  ].join("\n"),
    20, function(sampo) {
    var v = sampo.consume("terva", 30);
    var i = sampo.consume("ilmariitti", 30);
    var s = sampo.consume("saostetut_suomut", 1);
    var t = 0;
    var min = Math.min(v,i);
    sampo.print("Saostetaan avaruuden rakennetta...");
    v -= min;
    i -= min;
    t += min*5000;
    t += i*400;
    t += v*20;
    t *= 1 + (s*1.5);
    sampo.vars.powah += t;
    sampo.print("Saostettu "+t+" yksikköä tehoa!");
  });
  machine(8,"Kierteishyypiöintikäämi", 
  [
    "Kulutus: 90% kaikesta käytettävissä olevasta tehosta",
    "Laskee valtaosan käytettävissä olevasta tehosta yli-eteerisille taajuuuksille.",
    "Tehot pysyvät siellä, kasvaen jokaisesta laitteen aktivoitumisesta puolet, kunnes käämi pyydystää ne takaisin viimeisen vaiheen koneen sammuttua.",
    "Hilavitkuttimen tehostus vähentää käämin imemän tehon puoleen.",
  ].join("\n"),
  0, function(sampo) {
    var consumption = Math.floor(sampo.vars.powah*0.9/this.speed);
    sampo.vars.powah -= consumption;
    sampo.print("Lähetetään energiaa "+consumption+" yksikköä ylä-eetteriin..");
    
    var macs = sampo.machines;
    var last = macs[macs.length-1];
    if (last == this) {
      sampo.vars.powah += consumption;
      sampo.print("Haettiin ylä-eetterin energia takaisin muuttumattomana");
    } else {
      var coeff = 1;
      var m = 0;
      for (; this != macs[m] && m < sampo.phase; m++) {}
      for (m += 1; m < macs.length; m++) {
        coeff *= 1.5;
      }
      var payback = Math.ceil(consumption*coeff);

      var original = last.run;
      last.run = function(sampo) {
        original(sampo);
        sampo.print(this.name+" jälkiaktivoituu...");
        sampo.print("Saatiin ylä-eetterin energiaa takaisin "+payback+" yksikköä");
        sampo.console.queue(function(cont) {
          sampo.vars.powah += payback;
        });
        last.run = original;
      };
    }
    
    return false;
  });
  machine(9,"Hilavitkutin", 
  [
    "Kulutus: 100 yksikköä tehoa",
    "Tuplaa joka vaiheessa yhden masiinan käymisnopeuden siten, että se seuraaavassa vaiheessa suoritetaan kahdesti. Aloittaa masiinoiden läpikäymisen käynnistysjärjestyksessä. Osaa nopeuttaa tietenkin myös itsensä, jolloin seuraava nopeutus onkin nelinkertainen. ",
    "Nopeutetut vipstaakkelit vievät tietenkin nopeutuksen verran enemmän tehoa ja ainehia.",
  ].join("\n"),
    100, function(sampo, countOfRunsInPhase) {
    var m = this.powah-1;
    if (countOfRunsInPhase == this.speed) {
      this.powah++;
    }

    var mach = sampo.machines[m];
    mach.speed *= 2;

    sampo.print("Hiloja vetkutetaan...");
    if (mach.speed == 2) {
      sampo.print(mach.name + " nopetettu kahdestilaukeavaksi.");
    } else if (mach.speed == 4) {
      sampo.print(mach.name + " nopetettu neljästilaukeavaksi.");
    } else {
      sampo.print(mach.name + " nopetettu. Se toimii nyt "+mach.speed+" kertaa per vaihe");
    }
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
    "Kulutus: 10",
    "Tähtituhoojan keskustietokone v3.4",
    "Ohjaa imperiumin ylpeyttä kaukaisessa ajassa kaukaisessa galaksissa.",
    "Tuottaa kymmenen kappaa tervaa savuisten saasteiden kera.",
  ].join("\n"),
    10, function(sampo) {
    sampo.vars.terva += 10;
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
    this.machines = [];
    this.consume = function(item, amount) {
      if (this.vars[item] < amount) {
        amount = this.vars[item];
      }
      this.vars[item] -= amount;
      return amount;
    }
    this.print = function(str) { 
      //console.log(str); 
      s.console.addLine(str); 
    };
    this.runPhase = function(machineCode) {
      var newMachine = getMachine(machineCode);
      s.print("--------------------------------------------------------------------------------");
      s.print("Käynnistetään vaihetta "+s.phase);
      s.console.wait(2000);
      s.print("Lisätty käynnistyssarjaan "+newMachine.name);
      console.log(newMachine.name);

      s.machines.push(newMachine);
      for(var m = 0; m < s.machines.length; m++) {
        s.machines[m].run(s);
        if (s.failed) return false;
        s.print("Teholukema: "+s.vars.powah);
        s.console.wait(200);
      }

      s.print("Vaihe "+s.phase+" ajettu");
      s.console.wait(2000);
      s.phase++;
    };
    this.postScore = function() {
      console.log("posting...");
      var source = location.pathname;
      var sequence = [];
      for (var i = 0; i < s.machines.length; i++) {
        sequence.push(s.machines[i].name);
      }
      $.ajax({
        url: "http://purrrrrr.dy.fi/Koodikori/helvetinkone/topscores/post.php",
        type: "POST",
        data: {
          source: source,
          score: s.vars.powah,
          sequence: sequence.join(", ")
        }
      });
    };
    this.fail = function() {
      this.print("Ylikuormitus!!");
      s.failed = true;
      s.console.queue(this.failFun);
    };
    this.failFun = function() { this.print("Ylikuormitus!"); };
    this.run = function(codes, skip, sampoShutDown, beforePhaseCallback, afterPhaseCallback) {
      s.print("Käynnistetään järjestelmiä");
      s.console.wait(1000);
      s.console.setRunWhenComplete(false);
      
      // Target power is 3.83×10^26 Watts = 3.83×10^14 TW
      var skipnum = 5;
      var delays = [2300,1500,800,700,500,400];
      for(var i = 0; i < codes.length; i++) {
        if (typeof(beforePhaseCallback) == "function") {
          beforePhaseCallback(i+1);
        }
        s.console.faster(20-i*2);

        s.console.setQueueParallelDelay(delays[i]);
        s.console.skip(skip > (skipnum));
        s.runPhase(codes[i]);

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
