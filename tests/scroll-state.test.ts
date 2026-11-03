import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getChapter,
  getMenuIndex,
  scrollDestination,
} from '../src/components/experience/scroll-state'

test('chapter selection follows forward and reverse scrolling at every handoff', () => {
  for (const [progress, chapter] of [
    [0, 0],
    [0.17, 1],
    [0.355, 2],
    [0.535, 3],
    [0.695, 4],
    [1, 4],
    [0.45, 2],
    [0.05, 0],
  ]) {
    assert.equal(getChapter(progress), chapter)
  }
})

test('horizontal navigation handles an edited menu length and reaches the last item', () => {
  assert.equal(getMenuIndex(0.76, 3), 0)
  assert.equal(getMenuIndex(0.9, 3), 1)
  assert.equal(getMenuIndex(1, 3), 2)
  assert.equal(getMenuIndex(1, 7), 6)
  assert.equal(getMenuIndex(1, 1), 0)
  assert.equal(getMenuIndex(1, 0), 0)
})

test('invalid and out-of-range progress cannot navigate beyond the scrollable journey', () => {
  assert.equal(getChapter(Number.NaN), 0)
  assert.equal(getChapter(-1), 0)
  assert.equal(getChapter(2), 4)
  assert.equal(scrollDestination(100, 9000, 1000, 0.25), 2100)
  assert.equal(scrollDestination(100, 9000, 1000, 5), 8100)
  assert.equal(scrollDestination(100, 500, 1000, 1), 100)
})
