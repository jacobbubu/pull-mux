import * as pull from 'pull-stream'
import { Mux } from '../src'

describe('mux', () => {
  it('create a namespaced stream from an object', (done) => {
    const streams = {
      a: pull.values([1, 2, 3]),
      b: pull.values([4, 5, 6]),
    }
    const source = new Mux(streams)
    pull(
      source,
      pull.collect(function (err, ary) {
        expect(err).toBeFalsy()
        expect(ary).toEqual([
          ['a', 1],
          ['b', 4],
          ['a', 2],
          ['b', 5],
          ['a', 3],
          ['b', 6],
        ])
        done()
      })
    )
  })

  it('add empty streams', (done) => {
    const streams = {
      a: pull.values([]),
      b: pull.values([]),
    }
    const source = new Mux(streams)
    pull(
      source,
      pull.collect(function (err, ary) {
        expect(err).toBeFalsy()
        expect(ary).toEqual([])
        done()
      })
    )
  })

  it('add a sub-stream later then the creation of Mux instance ', (done) => {
    const streams = {
      a: pull.values([1, 2, 3]),
    }
    const source = new Mux(streams)
    source.add('b', pull.values([4, 5, 6]))
    pull(
      source,
      pull.collect(function (err, ary) {
        expect(err).toBeFalsy()
        expect(ary).toEqual([
          ['a', 1],
          ['b', 4],
          ['a', 2],
          ['b', 5],
          ['a', 3],
          ['b', 6],
        ])
        done()
      })
    )
  })
})
