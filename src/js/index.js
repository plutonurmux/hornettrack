import React, { Component } from 'react';
import ReactDom from 'react-dom'
import App from 'component/App'
import { Provider } from 'mobx-react';


if (module.hot) {
    module.hot.accept();
  }

ReactDom.render(<App/>, document.getElementById("root"))
