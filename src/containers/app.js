import React from 'react';
import ReactDOM from 'react-dom';
import FacebookLogin from 'react-facebook-login';
import $ from "jquery";
//import io from 'socket.io-client';
//const socket=io();

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
      console.log("data get" + data.length);
      this.setState({data: data});
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
          <ul>{d}</ul>
        )}
      </li>
      </div>);
  }
}