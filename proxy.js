http = require('http');
httpProxy = require('http-proxy');
var express = require('express');
var sioc = require('socket.io-client');
var os = require('os');

var interfaces = os.networkInterfaces();

var proxy = httpProxy.createProxyServer({});

var canary_fail = false;

var i = 0;

var ipStable = "67.205.141.247";
var ipCanary = "159.203.183.176";

var socket = sioc('http://' + ipCanary + ':4006');

// var socket = sioc('http://localhost:4006');

socket.on("heartbeat", function(client) {
    canary_fail = client.status;
    if ((canary_fail == true) && (i == 0)) {
        i++;
        console.log("Canary Server Failed.");
    }
});

var server = http.createServer(function(req, res) {

    var port = 3000;
    var tar = "http://" + ipStable + ":3000"; 
    var percent = Math.floor((Math.random() * 10) + 1);
    console.log("Number: " + percent);

    if ((percent > 7) && (!canary_fail)) {
      	port = 3001;
        tar = "http://" + ipCanary + ":3000"; 
        console.log("Forwarding request to [CANARY - " + ipCanary + ":" + port + "].");

    } else {
        port = 3000;
        target = "http://" + ipStable + ":3000"; 
        console.log("Forwarding request to [STABLE - " + ipStable + ":" + port + "].");
    
    }

    proxy.web(req, res, {
        target: tar
    });

});

console.log("listening on port 5050")
server.listen(5050);
