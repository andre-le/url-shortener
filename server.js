// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectID;
var dburl = process.env.MONGOLAB_URI;

app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

//Contruct a shorten URL
app.get("/getURL/*", function(req, res){
  var url = req.url.substring(8);
  var regex = /https?:\/\/(.+)/
  if(!regex.test(url)){
    res.send({error: "Wrong url format"});
  }
  else{
    MongoClient.connect(dburl, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    }
    else {
      console.log('Connection established');

      var urls = db.collection('urls');
      urls.find({
        "url": url
      }).toArray(function(err, data){
        console.log(data);
        if (data.length == 0) {
          urls.insert({"url": url}, function(err, data){
            if (err)
              console.log("Cannot insert data");
            res.send({"original_url": url, "short_url": "https://urls-shortener.glitch.me/go/" + data.ops[0]["_id"]});
          });
        }
        else{
          res.send({"original_url": url, "short_url": "https://urls-shortener.glitch.me/go/" + data[0]["_id"]});
        }
      });
    }
    
  });
  }
});

//Redirect the shortened URL to the right page
app.get("/go/:id", function (request, response) {
  var id = request.params.id;
  findUrl(id, response);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

//find the data that has the correspond id in the database
function findUrl(id, res){
  MongoClient.connect(dburl, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    }
    else {
      console.log('Connection established');

      var urls = db.collection('urls');
      urls.find({
        "_id": ObjectId(id)
      }).toArray(function(err, data){
        res.redirect(data[0].url);
      });
    }
    
  });

}