var http = require('http');
var os = require('os');
var fs = require('fs');

var redis = require('redis');

var client = redis.createClient(6379, '127.0.0.1', {});

var accountSid = 'AC7b4b7c18fa9a83c08e7d7476d75f2c39';
var authToken = '24161dc834e4f9d2628e8a23e185f9f3';
var twiClient = require('twilio')(accountSid, authToken);

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
  
  //cpuAverage();
  //console.log(os.loadavg());
  var memLoad = memoryLoad();
  var cpuLoad = cpuLoadAll();
  console.log("Memory: ", memLoad);
  console.log("CPU: ", cpuLoad);

  if (memLoad > 90) {
  twiClient.messages.create({
        from:+8312695745,
        to: +9842426510,
        body: "You just sent an SMS from Node.js using Twilio!"
        }, function(err, message) {
      if(err) {
    console.error(err.message);
    }
});
  
    client.get("memFlag", function(err, value) {
      if (value == 0) {
        console.log("ALERT! Excess memory usage. Notified Ops Team. here");
        twiClient.messages.create({
        from:+8312695745,
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

  if (cpuLoad > 60) {
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

}, 2000);




