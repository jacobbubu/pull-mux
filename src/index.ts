import * as pull from 'pull-stream'
import { Event, MuxEvent } from './event'
import { Mux, Streams } from './mux'
import { Demux } from './demux'
import * as jsonSerializer from './json-serializer'

export interface Serializer {
  serialize: <In, Out>() => pull.Through<In, Out>
  parse: <In, Out>() => pull.Through<In, Out>
}

export interface MuxDemuxOptions {
  streams?: Streams
  wrapper?: 'raw' | 'json' | Serializer
}

const createMuxDemux = (targetDuplex: pull.DuplexThrough<any, any>, opts: MuxDemuxOptions = {}) => {
  const streams = opts.streams ?? {}
  const muxed = new Mux(streams)
  const wrapper = opts.wrapper ?? 'json'

  const rawSource = targetDuplex.source
  const rawSink = targetDuplex.sink
  const source =
    wrapper === 'raw'
      ? rawSource
      : wrapper === 'json'
      ? (pull(rawSource, jsonSerializer.parse()) as pull.Source<MuxEvent>)
      : pull(rawSource, wrapper.parse())

  const sink =
    wrapper === 'raw'
      ? rawSource
      : wrapper === 'json'
      ? pull(jsonSerializer.serialize(), rawSink)
      : pull(wrapper.serialize(), rawSink)

  const demuxed = new Demux()
  pull(muxed.source, sink)
  pull(source, demuxed.sink)

  return {
    muxed,
    demuxed,
  }
}

export { Event }
export { MuxEvent }
export { Mux }
export { Demux }
export { createMuxDemux }
