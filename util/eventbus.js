class EventBus {
  constructor () {
    this._events = this._events || new Map()
    this._maxListeners = this._maxListeners || 10
  }

  emit (type, ...args) {
    let handler = this._events.get(type)
    if (!handler) return

    for (let i = 0, len = handler.length; i < len; i++) {
      if (args.length > 0) {
        handler[i].apply(this, args)
      } else {
        handler[i].call(this)
      }
    }

    return true
  }

  on (type, fn) {
    let handler = this._events.get(type)
    if (!handler) {
      this._events.set(type, [fn])
      return
    }
    if (handler.length === this._maxListeners) return
    handler.push(fn)
  }

  off (type, fn) {
    let handler = this._events.get(type)

    if (!handler || !handler.length) return false

    let pos = handler.indexOf(fn)
    if (pos !== -1) {
      handler.splice(pos, 1)
    }
  }

  remove (type) {
    this._events.delete(type)
  }

  _getList () {
    return this._events
  }
}

// let event = new EventBus()
// const fn1 = () => console.log(1)
// const fn2 = () => console.log(2)
// const fn3 = () => console.log(3)

// event.on('type', fn1)
// event.on('type', fn2)
// event.on('type', fn3)
// event.emit('type')
// console.log(event._getList())
