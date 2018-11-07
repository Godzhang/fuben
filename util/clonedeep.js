const isType = (target, type) => {
  let targetType = Object.prototype.toString.call(target).slice(8, -1)
  return targetType.toLowerCase() === type.toLowerCase()
}

const getRegExp = reg => {
  let flags = ''
  if (reg.global) flags += 'g'
  if (reg.ignoreCase) flags += 'i'
  if (reg.multiline) flags += 'm'
  return flags
}

const clonedeep = obj => {
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) return obj

  let res

  if (isType(obj, 'Array')) {
    res = []
    for (let i = 0, len = obj.length; i < len; i++) {
      res[i] = clonedeep(obj[i])
    }
  } else if (isType(obj, 'RegExp')) {
    res = new RegExp(obj.source, getRegExp(obj))
    if (obj.lastIndex) res.lastIndex = obj.lastIndex
  } else if (isType(obj, 'Date')) {
    res = new Date(obj.getTime())
  } else if (isType(obj, 'Object')) {
    res = {}
    for (let key in obj) {
      res[key] = clonedeep(obj[key])
    }
  } else if (typeof obj === 'function') {
    res = new Function(`return ${obj.toString()}`)
  } else {
    res = obj
  }
  return res
}

// let obj = {
//   a: 1,
//   b: () => {console.log(1)},
//   c: new RegExp('a', 'mig'),
//   d: [1, 2, 3],
//   e: null,
//   f: undefined
// }

// let newObj = clonedeep(obj)
// console.log(newObj)
// console.log(newObj.a === obj.a)
// console.log(newObj.b === obj.b)
// console.log(newObj.c === obj.c)
// console.log(newObj.d === obj.d)
