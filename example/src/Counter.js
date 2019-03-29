import React from 'react';

class CounterStore {
  count = 0;

  constructor (base = 0) {
    this.count = base;
    setInterval(this.inc.bind(this), 1000);
  }

  inc () {
    this.count += 1;
  }

  dec () {
    this.count -= 1;
  }

  incAsync () {
    setTimeout(_ => {
      this.count += 1;
    }, 1000);
  }
}

const CounterView = ({ label, count, onInc, onDec, onIncAsync, newItemText, onUpdateNewItemText, onAdd }) => {
  return (
    <div>
      <span>{label}:</span>
      <button onClick={onDec}>-</button>
      <span>{count}</span>
      <button onClick={onInc}>+</button>
      <button onClick={onIncAsync}>...+</button>
      <div>
        <input value={newItemText} onChange={e => onUpdateNewItemText(e.target.value)}/>
        <button onClick={onAdd}>+</button>
      </div>
    </div>
  );
};

export {
  CounterStore,
  CounterView,
};