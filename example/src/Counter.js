import React from 'react';

class CounterStore {
  count = 0;

  constructor(base = 0) {
    this.count = base;
    // setInterval(this.inc.bind(this), 1000);
  }

  inc() {
    setImmediate(() => {
      this.count += 1;
      this.count += 1;
    });
  }

  dec() {
    this.count -= 1;
  }

  incAsync() {
    setTimeout(_ => {
      this.count += 1;
    }, 1000);
  }
}

const CounterView = ({ label, dataSource, delegate }) => {
  console.log('render');
  return (
    <div>
      <span>{label}:</span>
      <button onClick={delegate.dec}>-</button>
      <span>{dataSource.count}</span>
      <button onClick={delegate.inc}>+</button>
      <button onClick={delegate.incAsync}>...+</button>
    </div>
  );
};

export {
  CounterStore,
  CounterView,
};
