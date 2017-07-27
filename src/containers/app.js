import React from 'react';
import ReactDOM from 'react-dom';
import FacebookLogin from 'react-facebook-login';
import $ from "jquery";
import * as d3 from 'd3';

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
      <div className="text-center container-fluid">
      {this.state.data==undefined ? "Getting Data (There's a lot of it)" :
      <LineChart data={this.state.data}/>}
      </div>
      </div>);
  }
}

//https://github.com/topheman/d3-react-experiments/blob/master/src/components/d3/TransitionMultiLineChart/TransitionMultiLineChart.js

class AllNewLineChart extends React.Component
{
  
}

//below with help from https://medium.com/@Elijah_Meeks/interactive-applications-with-react-d3-f76f7b3ebc71
class LineChart extends React.Component {
   constructor(props){
      super(props)
      this.state = {data: this.props.data};
      this.createBarChart = this.createBarChart.bind(this)
   }
   componentDidMount() 
   {
      this.createBarChart()
   }
   componentDidUpdate() 
   {
      this.createBarChart()
   }
   createBarChart() {
      const node = this.node

      var someData = this.state.data;
          
          //Lots of help from https://codepen.io/celar/pen/qREyMq
          
          var svg = d3.select(node),
              margin = {top: 20, right: 80, bottom: 30, left: 50},
              width = svg.attr("width") - margin.left - margin.right,
              height = svg.attr("height") - margin.top - margin.bottom,
              g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          
          var x = d3.scaleLinear().range([0, width]),
              y = d3.scaleLinear().range([height, 0]),
              z = d3.scaleOrdinal(d3.schemeCategory10);
          
          var line = d3.line()
              .x((d)=>x(d.x))
              .y((d)=>y(d.y));
          
          x.domain([4,0]);
          
            y.domain([
              d3.min(someData, (c)=> d3.min(c.values,(d)=>d.y)),
              d3.max(someData, (c)=> d3.max(c.values,(d)=>d.y))
            ]);
          
            z.domain(someData.map((c)=>c.name));
          
            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));
          
            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y))
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("fill", "#000")
                .text("Temperature, ºF");
          
            var stock = g.selectAll(".stock")
              .data(someData)
              .enter().append("g")
                .attr("class", "stock");
          
            stock.append("path")
                .attr("class", "line")
                .attr("d", (d)=> line(d.values))
                .style("stroke", (d)=> z(d.name));

      
   }
render() {
      return( 
         <svg ref={node => this.node = node} width={500} height={500}> </svg>);
      }
}