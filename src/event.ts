export type MuxEvent = [string, any]

function Event(type: string, data: any): MuxEvent {
  return [type, data]
}
Event.type = function (ev: MuxEvent) {
  return ev[0]
}
Event.data = function (ev: MuxEvent) {
  return ev[1]
}

export { Event }
