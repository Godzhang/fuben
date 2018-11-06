
const compileUtil = {
  text (node, vm, exp) {
    this.bind(node, vm, exp, 'text')
  },
  html (node, vm, exp) {
    this.bind(node, vm, exp, 'html')
  },
  model (node, vm, exp) {
    this.bind(node, vm, exp, 'model')

    let val = this._getVMVal(vm, exp)
    node.addEventListener('input', e => {
      let newValue = e.target.value
      if (val === newValue) return
      this._setVMVal(vm, exp, newValue)
      val = newValue
    })
  },
  bind (node, vm, exp, dir) {
    let updaterFn = updater[`${dir}Updater`]

    updaterFn && updaterFn(node, this._getVMVal(vm, exp))

    new Watcher(vm, exp, (value, oldValue) => {
      updaterFn && updaterFn(node, value, oldValue)
    })
  },
  eventHandler (node, vm, exp, dir) {
    let eventType = dir.split(':')[1]
    let cb= vm.methods && vm.methods[exp]

    if (eventType && cb) {
      node.addEventListener(eventType, cb.bind(vm), false)
    }
  },
  _getVMVal (vm, exp) {
    let val = vm
    exp = exp.split('.')
    exp.forEach(k => {
      val = val[k]
    })
    return val
  },
  _setVMVal (vm, exp, value) {
    let val = vm
    exp = exp.split('.')
    exp.forEach((k, i) => {
      if (i < exp.length - 1) {
        val = val[k]
      } else {
        val[k] = value
      }
    })
  }
}

const updater = {
  textUpdater (node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value
  },
  htmlUpdater (node, value) {
    node.innerHTML = typeof value === 'undefined' ? '' : value
  },
  modelUpdater (node, value, oldValue) {
    node.value = typeof value === 'undefined' ? '' : value
  }
}

function Compile (el, vm) {
  this.vm = vm
  this.el = document.querySelector(el)
  this.fragment = null
  this.init()
}

Compile.prototype = {
  init () {
    if (this.el) {
      this.fragment = this.nodeToFragment(this.el)
      this.compile(this.fragment)
      this.el.appendChild(this.fragment)
    } else {
      console.log('Dom元素不存在')
    }
  },
  nodeToFragment (el) {
    let fragment = document.createDocumentFragment()
    let child = el.firstChild
    while (child) {
      fragment.appendChild(child)
      child = el.firstChild
    }
    return fragment
  },
  compile (el) {
    let childNodes = el.childNodes
    Array.prototype.slice.call(childNodes).forEach(node => {
      let reg = /\{\{(.*)\}\}/
      let text = node.textContent

      if (this.isElementNode(node)) {
        this.compileElement(node)
      } else if (this.isTextNode(node) && reg.test(text)) {
        this.compileText(node, reg.exec(text)[1])
      }

      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  },
  compileElement (node) {
    let nodeAttrs = node.attributes
    Array.prototype.forEach.call(nodeAttrs, attr => {
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        let exp = attr.value
        let dir = attrName.substring(2)
        if (this.isEventDirective(dir)) {
          compileUtil.eventHandler(node, this.vm, exp, dir)
        } else {
          compileUtil[dir] && compileUtil[dir](node, this.vm, exp)
        }
        node.removeAttribute(attrName)
      }
    })
  },
  compileText (node, exp) {
    compileUtil.text(node, this.vm, exp)
  },
  isDirective (attr) {
    return attr.indexOf('q-') === 0
  },
  isEventDirective (dir) {
    return dir.indexOf('on') === 0
  },
  isElementNode (node) {
    return node.nodeType === 1
  },
  isTextNode (node) {
    return node.nodeType === 3
  }
}

