var http = require('http');
var os = require('os');
var fs = require('fs');
var needle = require("needle");


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

var resized=0;


  setTimeout(function() {
        client.switchoffDroplet(function(error, respo)
      {
    if(!error)
    {
      console.log("Please wait..")
    }
    });
}, 2000);

setTimeout(function() {
            client.switchonDroplet(function(error, respo)
      {
    if(!error)
    {
      //console.log("The server resources have been reduced.")
    }
    });
}, 60000);


