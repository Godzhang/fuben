var Fip = (function () {
'use strict';

// 图像处理器
function Fip$1(imageDom, options) {
  // 初始化 ----------------------------------------------------------------------------------------

  options = options || {};
  options.sizeLimit = options.sizeLimit || 600; // 短边最大计算长度(默认600，但不能小于500)
  options.debugging = options.debugging || false; // 调试模式

  var canvasDom = document.createElement('canvas');
  var context = canvasDom.getContext('2d');

  // 缩放图像以减少耗时
  var oWidth = imageDom.naturalWidth;
  var oHeight = imageDom.naturalHeight;
  var oShortSide = Math.min(oWidth, oHeight);
  var shrinkScale = oShortSide < options.sizeLimit ? 1 : options.sizeLimit / oShortSide;
  var width = canvasDom.width = Math.round(oWidth * shrinkScale);
  var height = canvasDom.height = Math.round(oHeight * shrinkScale);
  var shortSide = Math.round(oShortSide * shrinkScale);
  context.drawImage(imageDom, 0, 0, width, height);

  // 像素计算 --------------------------------------------------------------------------------------

  function getPixelColor(x, y) {
    var pixelData = getPixel(x, y);
    var r = pixelData[0];
    var g = pixelData[1];
    var b = pixelData[2];
    var a = pixelData[3] / 255;
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
  }

  function isPixelBinWhite(x, y) {
    var pixelData = getPixel(x, y);
    var r = pixelData[0];
    var g = pixelData[1];
    var b = pixelData[2];
    // return r * 0.3 + g * 0.59 + b * 0.11 > 127;
    return r + g + b > 255 * 1.8;
  }

  function isPixelBinBlack(x, y) {
    return !isPixelBinWhite(x, y);
  }

  // 像素缓存 --------------------------------------------------------------------------------------

  var imageData = null;
  var pixelsData = null;

  function getPixels() {
    if (pixelsData) return pixelsData;
    imageData = context.getImageData(0, 0, width, height);
    pixelsData = imageData.data;
    return pixelsData;
  }

  function getPixel(x, y) {
    var pixels = getPixels();
    var offset = (x + y * width) * 4;
    return [pixels[offset], pixels[offset + 1], pixels[offset + 2], pixels[offset + 3]];
  }

  function setPixel(x, y, rgba) {
    if (!pixelsData) return;
    var offset = (x + y * width) * 4;
    for (var i = 0; i < 4; i++) {
      pixelsData[offset + i] = rgba[i];
    }
  }

  function applyData() {
    context.putImageData(imageData, 0, 0);
  }

  // 计时器 ----------------------------------------------------------------------------------------

  var timer = {
    startTime: 0,
    start: function start() {
      this.startTime = performance.now();
    },
    stop: function stop() {
      return Math.round(performance.now() - this.startTime) + 'ms';
    },
    log: function log(tag) {
      console.log(tag + ' time: ' + this.stop());
    }

    // 全图处理 --------------------------------------------------------------------------------------

  };function isPixelDataBlack(pixelData) {
    var sum = pixelData[0] + pixelData[1] + pixelData[2];
    return sum < 255 * 3 * 0.6;
  }

  function isPixelDataWhite(pixelData) {
    return !isPixelDataBlack(pixelData);
  }

  // 二值化
  // throttle 介于0到1之间的阈值
  function binarize(throttle) {
    if (options.debugging) timer.start();
    if (throttle == null) throttle = 0.7;
    for (var i = 0; i < width; i += 1) {
      for (var j = 0; j < height; j += 1) {
        var pxd = getPixel(i, j);
        var saturation = (pxd[0] + pxd[1] + pxd[2]) / 3 / 255;
        var isPxBlack = saturation < throttle;
        setPixel(i, j, isPxBlack ? [0, 0, 0, 255] : [255, 255, 255, 255]);
      }
    }
    applyData();
    if (options.debugging) timer.log('binarize');
    return this;
  }

  // 降噪（二值化后）
  // range: 向外扩展几个像素，默认一个，共3x3=9个像素
  // throttle: 周围像素超过这个百分比的不一致时进行降噪处理
  function denoise(throttle, range) {
    if (options.debugging) timer.start();
    if (throttle == null) throttle = 0.6;
    if (range == null) range = 1;
    for (var i = 0; i < width; i += 1) {
      for (var j = 0; j < height; j += 1) {
        var isCurrBlack = isPixelBinBlack(i, j);
        var analysisResult = this.analysisPixels(this.getSurroundingPixels(i, j, range));
        if (analysisResult.isBlackMore != isCurrBlack) {
          if (analysisResult.proportionOfMore > throttle) {
            setPixel(i, j, isCurrBlack ? [255, 255, 255, 255] : [0, 0, 0, 255]);
          }
        }
      }
    }
    applyData();
    if (options.debugging) timer.log('denoise');
    return this;
  }

  // API属性 ---------------------------------------------------------------------------------------

  this.debugging = options.debugging; // 调试模式
  this.canvasDom = canvasDom; // 内部用于图像处理的<canvas>元素
  this.context = context; // <canvas>的2D绘图上下文

  this.width = width; // 图像宽度
  this.height = height; // 图像高度
  this.shortSide = shortSide; // 图像短边

  this.originalWidth = oWidth; // 原始图像宽度
  this.originalHeight = oHeight; // 原始图像高度
  this.originalshortSide = oShortSide; // 原始图像短边

  // API方法 ---------------------------------------------------------------------------------------

  this.getPixel = getPixel;
  this.getPixelColor = getPixelColor; // 获取像素颜色(rgba格式)
  this.isPixelBinBlack = isPixelBinBlack; // 判断像素二值化后是否是黑色
  this.isPixelBinWhite = isPixelBinWhite; // 判断像素二值化后是否是白色
  this.isPixelDataBlack = isPixelDataBlack; // 判断像素数据二值化后是否是黑色
  this.isPixelDataWhite = isPixelDataWhite; // 判断像素数据二值化后是否是白色

  this.binarize = binarize; // 二值化处理
  this.denoise = denoise; // 降噪处理
}

// 外部方法 ----------------------------------------------------------------------------------------

Fip$1.prototype = {

  calcColBlackLineCount: function calcColBlackLineCount(x) {
    var count = 0;
    var currIsBlack = false;
    var lastIsBlack = false;
    for (var i = 0; i < this.height; i += 1) {
      currIsBlack = this.isPixelBinBlack(x, i);
      if (currIsBlack && !lastIsBlack) {
        count += 1;
      }
      lastIsBlack = currIsBlack;
    }
    return count;
  },

  calcRowBlackLineCount: function calcRowBlackLineCount(y) {
    var count = 0;
    var currIsBlack = false;
    var lastIsBlack = false;
    for (var i = 0; i < this.width; i += 1) {
      currIsBlack = this.isPixelBinBlack(i, y);
      if (currIsBlack && !lastIsBlack) {
        count += 1;
      }
      lastIsBlack = currIsBlack;
    }
    return count;
  },

  // 获取周围像素
  getSurroundingPixels: function getSurroundingPixels(x, y, range) {
    if (range == null) range = 1;
    var pixels = [];
    for (var i = -range; i <= range; i += 1) {
      for (var j = -range; j <= range; j += 1) {
        if ((i != 0 || j != 0) && x + i >= 0 && x + i < this.width && y + j >= 0 && y + j < this.height) {
          pixels.push(this.getPixel(x + i, y + j));
        }
      }
    }
    return pixels;
  },

  // 分析一组像素：大部分是黑色还是白色、大部分所占比例
  analysisPixels: function analysisPixels(pixels) {
    var blackCount = 0;
    var whiteCount = 0;
    for (var k = 0; k < pixels.length; k += 1) {
      this.isPixelDataWhite(pixels[k]) ? whiteCount += 1 : blackCount += 1;
    }
    return {
      isBlackMore: blackCount > whiteCount,
      isWhiteMore: blackCount < whiteCount,
      proportionOfMore: Math.max(blackCount, whiteCount) / (blackCount + whiteCount)
    };
  }
};

// 边距检测
Fip$1.prototype.findPadding = function () {
  var _this = this;

  var DEFAULT_PADDING = 0.05; // 如果在三分之一的范围内都搜不到文字（比如白纸），返回该值
  var PADDING_OFFSET = 5 / 1000; // 别把边距切完，留一点
  var BLACK_LINE_COUNT_THRESHOLD = 6; // 用黑线数量检测边距的阈值

  var findPaddingLeft = function findPaddingLeft() {
    for (var j = 0; j < _this.width / 3; j += 1) {
      if (_this.calcColBlackLineCount(j) > BLACK_LINE_COUNT_THRESHOLD) {
        var pos = j / _this.width - PADDING_OFFSET;
        if (pos <= 0) pos += PADDING_OFFSET;
        return pos;
      }
    }
    return DEFAULT_PADDING;
  };

  var findPaddingRight = function findPaddingRight() {
    for (var j = _this.width - 1; j > _this.width * 2 / 3; j -= 1) {
      if (_this.calcColBlackLineCount(j) > BLACK_LINE_COUNT_THRESHOLD) {
        var pos = j / _this.width + PADDING_OFFSET;
        if (pos >= 1) pos -= PADDING_OFFSET;
        return pos;
      }
    }
    return 1 - DEFAULT_PADDING;
  };

  var findPaddingTop = function findPaddingTop() {
    for (var j = 0; j < _this.height / 3; j += 1) {
      if (_this.calcRowBlackLineCount(j) > BLACK_LINE_COUNT_THRESHOLD) {
        var pos = j / _this.height - PADDING_OFFSET;
        if (pos <= 0) pos += PADDING_OFFSET;
        return pos;
      }
    }
    return DEFAULT_PADDING;
  };

  var findPaddingBottom = function findPaddingBottom() {
    for (var j = _this.height - 1; j > _this.height * 2 / 3; j -= 1) {
      if (_this.calcRowBlackLineCount(j) > BLACK_LINE_COUNT_THRESHOLD) {
        var pos = j / _this.height + PADDING_OFFSET;
        if (pos >= 1) pos -= PADDING_OFFSET;
        return pos;
      }
    }
    return 1 - DEFAULT_PADDING;
  };
  return {
    left: findPaddingLeft(),
    right: findPaddingRight(),
    top: findPaddingTop(),
    bottom: findPaddingBottom()
  };
};

// 寻找竖栏间隔（目前只支持双栏）
Fip$1.prototype.findGap = function (from) {
  var _this = this;

  var GAP_LINT_COUNT_THRESHOLD = 6;
  var GAP_MIN_WIDTH = 0.02;

  var findGapLeft = function findGapLeft(from) {
    from = from || 0.33;
    for (var j = Math.round(from * _this.width), to = Math.round(_this.width * 0.66); j < to; j += 1) {
      if (_this.calcColBlackLineCount(j) < GAP_LINT_COUNT_THRESHOLD) {
        return j / _this.width;
      }
    }
    return 0;
  };

  var findGapRight = function findGapRight(from) {
    for (var j = Math.round(from * _this.width), to = Math.round(_this.width * 0.75); j < to; j += 1) {
      if (_this.calcColBlackLineCount(j) > GAP_LINT_COUNT_THRESHOLD) {
        return j / _this.width;
      }
    }
    return 0;
  };

  from = from || 0.33;
  var gapLeft = findGapLeft(from);
  if (gapLeft > 0) {
    var gapRight = findGapRight(gapLeft);
    if (gapRight <= gapLeft) {
      return null;
    } else if (gapRight - gapLeft < GAP_MIN_WIDTH) {
      return this.findGap(gapRight);
    }
    return {
      left: gapLeft,
      right: gapRight,
      middle: (gapLeft + gapRight) / 2
    };
  } else {
    return null;
  }
};

// 拾取定位点（黑色矩形）
Fip$1.prototype.pickAnchor = function (nx, ny) {
  var _this = this;

  var FORBIDDEN_ZONE = 0.03; // 禁区：不要检测距离边缘太近的定位点

  // 分析一个点周围区域是否是黑方块，需要黑色占比超过90%。
  var isBlackSquareAt = function isBlackSquareAt(x, y, range) {
    var analysisResult = _this.analysisPixels(_this.getSurroundingPixels(x, y, range));
    return analysisResult.isBlackMore && analysisResult.proportionOfMore > 0.9;
  };

  // 寻找离某点最近的黑方块
  // range: 黑方块的半径，默认2像素（即边长为5）
  // limit: 最远距离（相对于长宽的百分比）
  var findNearestBlackSquare = function findNearestBlackSquare(x, y, range, limit) {
    range = range || 1.5;
    limit = limit || 0.05;

    var limitPx = _this.shortSide * limit;
    var squareSideLen = range * 2 + 1;
    var layerDist = squareSideLen * 2;
    var layerNum = Math.round(limitPx / layerDist);
    // 由内向外收集测试点坐标
    var points = [[0, x, y]];
    _this.context.fillStyle = 'red';
    var edgeLimit = _this.shortSide * FORBIDDEN_ZONE;
    for (var z = 1; z <= layerNum; z++) {
      // 水平方向（含角点）
      var y1 = y + z * squareSideLen;
      var y2 = y - z * squareSideLen;
      var y1Pass = y1 > edgeLimit && y1 < _this.height - edgeLimit;
      var y2Pass = y2 > edgeLimit && y2 < _this.height - edgeLimit;
      for (var i = -z; i <= z; i++) {
        var xi = x + i * squareSideLen;
        var xiPass = xi > edgeLimit && xi < _this.width - edgeLimit;
        if (xiPass && y1Pass) points.push([z, xi, y1]);
        if (xiPass && y2Pass) points.push([z, xi, y2]);
        if (_this.debugging) {
          if (xiPass && y1Pass) _this.context.fillRect(xi, y1, 1, 1);
          if (xiPass && y2Pass) _this.context.fillRect(xi, y2, 1, 1);
        }
      }
      // 垂直方向（不含角点）
      var x1 = x + z * squareSideLen;
      var x2 = x - z * squareSideLen;
      var x1Pass = x1 > edgeLimit && x1 < _this.width - edgeLimit;
      var x2Pass = x2 > edgeLimit && x2 < _this.width - edgeLimit;
      for (var j = -z + 1; j < z; j++) {
        var yi = y + j * squareSideLen;
        var yiPass = yi > edgeLimit && yi < _this.height - edgeLimit;
        if (x1Pass && yiPass) points.push([z, x1, yi]);
        if (x2Pass && yiPass) points.push([z, x2, yi]);
        if (_this.debugging) {
          if (x1Pass && yiPass) _this.context.fillRect(x1, yi, 1, 1);
          if (x2Pass && yiPass) _this.context.fillRect(x2, yi, 1, 1);
        }
      }
    }
    for (var _i = 0, len = points.length; _i < len; _i++) {
      var _x = points[_i][1];
      var _y = points[_i][2];
      if (isBlackSquareAt(_x, _y, 2)) {
        if (_this.debugging) {
          _this.context.fillStyle = 'blue';
          _this.context.fillRect(_x - 1, _y - 1, 3, 3);
        }
        return [_x, _y];
      }
    }
    // console.log('limitPx, layerDist, layerNum, points', limitPx, layerDist, layerNum, points);
    return null;
  };

  // 归一坐标转为像素坐标
  var x = Math.round(nx * this.width);
  var y = Math.round(ny * this.height);

  // 找到最近的定位点
  var nearestSquarePoint = findNearestBlackSquare(x, y);
  if (!nearestSquarePoint) throw '未找到定位点';

  // 设置拾取位置为找到的位置
  x = nearestSquarePoint[0];
  y = nearestSquarePoint[1];

  // 向外扩张
  var expand = {
    top: { dist: 2, stopped: false },
    bottom: { dist: 2, stopped: false },
    left: { dist: 2, stopped: false },
    right: { dist: 2, stopped: false }
  };

  var tryExpand = function tryExpand(dx, dy) {
    var direction = dx == 0 ? dy > 0 ? 'bottom' : 'top' : dx > 0 ? 'right' : 'left';
    if (expand[direction].stopped) return;
    if (dx < 0 && x - expand['left'].dist - 1 < 0) {
      expand['left'].stopped = true;
    } else if (dx > 0 && x + expand['right'].dist + 1 >= _this.width) {
      expand['right'].stopped = true;
    } else if (dy > 0 && y + expand['bottom'].dist + 1 >= _this.height) {
      expand['bottom'].stopped = true;
    } else if (dy < 0 && y - expand['top'].dist - 1 < 0) {
      expand['top'].stopped = true;
    } else {
      var blackCount = 0;
      var blackSum = void 0;
      if (dx == 0) {
        blackSum = expand.left.dist + expand.right.dist + 1;
        for (var i = x - expand.left.dist; i <= x + expand.right.dist; i++) {
          if (_this.isPixelBinBlack(i, y + (expand[direction].dist + 1) * dy)) blackCount += 1;
        }
      } else {
        blackSum = expand.top.dist + expand.bottom.dist + 1;
        for (var _i2 = y - expand.top.dist; _i2 <= y + expand.bottom.dist; _i2++) {
          if (_this.isPixelBinBlack(x + (expand[direction].dist + 1) * dx, _i2)) blackCount += 1;
        }
      }
      if (blackCount < blackSum * 0.3) {
        expand[direction].stopped = true;
      } else {
        expand[direction].dist += 1;
      }
    }
  };

  while (!expand.top.stopped || !expand.bottom.stopped || !expand.left.stopped || !expand.right.stopped) {
    tryExpand(0, -1);
    tryExpand(1, 0);
    tryExpand(0, 1);
    tryExpand(-1, 0);
  }

  // console.log('expand left, right, top, bottom dist: ',
  //     expand.left.dist, expand.right.dist, expand.top.dist, expand.bottom.dist);

  return {
    left: (x - expand.left.dist - 0.5) / this.width,
    top: (y - expand.top.dist - 0.5) / this.height,
    right: (x + expand.right.dist + 0.5) / this.width,
    bottom: (y + expand.bottom.dist + 0.5) / this.height
  };
};

// Core
// Plugins

return Fip$1;

}());
