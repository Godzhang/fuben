function defineReactive (data, key, val) {
  observe(val)
  let dep = new Dep()
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get () {
      if (Dep.target) {
        dep.addSub(Dep.target)
      }
      return val
    },
    set (newVal) {
      if (val === newVal) return
      val = newVal
      console.log(`属性${key}已经被监听了，现在值为: "${newVal.toString()}"`)
      dep.notify()
    }
  })
}
Dep.target = null

function Dep () {
  this.subs = []
}
Dep.prototype = {
  addSub (sub) {
    this.subs.push(sub)
  },
  notify () {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}

function observe (data) {
  if (!data || typeof data !== 'object') {
    return
  }
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key])
  })
}
