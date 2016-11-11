//Reference help from https://github.ncsu.edu/CSC-DevOps-Spring2015/ServersWorkshop

var needle = require("needle");
var os   = require("os");
var fs = require('fs');
var sleep = require('sleep');

var config = {};
config.token = "76b51a55b47db23c90ce7eadc79f821778a7d020d7afe0c835d97f2dbad6501f";  //Enter Digital Ocean token here

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
	}

};



//#3 Create an droplet with the specified name, region, and image

var name = "sgulati2"+os.hostname();
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
