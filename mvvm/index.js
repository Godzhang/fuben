function Queen (options) {
  this.data = options.data
  this.methods = options.methods

  Object.keys(this.data).forEach(key => {
    this.proxyKeys(key)
  })

  observe(this.data)
  new Compile(options.el, this)
  // el.innerHTML = this.data[exp]
  // new Watcher(this, exp, function (value) {
  //   el.innerHTML = value
  // })
  // return this
  options.mounted && options.mounted.call(this)
}

Queen.prototype = {
  proxyKeys (key) {
    let self = this
    Object.defineProperty(this, key, {
      enumerable: false,
      configurable: true,
      get: function proxyGetter () {
        return self.data[key]
      },
      set: function proxySetter (newVal) {
        self.data[key] = newVal
      }
    })
  }
}