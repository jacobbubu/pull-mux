import * as pull from 'pull-stream'
import { Mux } from '../src'

const streams = {
  a: pull.values([1, 2, 3]),
  b: pull.values([4, 5, 6]),
}

const muxed = new Mux(streams)
muxed.add('c', pull.values([7, 8, 9]))

pull(
  muxed.source,
  pull.collect((_, ary) => {
    console.log(ary)
  })
)
