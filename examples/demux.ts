import * as pull from 'pull-stream'
import { Demux } from '../src/demux'
import { Event } from '../src/event'

const muxed = pull.values([Event('a', 'a1'), Event('a', 'a2'), Event('b', 'b1'), Event('a', 'a3')])
const dx = new Demux(muxed)
dx.on('open', (source: pull.Source<any>, type: string) => {
  console.log(`type of source(${type}) is created`)
  pull(
    source,
    pull.drain((res) => {
      console.log('demuxed sub-stream', { type, res })
    })
  )
})
dx.on('close', (source: any, type: string) => {
  console.log('closed source', type)
})

dx.start()
