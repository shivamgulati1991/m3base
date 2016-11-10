var http = require('http');
var os = require('os');
var fs = require('fs');

var redis = require('redis');

var client = redis.createClient(6379, '127.0.0.1', {});

 var accountSid = 'AC3ec0213c3387d90bcf030260875d32d2';
var authToken = '75e1b8787a6d1181298a0378051b120a';
var twiClient = require('twilio')(accountSid, authToken);
//var i=1;
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
  console.log("Memory utilization: ", memLoad);
  console.log("CPU usage: ", cpuLoad);

  if (memLoad > 90) {

  twiClient.messages.create({
        from:+2024369391,
        to: +9842426510,
        body: "Application Live alert! Memory overload."
        }, function(err, message) {
      if(err) {
    console.error(err.message);
    }
});

    //client.set("proxy_flag", 0);
  } 

  if (cpuLoad > 50) {
    twiClient.messages.create({
        from:+2024369391,
        to: +9842426510,
        body: "Application Live alert! CPU usage exceeding the threshold."
        }, function(err, message) {
      if(err) {
    console.error(err.message);
    }
});
  }

},2000);