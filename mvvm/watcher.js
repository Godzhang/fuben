function Watcher (vm, exp, cb) {
  this.cb = cb
  this.vm = vm
  this.exp = exp
  this.value = this.get()
}

Watcher.prototype = {
  update () {
    this.run()
  },
  run () {
    let value = this._getVMVal(this.vm, this.exp)
    let oldVal = this.value
    if (value !== oldVal) {
      this.value = value
      this.cb.call(this.vm, value, oldVal)
    }
  },
  get () {
    Dep.target = this  //缓存自己
    // let value = this.vm.data[this.exp]
    let value = this._getVMVal(this.vm, this.exp)
    Dep.target = null
    return value
  },
  _getVMVal (vm, exp) {
    let val = vm
    exp = exp.split('.')
    exp.forEach(k => {
      val = val[k]
    })
    return val
  }
}

