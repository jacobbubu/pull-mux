import * as pull from 'pull-stream'
import { Demux, Event } from '../src'

const muxed = pull.values([Event('a', 'a1'), Event('a', 'a2'), Event('b', 'b1'), Event('a', 'a3')])
const demuxed = new Demux()
demuxed.on('open', (source: pull.Source<any>, type: string) => {
  console.log(`source(${type}) is created`)
  pull(
    source,
    pull.drain((res) => {
      console.log('demuxed sub-stream', { type, res })
    })
  )
})
demuxed.on('close', (source: any, type: string) => {
  console.log(`source(${type}) is closed`)
})

pull(muxed, demuxed)
