import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import { MyProvider } from './Context'
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
    <MyProvider>
        < App style={{ backgroundColor: 'red' }}></ App>
    </MyProvider>
    , document.getElementById('root'));
