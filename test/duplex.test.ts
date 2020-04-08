import * as pull from 'pull-stream'
import * as net from 'net'
const toPull = require('stream-to-pull-stream')
import { Mux, Demux, createMuxDemux } from '../src'

describe('duplex', () => {
  it('mux/demux', (done) => {
    const streams = {
      a: pull.values([1, 2, 3]),
      b: pull.values([4, 5, 6]),
    }
    const muxed = new Mux(streams)
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
            collected['b'].length === 3
          ) {
            expect(collected).toEqual({
              a: [1, 2, 3],
              b: [4, 5, 6],
            })
            done()
          }
        }
      })(type)

      pull(source, pull.drain(drained))
    })

    pull(muxed, demuxed)
  })

  it('createMuxDemux', (done) => {
    const streams = {
      a: pull.values([1, 2, 3]),
      b: pull.values([4, 5, 6]),
    }

    const PORT = 9988

    interface ToPull<In, Out> {
      source: pull.Source<In>
      sink: pull.Sink<Out>
    }

    const serverCollected: any = {}
    const clientCollected: any = {}

    const mayBeFinished = () => {
      if (
        Object.keys(serverCollected).length === 2 &&
        Object.keys(clientCollected).length === 1 &&
        serverCollected['a'].length === 3 &&
        serverCollected['b'].length === 3 &&
        clientCollected['server'].length === 3
      ) {
        server.close(() => done())
        done()
      }
    }

    const server = net
      .createServer((socket) => {
        const client = toPull.duplex(socket) as ToPull<Buffer, Buffer>

        const { muxed, demuxed } = createMuxDemux(client)

        muxed.add('server', pull.values([10, 11, 12]))
        demuxed.on('open', (source: pull.Source<any>, type: string) => {
          const drained = (function (t) {
            return (res: string) => {
              serverCollected[t] = serverCollected[t] || []
              serverCollected[t].push(res)
              mayBeFinished()
            }
          })(type)

          pull(source, pull.drain(drained))
        })
      })
      .listen(PORT, () => {
        console.log(`Server is listening on port: ${PORT}`)
      })

    const rawClient = net.createConnection({ port: PORT }, () => {
      const client = toPull.duplex(rawClient) as ToPull<Buffer, Buffer>
      const { muxed, demuxed } = createMuxDemux(client, { streams: { a: pull.values([1, 2, 3]) } })

      muxed.add('b', pull.values([4, 5, 6]))
      demuxed.on('open', (source: pull.Source<any>, type: string) => {
        const drained = (function (t) {
          return (res: string) => {
            clientCollected[t] = clientCollected[t] || []
            clientCollected[t].push(res)
            mayBeFinished()
          }
        })(type)
        pull(source, pull.drain(drained))
      })
    })
  })
})
