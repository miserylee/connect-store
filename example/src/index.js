import React from 'react';
import { render } from 'react-dom';
import Connector from '../../build';

const dataSource = {
  count: 0,
};
const logDataSource = {
  messages: [],
};

const View = ({ label, dataSource, delegate }) => {
  return (
    <div>
      {label}:
      <button onClick={delegate.dec}>-</button>
      {dataSource.count}
      <button onClick={delegate.inc}>+</button>
      <br/>
      <ul>{dataSource.messages.map((message, index) => (
        <li key={index}>{message}</li>
      ))}</ul>
      <button onClick={delegate.clearLog}>clear</button>
    </div>
  );
};

const logDelegate = {
  inc() {
    logDataSource.messages = ['Increased', ...logDataSource.messages];
  },
  dec() {
    logDataSource.messages = ['Decreased', ...logDataSource.messages];
  },
  clearLog() {
    logDataSource.messages = [];
  },
};

render(
  new Connector(View)
    .dataSource(dataSource)
    .dataSource(logDataSource)
    .delegate({
      inc() {
        dataSource.count += 1;
      },
      dec() {
        dataSource.count -= 1;
      },
    })
    .delegate(logDelegate)
    .render({ label: 'Counter' }),
  document.getElementById('root'),
);

class Counter {
  count = 0;

  inc() {
    this.count += 1;
  }

  dec() {
    this.count -= 1;
  }
}

render(
  new Connector(View)
    .connect(new Counter())
    .dataSource(logDataSource)
    .delegate(logDelegate)
    .render({ label: 'Counter-2' }),
  document.getElementById('root2'),
);
