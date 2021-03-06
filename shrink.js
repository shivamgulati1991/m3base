var http = require('http');
var os = require('os');
var fs = require('fs');
var needle = require("needle");


//var i=1;
var redis = require('redis');

var client = redis.createClient(6379, '127.0.0.1', {});

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

var config = {};
config.token = "---";  //Enter Digital Ocean token here

var headers =
{
  'Content-Type':'application/json',
  Authorization: 'Bearer ' + config.token
};

// Documentation for needle:
// https://github.com/tomas/needle

var client =
{
  listDroplet: function(onResponse)
  {

    needle.get("https://api.digitalocean.com/v2/droplets/"+dropletId, {headers:headers}, onResponse)
  },

  createDroplet: function (dropletName, region, imageName, onResponse)
  {
    var data = 
    {
      "name": dropletName,
      "region":region,
      "size":"512mb",
      "image":imageName,
      // Id to ssh_key already associated with account.
      "ssh_keys":["b1:0d:08:ec:85:cd:e4:ce:89:1f:9a:ab:45:75:f9:90"],
      "backups":false,
      "ipv6":false,
      "user_data":null,
      "private_networking":null
    };

    console.log("Attempting to create: "+ JSON.stringify(data) );

    needle.post("https://api.digitalocean.com/v2/droplets", data, {headers:headers,json:true}, onResponse );
  },

    switchoffDroplet: function (onResponse)
  {
    var data = 
    {
      "type": "power_off"
    };

    console.log("Preparing for scaling." );

    needle.post("https://api.digitalocean.com/v2/droplets/33119433/actions", data, {headers:headers,json:true}, onResponse );
  },

      switchonDroplet: function (onResponse)
  {
    var data = 
    {
      "type": "power_on"
    };

    needle.post("https://api.digitalocean.com/v2/droplets/33119433/actions", data, {headers:headers,json:true}, onResponse );
  },

  resizeDroplet: function (onResponse)
  {
    var data = 
    {
      "type": "resize",
      "size":"512mb"
    };

    console.log("Server shrink is progress.. ");

    needle.post("https://api.digitalocean.com/v2/droplets/33119433/actions", data, {headers:headers,json:true}, onResponse );
  }

};



//#3 Create an droplet with the specified name, region, and image

/*var name = "sgulati2"+os.hostname();
var region = "nyc1"; // Fill one in from #1
var image = "ubuntu-14-04-x64"; // Fill one in from #2
var dropletId;
client.createDroplet(name, region, image, function(err, resp, body)
{
  //console.log(body);
  // StatusCode 202 - Means server accepted request.
  if(!err && resp.statusCode == 202)
  {
    dropletId=body.droplet.id;
    console.log("Droplet ID: "+dropletId);


    setTimeout(function(){
    client.listDroplet(function(error, response)
    {
    var data = response.body;

    if( response.headers )
    {
      console.log( "Calls remaining", response.headers["ratelimit-remaining"] );
    }
    if( data.droplet )
    {
      var ip=data.droplet.networks.v4[0].ip_address;
      console.log("IP Address: "+ip);
      console.log("Now writing to inventory");  
         var inventorydata = "do ansible_ssh_host=" + ip + " ansible_ssh_user=root ansible_ssh_private_key_file=~/.ssh/id_rsa\n";
         fs.appendFileSync('inventory', inventorydata, encoding='utf8');
      console.log("finished writing to inventory file");
    }
    });
  },8000);
  }
});
*/
var resized=0;

  var memLoad = memoryLoad();
  var cpuLoad = cpuLoadAll();
  
  //console.log("CPU usage: ", cpuLoad);

  if (memLoad < 50) {

  if(resized==0){
  setTimeout(function() {
        /*client.switchoffDroplet(function(error, respo)
      {
    if(!error)
    {
      console.log("Please wait..")
    }
    });*/
    console.log("Memory utilization low. Server is preparing to shrink resources.");
}, 2000);
setTimeout(function() {
    client.resizeDroplet(function(error, response)
    {
    //console.log(response);
    if(!error)
    {
      console.log("Please wait, resource allocation is being reduced.")
    }
    });

resized=1
}, 5000);


setTimeout(function() {
            client.switchonDroplet(function(error, respo)
      {
    if(!error)
    {
      //console.log("The server resources have been reduced.")
    }
    });
}, 60000);
}

  } 

