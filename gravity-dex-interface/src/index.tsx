import * as React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './pages/App';
import { HashRouter } from 'react-router-dom'
import { Provider } from "react-redux";
import createStore from "./store/index";
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, FixedGlobalStyle } from './theme'
// FixedGlobalStyle, ThemedGlobalStyle
/* <React.StrictMode></React.StrictMode> */
const store = createStore();
ReactDOM.render(
  <>
    <Provider store={store}>
      <FixedGlobalStyle />
      <ThemeProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </ThemeProvider>
    </Provider>
  </>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
