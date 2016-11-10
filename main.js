var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
// REDIS
//var client = redis.createClient(6379, '127.0.0.1', {})
var startPort=parseInt(process.argv[2])
var redis = require('redis')
var client = redis.createClient(6379, '127.0.0.1', {})

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

// PART 3: upload and meow
app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   //console.log(req.body) // form fields
   //console.log(req.files) // form files

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

app.get('/meow', function(req, res) {
 	{	
	  	res.writeHead(200, {'content-type':'text/html'});
 		//if (err) throw err
		client.rpop("images",function (err,imagedata){
			if (err) throw err;
		
			if (imagedata)
			{	
			
 		        res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
			}
			res.end();
 		})
 	}
 })


// PART1: get/set methods
app.get('/set', function(req, res) {
    client.set("mykey", "this message will self-destruct in 10 seconds")
    client.expire("mykey", 10)
    res.send("mykey has been set")
})

app.get('/get', function(req, res) {
    client.get("mykey", function(err, value) {
        res.send(value)
    });
})

app.get('/recent', function(req, res) {
    client.lrange("recenturl", 0, 4, function(err, urls) {
        res.send("Recently visited: "+ urls);
    });
});


app.get('/spawn', function(req, res) {
	startPort=startPort+1
var server = app.listen(startPort, function () 
 //var server = app.listen(process.argv[2], function () 
 {
   var host = server.address().address
   var port = server.address().port
   client.lpush("serverlist",startPort)
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
        var rand = Math.floor((Math.random() * value) + 0);
        console.log(rand)
        client.lindex('serverlist', rand, function(err, index){
        client.lrem('serverlist', 1, index);    
});
   res.send("A server has been killed.");
    });      
    });

// HTTP SERVER
 //var port = process.argv.splice(2)[0];
 //var server = app.listen(3000, function () 
 var server = app.listen(process.argv[2], function () 
 {

   var host = server.address().address
   var port = server.address().port
   client.lpush("serverlist",port)
   console.log('Example app listening at http://%s:%s', host, port)

})
