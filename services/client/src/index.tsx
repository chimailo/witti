import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { MuiThemeProvider, CssBaseline } from '@material-ui/core';
import reportWebVitals from './reportWebVitals';
import { theme } from './lib/theme';

const queryClient = new QueryClient();

const render = () => {
  const App = require('./components/App').default;

  ReactDOM.render(
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
          <ReactQueryDevtools />
        </QueryClientProvider>
      </React.StrictMode>
    </MuiThemeProvider>,
    document.getElementById('root')
  );
};

render();

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./components/App', render);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
