$(function() {
  var sampo_c = $("#sampoconsole").console(40, 10);
  var sampo = new Sampo(sampo_c);
  var codes = [];
  var machines = getMachines();
  
  addMachineDescriptions();
  laitaStatus($('#sampostatus'));
  addControls();
  
  runSampo = function(codes) {
    $("#results").empty();
    sampo.failFun = sampoShutDown;
    //var codes = [15, 1, 8, 14, 7, 3];
    sampo.run(codes, 0, sampoShutDown, function(i) {
      $("#sampoconsole").empty();
      sampo.print("<h1>Vaihe "+i+"</h1>");
    }, function(i) {
      var cont = $('<div class="col-md-4 panel panel-default"></div>');
      cont.append($("#sampoconsole > *"));
      cont.append($("<strong>Sammon status</strong>"));
      cont.append(laitaStatus($('<div class="panel panel-default"></div>')));
      $("#results").append(cont);
    });
    $("#powah").text("Lopullinen teho "+sampo.vars.powah+"TW");
  }

  function sampoShutDown() {
    sampo.print("Käyttöteho: "+sampo.vars.powah);
  }

  $("#aja").click(function() {
    if (codes.length != 6) {
      alert("Laita tasan kuusi vipstaakkelia Sampoon!");
      return;
    }
    
    getMachines = generateMachineFunction();
    sampo = new Sampo(sampo_c);
    runSampo(codes);
  });

  function addMachineDescriptions() {
    var machineList = $('#vipstaakkelit');
    $.each(machines, function() {
      var cont = $('<div class="vipstaakkeli col-md-4 panel panel-default"></div>');
      cont.append("<h2>"+this.name+" (laite nro. "+this.code+")</h2>");
      cont.append("<div class='pre' >"+this.description+"</div>");
      machineList.append(cont);
    });
  }
  function laitaStatus(lista) {
    $.each(sampo.vars, function(i, v) {
      if (i == "powah") i = "teho";
      lista.append("<div>"+i+" = "+v+"</div>");
    });
    return lista;
  }
  function addControls() {
    $.each(machines, function(i) {
      var opt = $('<div id="vipstaakkeli'+this.code+'" class="mini-vipstaakkeli">'+this.name+' </div>');
      opt[0].code = this.code;
      opt.append("<a href='#'><span>Siirrä</span></a>");
      $("#olemassa").append(opt);
    });
    if (typeof(localStorage.sampoCodes) == 'string') {
      $.each(localStorage.sampoCodes.split(","), function(i, code) {
        $("#kaytossa").append($("#vipstaakkeli"+code));
      });
      updateCodes();
    }
    $( "#olemassa, #kaytossa" ).sortable({
      connectWith: '.sortable'
    });
    $( "#olemassa div a" ).live("click", function() {
      $("#kaytossa").append($(this).parent());
      updateCodes();
      return false;
    });
    $( "#kaytossa div a" ).live("click", function() {
      $("#olemassa").append($(this).parent());
      updateCodes();
      return false;
    });
    function updateCodes() {
      codes = [];
      $("#kaytossa .mini-vipstaakkeli").each(function(i) {
        codes.push(this.code);
      });
      localStorage.sampoCodes = codes;
      console.log(codes);
    }
    $("#kaytossa").bind('sortupdate', updateCodes);
  }
});
