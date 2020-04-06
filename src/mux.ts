import * as pull from 'pull-stream'
import many from '@jacobbubu/pull-many'
import { Event, MuxEvent } from './event'

const map = pull.map

export type Streams = Record<string, pull.Source<any>>

export class Mux {
  private _muxed: pull.Source<MuxEvent>
  constructor(private _streams: Streams = {}) {
    const names = Object.keys(this._streams)
    const namespaced = names.map((name) => {
      const stream = this._streams[name]
      return pull(
        stream,
        map((data) => Event(name, data))
      )
    })
    this._muxed = many(namespaced)
  }

  get source() {
    return this._muxed
  }

  add(name: string, stream: pull.Source<any>) {
    if (!name) {
      throw new Error('name required')
    }
    if (!stream) {
      throw new Error('source required')
    }

    const newSource = pull(
      stream,
      map((data) => Event(name, data))
    )
    ;(this._muxed as any).add(newSource)
  }
}
