import * as pull from 'pull-stream'
import * as net from 'net'
import { createMuxDemux } from '../src'
import { delay } from './interval'

const toPull = require('stream-to-pull-stream')

interface ToPull<In, Out> {
  source: pull.Source<In>
  sink: pull.Sink<Out>
}

const rnd = () => Math.floor(Math.random() * 500)

const PORT = 9988
net
  .createServer((socket) => {
    const client = toPull.duplex(socket) as ToPull<Buffer, Buffer>

    const { muxed, demuxed } = createMuxDemux(client)

    muxed.add('server', pull.values([10, 11, 12]))
    demuxed.on('open', (source: pull.Source<any>, type: string) => {
      pull(
        source,
        delay(rnd()),
        pull.drain((res) => {
          console.log('From client:', { type, res })
        })
      )
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
    pull(
      source,
      delay(rnd()),
      pull.drain((res) => {
        console.log('From server:', { type, res })
      })
    )
  })
})
