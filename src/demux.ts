import * as pull from 'pull-stream'
import { EventEmitter } from 'events'
import { pushable } from '@jacobbubu/pull-pushable'
import { MuxEvent } from './event'

export class Demux extends EventEmitter {
  private _streams: Record<string, pull.Source<any>> = {}
  private _sink: (read: pull.Source<MuxEvent>) => void

  constructor() {
    super()
    const self = this
    this._sink = function (read: pull.Source<MuxEvent>) {
      read(null, function next(err, event) {
        if (err) {
          // clean up
          for (const type in self._streams) {
            ;(self._streams[type] as any).end(err)
          }
          return
        } else {
          const [type, data] = event as MuxEvent
          if (!(type in self._streams)) {
            // New event type, we need to create a new sink
            const subSource = pushable<any>(
              (function (t: string) {
                return (err: any) => {
                  delete self._streams[t]
                  self.emit('close', subSource, t, err, self._streams)
                }
              })(type)
            )
            self._streams[type] = subSource
            self.emit('open', subSource, type, self._streams)
          }
          ;(self._streams[type] as any).push(data)
        }
        read(null, next)
      })
    }
  }

  get sink() {
    return this._sink
  }
}
