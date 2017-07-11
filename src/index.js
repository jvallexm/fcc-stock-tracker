import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import io from 'socket.io-client';
const socket=io();

import App from './containers/app.js'

ReactDOM.render(<App  socket={socket}/>, document.getElementById('root'));
