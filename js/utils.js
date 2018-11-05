//获取本周第一天
const getThisWeek = () => {
  let date = new Date()
  let day = date.getDay() || 7
  date.setDate(date.getDate() - day)
  return date
}
//获取本月第一天
const getThisMonth = () => {
  let date = new Date()
  date.setDate(1)
  return date
}
//获取今天零时
const getToday = () => {
  let date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}
//日期格式化输出
const dateFormatter = (date, format) => {
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),  //三个月之前的时间
    'S+': date.getMilliseconds()
  }
  format = format.replace(/y+/, match => (date.getFullYear() + '').substr(4 - match.length))
  for (let k in o) {
    let prefix = k === 'S+' ? '000' : '00'
    format = format.replace(new RegExp(k), match => {
      return match.length === 1 ? o[k] : (prefix + o[k]).substr(('' + o[k]).length)
    })
  }
  return format
}

//根据年数格式化为year年month个月
const getDurationByYear = (duration) => {
  let NumberReg = /(\d+)\.\d*/
  let match = (duration + '').match(NumberReg)
  if (match) {
    let year = parseInt(match[1])
    let month = duration - year
    if (year === 0) {
      return `${Math.ceil(month * 12)}个月`
    } else {
      return `${year}年${Math.ceil(month * 12)}个月`
    }
  } else {
    return `${duration}年`
  }
}

//根据秒数格式化为year年month个月
const getDurationByMs = (ms) => {
  let durationMs = ms
  let oneYearSeconds = 365 * 24 * 60 * 60
  let oneMonthSeconds = 30 * 24 * 60 * 60

  let year = Math.floor(durationMs / oneYearSeconds)
  let month = Math.ceil((durationMs - year * oneYearSeconds) / oneMonthSeconds)
  if (year === 0) return `${month}个月`
  if (month > 0) {
    return `${year}年${month}个月`
  } else {
    return `${year}年`
  }
}

const clone = (object, ignoreUndefined = false, ignoreNull = false) => {
  // primary
  if(!object || typeof object !== 'object') return object
  // array-like
  if (_.isArrayLike(object)) {
    let r = _.map(object, item => clone(item, ignoreUndefined, ignoreNull))
    if (ignoreUndefined) r = r.filter(data => data !== undefined)
    if (ignoreNull) r = r.filter(data => data !== null)
    return r
  }
  if (!_.isPlainObject(object)) return object
  // object
  let res = {}
  Object.keys(object).forEach(key => {
    if (!(ignoreUndefined && object[key] === undefined) && !(ignoreNull && object[key] === null)) {
      res[key] = clone(object[key], ignoreUndefined, ignoreNull)
    }
  })
  return res
}

const equals = (a, b) => {
  if (a === b) return true
  if (!a || !b || typeof a !== 'object') return false
  if (_.isArrayLike(a)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (!equals(a[i], b[i])) return false
    return true
  }
  if (!_.isPlainObject(a) || !_.isPlainObject(b)) return false
  for (let key of Object.keys(a)) {
    if(!b.hasOwnProperty(key) || !equals(a[key], b[key])) return false
  }
  for (let key of Object.keys(b)) {
    if(!a.hasOwnProperty(key)) return false
  }
  return true
}

// current 当前页码
const getPage = (list, current, pagesize) => {
  if (!list || !list.length) return []
  if (current && typeof current === 'object') {
    pagesize = current.pagesize
    current = current.current
  }
  if(!current || current < 1) current = 1
  pagesize = pagesize || 20
  let max = Math.ceil(list.length / pagesize)
  if (current > max) current = max
  return list.slice((current - 1) * pagesize, current * pagesize)
}

// const decimalAdjust = (type, value, exp) => {
//   if (typeof exp === 'undefined' || +exp === 0) return Math[type](value)
// }

// const percentage = (input, dec, empty) => {
//   if (typeof dec === 'string') {
//     [empty, dec] = [dec, empty]
//   }
//   if (input === undefined || input === null || isNaN(Number(input))) return empty
//   if (!dec) dec = 1
//   return decimalAdjust('round', Number(input) * 100, -Number(dec)) + '%'
// }

//生成指定位数的随机数
const randomNumber = (length = 2) => {
  let code = Math.floor(Math.random() * Math.pow(10, length)) + ''
  while (code.length < length) code = '0' + code
  return code
}

const extend = (...arguments) => {
  let i = 1,
      length = arguments.length,
      options, src, copy, deep,
      target = arguments[0] || {}

  if (typeof target === 'boolean') {
    deep = target
    target = arguments[1] || {}
    i = 2
  }

  if (typeof target !== 'object' && typeof target !== 'function') {
    target = {}
  }

  if (length === i) {
    return
  }

  for (; i < length; i++) {
    if ((options = arguments[i]) !== null) {
      for (let key in options) {
        src = target[key]
        copy = options[key]

        if (src === copy) {
          continue
        }

        if (deep && copy && (_.isPlainObject(copy) || Array.isArray(copy))) {
          if (_.isPlainObject(copy)) {
            src = src && _.isPlainObject(src) ? src : {}
          }
          if (Array.isArray(copy)) {
            src = src && _.isPlainObject(src) ? src : []
          }
          target[key] = extend(deep, src, copy)
        } else {
          target[key] = copy
        }
      }
    }
  }

  return target
}







