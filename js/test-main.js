$(function() {
  var sampo_c = $("#sampoconsole").console(40, 10);
  var sampo = new Sampo(sampo_c);

  var machineList = $('#vipstaakkelit');
  var machines = getMachines();
  $.each(machines, function() {
    var cont = $('<div class="vipstaakkeli col-md-4 panel panel-default"></div>');
    cont.append("<h2>"+this.name+"</h2>");
    cont.append("<p>Koodi: "+this.code+"</p>");
    cont.append("<div class='pre' >"+this.description+"</div>");
    machineList.append(cont);
  });
  var statusList = $('#sampostatus');
  $.each(sampo.vars, function(i, v) {
    if (i == "powah") i = "teho";
    statusList.append("<div>"+i+" = "+v+"</div>");
  });

  var controls = $("#controls");
  
  $.each(machines, function(i) {
    var opt = $('<div class="mini-vipstaakkeli">'+this.name+' </div>');
    opt[0].code = this.code;
    opt.append("<a href='#'>Siirrä &gt;&gt;</a>");
    controls.find("#olemassa").append(opt);
  });
  $( "#olemassa, #kaytossa" ).sortable({
    connectWith: '.sortable'
  });
  $( "#olemassa div a" ).live("click", function() {
    $(this).text("<< Siirrä");
    $("#kaytossa").append($(this).parent());
    return false;
  });
  $( "#kaytossa div a" ).live("click", function() {
    $(this).text("Siirrä >>");
    $("#olemassa").append($(this).parent());
    return false;
  });

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
      $("#results").append(cont);
    });
    $("#powah").text("Lopullinen teho "+sampo.vars.powah+"GW");
  }

  function sampoShutDown() {
    sampo.print("Käyttöteho: "+sampo.vars.powah);
  }

  $("#aja").click(function() {
    var codes = [];
    $("#kaytossa .mini-vipstaakkeli").each(function(i) {
      codes.push(this.code);
    });
    console.log(codes);
    if (codes.length != 6) {
      alert("Laita tasan kuusi vipstaakkelia Sampoon!");
      return;
    }

    sampo = new Sampo(sampo_c);
    runSampo(codes);
  });
});
