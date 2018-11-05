const moveZeroes = function(nums) {
  let arr = []
  for(let i = nums.length - 2; i >= 0; i--){
    let num = nums[i]
    let j = nums.lastIndexOf(0, i)
    if(j !== i){
      arr.unshift(j)
      i = j
    }
  }
  for(let i = arr.length - 1; i >= 0; i--){
    nums.push(...nums.splice(arr[i], 1))
  }
}

let arr = [0,1,0,3,12,0,1,0,3,12,0,1,0,3,12,0,1,0,3,12,0,1,0,3,12]
console.time('time')
moveZeroes(arr)
console.timeEnd('time')
console.log(arr)
