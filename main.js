var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var http = require('http');
var os = require('os');
var app = express()
var sio = require('socket.io')
// REDIS

var startPort=parseInt(process.argv[2])
var redis = require('redis')
var client = redis.createClient(6379, '127.0.0.1', {})

canary_status = false;

var appCanary = http.createServer(function (req, res) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end();
    })
  , io = sio.listen(appCanary);
///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) 
{
	console.log(req.method, req.url);

	// ... INSERT HERE.
		client.lpush("recenturl", req.url, function(err, reply) {
        client.ltrim("recenturl", 0, 9);
    });

	next(); // Passing the request to the next handler in the stack.
});

function memoryLoad()
{
  var total = os.totalmem();
  var load = os.totalmem() - os.freemem();
  var percentage = (load/total)*100;
  return percentage.toFixed(2);
}

// PART 3: upload and meow
app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
	  		
	  		client.rpush('images',img);
		});
	}

   res.status(204).end()
 }]);

app.get('/undefined', function(req, res) {
    canary_status=true
    console.log("Alert raised. Canary server stopped.")
});

app.get('/meow', function(req, res) {
   client.get('mykey', function(err, value){
    if(value=='ON')
  {   
  client.lrange('image', 0, 0, function(err, imagedata) {
    if (imagedata == "") {
      res.send("No images to show !")
    }
    else {
      res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
    }
    
    client.lpop('image', function(err, value) {
    })
    res.end();
  });
}
else
res.send("Sorry! This functionality is disabled right now.")

})
    
})

// PART1: get/set methods
app.get('/set', function(req, res) {
    client.set("mykey", "ON")
    client.expire("mykey", 10)
    res.send("mykey has been set")
})

app.get('/get', function(req, res) {
    client.get("mykey", function(err, value) {
        res.send(value)
    });
})

// PART2: recent method
app.get('/recent', function(req, res) {
    client.lrange("recenturl", 0, 4, function(err, urls) {
        res.send("Recently visited: "+ urls);
    });
});

// PART24: spawn/destroy/listservers method
app.get('/spawn', function(req, res) {
	startPort=startPort+1
var server = app.listen(startPort, function () 
 {
   var host = server.address().address
   var port = server.address().port
   client.lpush("serverlist",startPort) //push the port to server list
   console.log('Now listening at http://%s:%s', host, port)
});
	res.send("New server: "+startPort)
});

app.get('/listservers', function(req, res) {
    client.lrange("serverlist", -100, 100, function(err, value) {
        res.send("Servers available: "+value)
    });
})

app.get('/destroy', function(req, res) {   
    client.LLEN("serverlist", function(err, value) {       
        console.log("Length: "+ value)
        //generate a random number
        var rand = Math.floor((Math.random() * value) + 0);
        //send the index to console
        console.log(rand)
        client.lindex('serverlist', rand, function(err, index){
        client.lrem('serverlist', 1, index);    //remove the index value from list
});
   res.send("A server has been killed.");
    });      
    });

// HTTP SERVER
 var server = app.listen(process.argv[2], function () 
 {

   var host = server.address().address
   var port = server.address().port
   client.lpush("serverlist",port)
   console.log('Example app listening at http://%s:%s', host, port)

})
 
appCanary.listen(4000);


setInterval( function () 
{
  var memLoad = memoryLoad();
  //console.log("Memory utilization: ", memLoad);

  if (memLoad > 85) {
    canary_status=true
  console.log("ALERT! Memory overload. Canary Server will be stopped.");
  } 


},6000);