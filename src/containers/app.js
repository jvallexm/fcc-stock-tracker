import React from 'react';
import ReactDOM from 'react-dom';
import FacebookLogin from 'react-facebook-login';
import $ from "jquery";
import rd3 from 'rd3';
var createReactClass = require('create-react-class');
var propTypes = require('prop-types')
//import io from 'socket.io-client';
//const socket=io();

const LineChart = rd3.LineChart;

export default class App extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = 
    {
      title: "",
      stocks: {stocks: ["getting data from server.."]},
      data: []
    }
  }
  componentWillMount()
  {
    var title = "";
    this.props.socket.on('hot poppers',(data)=>{
     // console.log(data.words);
      title = data.words;
      this.setState({title: title});
    });
    this.props.socket.emit("needs stocks",{needs: "stocks"});
    this.props.socket.on("get stocks",(data)=>{
      console.log(data);
      console.log("stock symbols get");
      this.setState({stocks: data});
    });
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
        var theKeys = Object.keys(toObj["Time Series (1min)"]);
        //console.log("keys length: " + theKeys.length);
        //console.log(toObj["Time Series (1min)"][theKeys[0]]["1. open"]);
        for(var j=0;j<theKeys.length;j++)
        {
          
          var floaty = parseFloat(toObj["Time Series (1min)"][theKeys[j]]["1. open"]);
          dataObj.values.push({
            
            x: j, 
            y: floaty
            
            });
        }
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
      <div>
      <h1>Hot poppers</h1>
      <h1>{this.state.title}</h1>
      
      <li>
        {this.state.stocks.stocks.map((d,i)=>
          <ul key={d}>{d}</ul>
        )}
      </li>
      {this.state.data==[] ? <h1>"Fetching dongles"</h1> :
      <LineChart
        legend={true}
        data={this.state.data}
        width='100%'
        height={400}
        viewBoxObject={{
          x: 0,
          y: 0,
          width: 500,
          height: 400
        }}
        title="Line Chart"
        yAxisLabel="Altitude"
        xAxisLabel="Elapsed Time (sec)"
        domain={{x: [100,0], y: [0,1000]}}
        gridHorizontal={true}
      />}
      
      </div>);
  }
}