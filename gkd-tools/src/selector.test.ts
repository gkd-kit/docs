import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseSelector } from './selector.ts';
import {
  SelectorSyntaxException,
  SelectorTypeException,
} from '@gkd-kit/selector';

test('accepts valid selectors and regular expressions', () => {
  for (const source of ["[text='OK']", "[text~='.*跳过.*']", '[id=null]']) {
    assert.doesNotThrow(() => parseSelector(source));
  }
});

test('preserves selector 0.6 syntax and type diagnostics', () => {
  assert.throws(
    () => parseSelector('['),
    (error: unknown) => {
      assert.ok(error instanceof SelectorSyntaxException);
      assert.equal(typeof error.index, 'number');
      return true;
    },
  );
  assert.throws(
    () => parseSelector('[unknownProperty=1]'),
    (error: unknown) => {
      assert.ok(error instanceof SelectorTypeException);
      assert.equal(error.kind.name, 'UnknownIdentifier');
      return true;
    },
  );
});

test('rejects invalid syntax, types and regular expressions', () => {
  for (const source of ['[', '[unknownProperty=1]', "[text~='[']"]) {
    assert.throws(() => parseSelector(source));
  }
});
