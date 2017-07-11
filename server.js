var path = require('path');
var express = require('express');
var app = express();  
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var alVanUrl = 'K9NOANBYPCG01XOM';
var url = 'mongodb://yes:yes@ds153412.mlab.com:53412/stocks';
var getUrlFront='https://www.alphavantage.co/query?function=EMA&symbol=';
var getUrlBack='&interval=15min&time_period=10&series_type=close&apikey=' + 'K9NOANBYPCG01XOM'; 
var request = require("request");

//MSFT&interval=15min&time_period=10&series_type=close&apikey=demo

app.use(express.static(__dirname));

var server = app.listen(process.env.PORT, function() {
    console.log('Server listening');
});

const io = require('socket.io')(server);

io.on('connection', (socket) => {
  
  console.log('someone connected!');
  
  setInterval(()=>{
    socket.emit("hot poppers", {"words" : new Date().getTime()});
  },1000);
  
  socket.on("needs stocks",()=>{
            console.log("hey! Someone needs stocks!");
            MongoClient.connect(url,function(err,db){
            if(err)
            { 
              console.log(err);
            }
            //console.log(req.params.username);
            var characters = db.collection('stocks');
		    var findOne = (db,err) =>
		    {
		      characters.find({},{})
		      .toArray((err,data) => {
		          if(err)
		            console.log(err);
		          else  
		          {
		            var stockObj = [];        
		              var callback = ()=>{
		                  console.log("finished!");
		                  socket.emit("get stocks", data[0]);    
		                  socket.emit("get stock data", stockObj);
		              };
		              
		              data[0].stocks.forEach((item)=>{
                          request(getUrlFront + item + getUrlBack, (err,res,body)=>{
                             if(err)
                               console.log(err);
                             else
                             {
                               stockObj.push(body);     
                               console.log("ding" + stockObj.length);  
                               if(stockObj.length==data[0].stocks.length)
                                 callback();
                             }
                          });
		              });  
		              
		          }
		          
		      });
		    }
		    findOne(db,()=>{db.close();});
        });
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  
 
});