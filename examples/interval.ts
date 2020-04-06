import * as pull from 'pull-stream'

export function interval(ms: number = 1000) {
  ms = ms >= 0 ? ms : 0
  let counter = 0
  const read: pull.Source<number> = (abort, cb) => {
    if (abort) {
      return cb(abort)
    }
    setTimeout(() => {
      cb(null, counter++)
    }, ms)
  }
  return read
}

export function delay<T>(ms: number = 1000) {
  ms = ms >= 0 ? ms : 0
  return pull.asyncMap((data: T, cb: pull.SourceCallback<T>) => {
    setTimeout(() => {
      cb(null, data)
    }, ms)
  })
}

export function collect(fn?: (res: any[]) => void) {
  return pull.collect((_, data: any[]) => fn?.(data))
}
