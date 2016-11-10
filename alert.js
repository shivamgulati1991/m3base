var http = require('http');
var os = require('os');
var fs = require('fs');

var redis = require('redis');

var client = redis.createClient(6379, '127.0.0.1', {});

 var accountSid = 'AC3ec0213c3387d90bcf030260875d32d2';
var authToken = '75e1b8787a6d1181298a0378051b120a';
var twiClient = require('twilio')(accountSid, authToken);
int i=1;
function memoryLoad()
{
  var total = os.totalmem();
  var load = os.totalmem() - os.freemem();
  var percentage = (load/total)*100;
  return percentage.toFixed(2);
}

function cpuLoadAll () {
  var loads = os.loadavg();
  var percentage = loads[0];
  percentage = percentage * 100;
  return percentage.toFixed(2);;
}

setInterval( function () 
{
  var memLoad = memoryLoad();
  var cpuLoad = cpuLoadAll();
  console.log("Memory: ", memLoad);
  console.log("CPU: ", cpuLoad);

  if (memLoad > 90) {

  twiClient.messages.create({
        from:+2024369391,
        to: +9842426510,
        body: "Application Live alert! CPU or memory overload."
        }, function(err, message) {
      if(err) {
    console.error(err.message);
    }
});

    client.get("memFlag", function(err, value) {
      if (value == 0) {
        console.log("ALERT! Excess memory usage. Notified Ops Team. here");
        twiClient.messages.create({
        from:+2024369391,
        to: +9842426510,
        body: "You just sent an SMS from Node.js using Twilio!"
        }, function(err, message) {
      if(err) {
    console.error(err.message);
    }
});

        client.set("memFlag", 1);
      } else {
        console.log("ALERT! Excess memory usage. Notified Ops Team.");
      }
    });
    //client.set("proxy_flag", 0);
  } 

  if (cpuLoad > 50) {
    twiClient.messages.create({
        from:+2024369391,
        to: +9842426510,
        body: "Application Live alert! CPU or memory overload."
        }, function(err, message) {
      if(err) {
    console.error(err.message);
    }
});
    client.get("cpuFlag", function(err, value) {
      console.log("Flag value: ", value);
      if (value == 0) {
        //console.log("CPU Load too much. Sending alert");
        twiClient.sendMessage({
            body: "EXCESS CPU USAGE",
            to: "+9842426510",
            from: "+8312695745"
        }, function(err, message) {

        });
        client.set("cpuFlag", 1);
      } else {
        console.log("ALERT! Excess CPU Usage. Notified Ops Team");
      }
    });
    client.set("proxy_flag", 0);
  }

},2000);