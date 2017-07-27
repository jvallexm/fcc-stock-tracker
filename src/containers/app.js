import React from 'react';
import ReactDOM from 'react-dom';
import FacebookLogin from 'react-facebook-login';
import $ from "jquery";
var rd3 = require('react-d3');
var LineChart = rd3.LineChart;

export default class App extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = 
    {
      title: "",
      stocks: {stocks: []},
      data: undefined,
      message: "",
      search: "",
      loading: 0
    }
    this.removeOne = this.removeOne.bind(this);
    this.addOne = this.addOne.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e)
  {
    this.setState({search: e.target.value});
  }
  removeOne(num)
  {
    var newStocks = [];
    for(var i=0;i<this.state.stocks.stocks.length;i++)
    {
      if(i!=num)
       newStocks.push(this.state.stocks.stocks[i]);
    }
    var newData = [];
    for(var j=0;j<this.state.data.length;j++)
    {
      if(this.state.stocks.stocks[num]!=this.state.data[j].name)
      { 
        newData.push(this.state.data[j]);
      }
    }
    //console.log(newData);
    this.props.socket.emit("remove stocks",
        {
          stocks: newStocks,
          remove: this.state.stocks.stocks[num] 
        }
        
    );
    this.setState({stocks: {stocks: newStocks},data: newData, message: ""});
  }  
  addOne(symbol)
  {
    //console.log(this.state.stocks.stocks);
    console.log(this.state.stocks.stocks.indexOf(symbol.toUpperCase()));
    if(this.state.stocks.stocks.indexOf(symbol.toUpperCase())>-1)
      this.setState({message: "Looks like " + symbol.toUpperCase() + " is already in here!"});
    else
    {
      this.props.socket.emit("get new stock", {symbol: symbol});
      this.setState({search: "", message: "Searching..."});
    }  
  }
  componentWillMount()
  {
    if(this.state.data==undefined)
      this.props.socket.emit("needs stocks",{needs: "stocks"});
    this.props.socket.on("get stocks",(data)=>{
      console.log(data);
      console.log("stock symbols get");
      this.setState({stocks: data});
    });
    this.props.socket.on("loaded",(data)=>{
      this.setState({loading: this.state.loading+1});
    });
    this.props.socket.on("message", (data)=>{
      this.setState({message: data.message});
    })
    this.props.socket.on("all new stocks",(data)=>{
      console.log("trying to get new stock data");
      console.log(data);
      var toObj = data;
      console.log(toObj);
      var newData = [];
      for(var i=0;i<this.state.data.length;i++)
      {
        if(this.state.data[i].name != data.remove)
        newData.push(this.state.data[i]);
      }
      this.setState({data: newData, stocks: {stocks: data.stocks}})
    });
    this.props.socket.on("push data",(data)=>{
      var toObj = JSON.parse(data.data);
      var dataObj = {
        name: data.symbol,
        values: []
      }
        var theKeys = Object.keys(toObj["Weekly Time Series"]);
        console.log("keys length: " + theKeys.length);
        //console.log(toObj["Time Series (1min)"][theKeys[0]]["1. open"]);
        for(var j=0;j<100;j++)
        {
          
          var floaty = parseFloat(toObj["Weekly Time Series"][theKeys[j]]["4. close"]);
          dataObj.values.push({
            
            x: j, 
            y: floaty
            
            });
        }
        var newStateData = this.state.data;
        newStateData.push(dataObj);
        this.state.stocks.stocks.push(data.symbol);
        this.setState({message: "Got " + data.symbol + " from server!",data: newStateData});
    })
    this.props.socket.on("get stock data",(data)=>{
      //https://yang-wei.github.io/rd3/docs/new/charts/lineChart.html
      var dataArr=[];
      for(var i=0;i<data.length;i++)
      {
        //"Technical Analysis: EMA"
        var toObj = JSON.parse(data[i]);
        var dataObj = {
          name: toObj["Meta Data"]["2. Symbol"],
          values: []
        };
        //console.log(dataObj.name);
        var theKeys = Object.keys(toObj["Weekly Time Series"]);
        //console.log("keys length: " + theKeys.length);
        //console.log(toObj["Time Series (1min)"][theKeys[0]]["1. open"]);
        for(var j=0;j<100;j++)
        {
          
          var floaty = parseFloat(toObj["Weekly Time Series"][theKeys[j]]["4. close"]);
          dataObj.values.push({
            
            x: j, 
            y: floaty
            
            });
        }
        //if(i==0)
       //  console.log(dataObj);
        //console.log("values length for " + dataObj.name +" :"+ dataObj.values.length);
        dataArr.push(dataObj);
       //console.log(dataObj.name);
        
      }
      console.log("data get" + data.length);
      this.setState({data: dataArr});
    });
  }
  render()
  {
    return(
      <div className="text-center container-fluid">
      <h1>Aww Yeah Stock Tracker!</h1>
        { this.state.stocks.stocks.length > 0 && this.state.loading<this.state.stocks.stocks.length  && this.state.data == undefined
          ? <h2>Loading: {Math.floor((this.state.loading/this.state.stocks.stocks.length)*10000)/100}%</h2>
          : ""
        }
    
      <h3>{this.state.message}</h3>
      {this.state.data!=undefined
      ?
      <div>
        Add a new stock:
        <input value={this.state.search} onChange={this.handleChange} />
        <button className = "btn well" onClick={()=>this.addOne(this.state.search)}> Submit </button>
      </div>: ""}
      {this.state.data!=undefined
      ?
      <div>
        <h4>Current Stocks (Click to Remove)</h4>
        {this.state.stocks.stocks.map((d,i)=>
             <button className="btn well btn-danger"
                     onClick={()=>this.removeOne(i)}>{d} <i className="fa fa-close"/></button>
        )}
      </div>
      :""}
      <center>
      {this.state.data==undefined ? "Getting Data (There's a lot of it)" :
      <LineChart legend={true}
                 data={this.state.data}
                 width={500}
                 height={300}
                 title="Stock Prices by Week"/>}
      </center>
      </div>);
  }
}
