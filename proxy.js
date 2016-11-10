http = require('http');
httpProxy = require('http-proxy');
var express = require('express');
var sioc = require('socket.io-client');
var os = require('os');

var interfaces = os.networkInterfaces();

var proxy = httpProxy.createProxyServer({});

var canary_status = false;
var i = 0;
var count=1;

var prodServer = "67.205.141.247";
var canaryServer = "159.203.183.176";

var socket = sioc('http://' + canaryServer + ':4000');

socket.on("heartbeat", function(client) {
    canary_status = client.status;
    if (canary_status) {
        //i++;
        console.log("Canary server failed. All requests will be sent to production server.");
    }
});

var server = http.createServer(function(req, res) {

    var port = 3000;
    var tar = "http://" + prodServer + ":3000"; 
    if ((count%3 == 0 ) && (!canary_status)) {
      	port = 3000;
        tar = "http://" + canaryServer + ":3000"; 
        console.log("Forwarding re-routed to Canary server - " + canaryServer + ":" + port);
	count++;

    } else {
        port = 3000;
        target = "http://" + prodServer + ":3000"; 
        console.log("Request sent to Production Server - " + prodServer + ":" + port);
	count++;
    
    }

    proxy.web(req, res, {
        target: tar
    });

});

console.log("listening on port 5000")
server.listen(5000);
