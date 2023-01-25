import { Socket } from 'socket.io-client'
export default class TimeSyncClient {
  offset: number
  socket: Socket
  loop
  constructor(socket: Socket) {
    this.socket = socket
    this.offset = 0
    this.updateOffset()
    this.loop = setInterval(() => {
      this.updateOffset()
    }, 1000)
    // set up listener
    this.socket.on('timesync', (offset) => {
      this.offset = offset
      // console.log('updated offset', this.offset)
    })
  }
  // update offset
  updateOffset() {
    this.socket.emit('timesync', Date.now())
  }
  // get current time
  now() {
    const now = new Date()
    // console.log('offset', this.offset)
    // console.log('time before', now.getTime())
    now.setTime(now.getTime() + this.offset)
    return now.getTime()
  }
  // stop updating
  destroy() {
    clearInterval(this.loop)
  }
}