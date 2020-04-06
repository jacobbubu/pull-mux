import * as pull from 'pull-stream'
import * as net from 'net'
const toPull = require('stream-to-pull-stream')
import { createMuxDemux } from '../src'

interface ToPull<In, Out> {
  source: pull.Source<In>
  sink: pull.Sink<Out>
}

const PORT = 9988
net
  .createServer((socket) => {
    const client = toPull.duplex(socket) as ToPull<Buffer, Buffer>
    const { muxed, demuxed } = createMuxDemux(client)

    muxed.add('server', pull.values([10, 11, 12]))
    demuxed.on('open', (source: pull.Source<any>, type: string) => {
      pull(
        source,
        pull.drain((res) => {
          console.log('From client:', { type, res })
        })
      )
    })
    demuxed.start()
  })
  .listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
  })

const rawClient = net.createConnection({ port: PORT }, () => {
  const client = toPull.duplex(rawClient) as ToPull<Buffer, Buffer>
  const { muxed, demuxed } = createMuxDemux(client, { a: pull.values([1, 2, 3]) })

  muxed.add('b', pull.values([4, 5, 6]))
  demuxed.on('open', (source: pull.Source<any>, type: string) => {
    pull(
      source,
      pull.drain((res) => {
        console.log('From server:', { type, res })
      })
    )
  })

  demuxed.start()
})
