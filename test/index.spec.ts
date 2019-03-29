import * as assert from 'assert';
import hello from '../src';

describe('Say hello', () => {
  it('to world should ok', () => {
    assert(hello('world') === 'Hello, world');
  });
});
