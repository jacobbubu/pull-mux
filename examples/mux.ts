import * as pull from 'pull-stream'
import { Mux, Demux } from '../src'
import { delay } from './interval'

const streams = {
  a: pull.values([1, 2, 3]),
  b: pull.values([4, 5, 6]),
}

const mux = new Mux(streams)

const client = pull(mux.source, delay(1e3))

mux.add('c', pull.values([7, 8, 9]))

const demuxed = new Demux(client)

demuxed.on('open', (source: pull.Source<any>, type: string) => {
  console.log(`type of source(${type}) is created`)
  pull(
    source,
    pull.drain((res) => {
      console.log({ type, res })
    })
  )
})
demuxed.on('close', (source: any, type: string) => {
  console.log('closed source', type)
})

demuxed.start()
