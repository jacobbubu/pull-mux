import * as pull from 'pull-stream'
import { Demux, Event } from '../src'

describe('demux', () => {
  it('create a namespaced stream from an object', (done) => {
    const muxed = pull.values([
      Event('a', 'a1'),
      Event('a', 'a2'),
      Event('b', 'b1'),
      Event('a', 'a3'),
    ])
    const demuxed = new Demux()
    const collected: Record<string, string[]> = {}

    demuxed.on('open', (source: pull.Source<any>, type: string) => {
      const drained = (function (t) {
        return (res: string) => {
          collected[t] = collected[t] || []
          collected[t].push(res)
          if (
            Object.keys(collected).length === 2 &&
            collected['a'].length === 3 &&
            collected['b'].length === 1
          ) {
            expect(collected).toEqual({
              a: ['a1', 'a2', 'a3'],
              b: ['b1'],
            })
            done()
          }
        }
      })(type)

      pull(source, pull.drain(drained))
    })

    pull(muxed, demuxed)
  })
})
