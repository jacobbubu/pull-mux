import * as pull from 'pull-stream'
import split from '@jacobbubu/pull-split'
import { MuxEvent } from './event'
import { Mux, Streams } from './mux'
import { Demux } from './demux'

const stringify = () => {
  return pull.map((data) => {
    return Buffer.from(JSON.stringify(data) + '\n')
  })
}

const parse = () => {
  return pull.map((value: string) => {
    let res
    try {
      res = JSON.parse(value)
    } catch (err) {
      res = null
    }
    return res
  })
}

const createMuxDemux = <In, Out>(targetDuplex: pull.DuplexThrough<In, Out>, streams?: Streams) => {
  const muxed = new Mux(streams)

  const demuxed = new Demux(
    (pull(
      targetDuplex.source,
      split(),
      pull.filter((d) => !!d),
      parse()
    ) as any) as pull.Source<MuxEvent>
  )
  pull(muxed.source, stringify(), targetDuplex.sink)
  return {
    muxed,
    demuxed,
  }
}

export { MuxEvent }
export { Mux }
export { Demux }
export { createMuxDemux }
