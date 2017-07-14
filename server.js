var path = require('path');
var express = require('express');
var app = express();  
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var alVanUrl = 'K9NOANBYPCG01XOM';
var url = 'mongodb://yes:yes@ds153412.mlab.com:53412/stocks';
var getUrlFront='https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=';
var getUrlBack='&apikey=K9NOANBYPCG01XOM'; 
var request = require("request");
//https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=GE&apikey=K9NOANBYPCG01XOM
//MSFT&interval=15min&time_period=10&series_type=close&apikey=demo

app.use(express.static(__dirname));

var server = app.listen(process.env.PORT, function() {
    console.log('Server listening');
});

const io = require('socket.io')(server);

io.on('connection', (socket) => {
  
  console.log('someone connected!');
  
  socket.on("remove stocks",(data)=>{
      console.log("someone needs updated stocks!");
      //send new stocks to other clients as props
      console.log(data.stocks);
      console.log(data.remove);
      socket.broadcast.emit("all new stocks", data);
      //edit database to change it to the new props
      MongoClient.connect(url,function(err,db){
            if(err)
            { 
              console.log(err);
            }
            var characters = db.collection('stocks');
            var findOne = (db,err) => {
              if(err)
               console.log(err);
              console.log("updating database"); 
              characters.update({name: "stocks"},{$pull: {stocks: data.remove}},()=>{db.close();}); 
            }
            findOne(db);
      });
      
  });
  
  socket.on("get new stock", (data)=>{
       var callback = ()=> {
         //io.sockets.emit();
       }
       request(getUrlFront + data.symbol + getUrlBack, (err,res,body)=>{
          console.log(data.symbol);
          if(err)
            console.log(err);
          var thisObj = JSON.parse(body);
          socket.emit({"message" : {message: "getting data..."}});
          if(thisObj.hasOwnProperty("Error Message"))
            socket.emit("message",{message: "Sorry " + data.symbol + " not found."});
          else  
          {
            io.sockets.emit("push data", {symbol: data.symbol.toUpperCase(), data: body});
            console.log("attempting connection to database");
                  MongoClient.connect(url,function(err,db){
                        if(err)
                        { 
                          console.log(err);
                        }
                        var characters = db.collection('stocks');
                        var findOne = (db,err) => {
                          if(err)
                          {  
                            console.log("error");
                            console.log(err.toString());
                          }
                          else
                          {
                            var dataUp = data.symbol.toUpperCase();
                            characters.update({name: "stocks"},{$push : {stocks: dataUp}},()=>{db.close()});
                          }  
                        }
                        findOne(db);
                  });
          }  
       })

  });
  
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
		                  
		                  socket.emit("get stock data", stockObj);
		              };
		              socket.emit("get stocks", data[0]);    
		              data[0].stocks.forEach((item)=>{
                          request(getUrlFront + item + getUrlBack, (err,res,body)=>{
                             if(err)
                               console.log(err);
                             else
                             {
                               stockObj.push(body);     
                               console.log("ding" + stockObj.length);  
                               socket.emit("loaded",{loaded: 1});
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