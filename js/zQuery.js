function aquery (selector, context) {
  return new aquery.prototype.init()
}

aquery.prototype = {
  init: function () {
    return this
  },
  name: function () {
    return this.age
  },
  age: 20
}

aquery.prototype.init.prototype = aquery.prototype

aquery.extend = aquery.prototype.extend = function () {}

// console.log(aquery().name())
