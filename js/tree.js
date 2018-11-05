function BinaryTree () {
  let root = null
  this.insert = key => {
    let newNode = new Node(key)
    if (!root) {
      root = newNode
    } else {
      insertNode(root, newNode)
    }
  }
  this.print = () => {
    return root
  }

  const Node = function(key) {
    this.key = key
    this.left = null
    this.right = null
  }

  const insertNode = (root, newNode) => {
    if (newNode.key < root.key) {
      if (root.left === null) {
        root.left = newNode
      } else {
        insertNode(root.left, newNode)
      }
    } else {
      if (root.right === null) {
        root.right = newNode
      } else {
        insertNode(root.right, newNode)
      }
    }
  }

  //先序遍历
  const preOrderTraverseNode = (node, callback) => {
    if (node !== null) {
      callback(node.key)
      preOrderTraverseNode(node.left, callback)
      preOrderTraverseNode(node.right, callback)
    }
  }
  this.preOrderTraverse = fn => {
    preOrderTraverseNode(root, fn)
  }
  //中序遍历
  const inOrderTraverseNode = (node, callback) => {
    if (node !== null) {
      inOrderTraverseNode(node.left, callback)
      callback(node.key)
      inOrderTraverseNode(node.right, callback)
    }
  }
  this.inOrderTraverse = fn => {
    inOrderTraverseNode(root, fn)
  }
  //后序遍历
  const postOrderTraverseNode = (node, callback) => {
    if (node !== null) {
      postOrderTraverseNode(node.left, callback)
      postOrderTraverseNode(node.right, callback)
      callback(node.key)
    }
  }
  this.postOrderTraverse = fn => {
    postOrderTraverseNode(root, fn)
  }
  //查找最大值最小值
  const maxNode = node => {
    if (node) {
      while (node && node.left !== null) {
        node = node.left
      }
      return node.key
    }
  }
  this.max = () => {
    return maxNode(root)
  }

  const minNode = node => {
    if (node) {
      while (node && node.right !== null) {
        node = node.right
      }
      return node.key
    }
  }
  this.min = () => {
    return minNode(root)
  }
  //搜索
  const searchNode = (node, key) => {
    if (node === null) {
      return false
    }
    if (key < node.key) {
      return searchNode(node.left, key)
    } else if (key > node.key) {
      return searchNode(node.right, key)
    } else {
      return true
    }
  }
  this.search = key => {
    return searchNode(root, key)
  }

  //删除节点
  const removeNode = (node, key) => {
    if (node === null) {
      return null
    }
    if (key < node.key) {
      node.left = removeNode(node.left, key)
    } else if (key > node.key) {
      node.right = removeNode(node.right, key)
    } else {
      if (node.left === null && node.right === null) {
        node = null
      }
      if (node.right === null) {
        node = node.left
      } else if (node.left === null) {
        node = node.right
      } else {
        let right = node.right
        node = node.left
        node.right = right
      }
    }
    return node
  }
  this.remove = key => {
    removeNode(root, key)
  }

  //计算最大深度
  const depth = node => {
    if (!node) return 0
    return 1 + Math.max(depth(node.left), depth(node.right))
  }
  this.maxDepth = () => {
    return depth(root)
  }

}