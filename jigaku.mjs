const exports = {}

exports.createFullElement = function (tag) {
  document.body.style.margin = '0'
  document.body.style.padding = '0'
  const c = document.createElement(tag)
  document.body.style.overflow = 'hidden'
  c.style.margin = '0'
  c.style.padding = '0'
  c.style.width = '100vw'
  c.style.height = '100vh'
  document.body.appendChild(c)
  return c
}
exports.createFullCanvas = function () {
  const c = exports.createFullElement('canvas')
  c.g = c.getContext('2d')

  appendFunctions(c.g)

  const fitSize = function () {
    const w = document.documentElement.clientWidth
    const h = document.documentElement.clientHeight
    if (c.bkw !== w || c.bkh !== h) {
      const ratio = window.devicePixelRatio || 1
      c.style.width = w + 'px'
      c.style.height = h + 'px'
      c.width = w * ratio >> 0
      c.height = h * ratio >> 0
      c.ratio = ratio
      c.bkw = w
      c.bkh = h
    }
  }
  fitSize()
  c.redraw = function () {
    fitSize()
    if (this.draw) { this.draw(this.g, this.width, this.height) }
  }
  window.onresize = () => c.redraw()
  setUI(c)
  return c
}

const setUI = function (comp) { // onuidown, onuimove, onuiup
  const istouch = (function () {
    const div = document.createElement('div')
    div.setAttribute('ontouchstart', 'return')
    return typeof div.ontouchstart === 'function'
  })()
  const usecapture = false
  if (istouch) {
    comp.addEventListener('touchstart', function (e) {
      if (this.onuidown != null) {
        if (!this.onuidown(
          (e.changedTouches[0].pageX - this.offsetLeft) * this.ratio,
          (e.changedTouches[0].pageY - this.offsetTop) * this.ratio
        )) { e.preventDefault() }
      }
    }, usecapture)
    comp.addEventListener('touchmove', function (e) {
      if (this.onuimove != null) {
        if (!this.onuimove(
          (e.changedTouches[0].pageX - this.offsetLeft) * this.ratio,
          (e.changedTouches[0].pageY - this.offsetTop) * this.ratio
        )) { e.preventDefault() }
      }
    }, usecapture)
    comp.addEventListener('touchend', function (e) {
      if (this.onuiup != null) {
        if (!this.onuiup(
          (e.changedTouches[0].pageX - this.offsetLeft) * this.ratio,
          (e.changedTouches[0].pageY - this.offsetTop) * this.ratio
        )) { e.preventDefault() }
      }
    }, usecapture)
  }
  comp.addEventListener('mousedown', function (e) {
    if (this.onuidown != null) { this.onuidown(e.offsetX * this.ratio, e.offsetY * this.ratio) }
  }, usecapture)
  comp.addEventListener('mousemove', function (e) {
    if (this.onuimove != null) { this.onuimove(e.offsetX * this.ratio, e.offsetY * this.ratio) }
  }, usecapture)
  comp.addEventListener('mouseup', function (e) {
    if (this.onuiup != null) { this.onuiup(e.offsetX * this.ratio, e.offsetY * this.ratio) }
  }, usecapture)
}
exports.dec2hex = function(n, beam) {
  var hex = ''
  for (var i = 0; i < beam; i++) {
    var m = n & 0xf
    hex = '0123456789abcdef'.charAt(m) + hex
    n -= m
    n >>= 4
  }
  return hex
}
exports.rgb2css = function (r, g, b) {
  if (typeof r === 'object') {
    g = r[1]
    b = r[2]
    r = r[0]
  }
  return '#' + exports.dec2hex(r, 2) + exports.dec2hex(g, 2) + exports.dec2hex(b, 2)
}
const appendFunctions = function (g) {
  g.setColor = function (r, g, b, a) {
    if (typeof r === 'string') {
      this.fillStyle = r
      this.strokeStyle = r
      return
    }
    if (Array.isArray(r)) {
      a = r[3]
      b = r[2]
      g = r[1]
      r = r[0]
    }
    if (a == null) { a = 1 }
    var c = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
    this.fillStyle = c
    this.strokeStyle = c
  }
  g.drawLine = function (x1, y1, x2, y2) {
    this.beginPath()
    this.moveTo(x1, y1)
    this.lineTo(x2, y2)
    this.closePath()
    this.stroke()
  }
  g.drawRect = function (x, y, w, h) {
    this.beginPath()
    this.moveTo(x, y)
    this.lineTo(x + w - 1, y)
    this.lineTo(x + w - 1, y + h - 1)
    this.lineTo(x, y + h - 1)
    this.closePath()
    this.stroke()
  }
  g.fillRect = function (x, y, w, h) {
    this.beginPath()
    this.moveTo(x, y)
    this.lineTo(x + w - 1, y)
    this.lineTo(x + w - 1, y + h - 1)
    this.lineTo(x, y + h - 1)
    this.closePath()
    this.fill()
  }
  g.drawCircle = function (x, y, r) {
    this.beginPath()
    this.arc(x, y, r, 0, Math.PI * 2, false)
    this.closePath()
    this.stroke()
  }
  g.fillCircle = function (x, y, r) {
    this.beginPath()
    this.arc(x, y, r, 0, Math.PI * 2, false)
    this.closePath()
    this.fill()
  }
  g.drawArc = function (x, y, r, srad, erad) {
    this.beginPath()
    this.arc(x, y, r, srad, erad, false)
    this.lineTo(x, y)
    this.closePath()
    this.stroke()
  }
  g.fillArc = function (x, y, r, srad, erad) {
    this.beginPath()
    this.arc(x, y, r, srad, erad, false)
    this.lineTo(x, y)
    this.closePath()
    this.fill()
  }
  // draw arrow
  g.drawArrow = function (x1, y1, x2, y2, arw, arh, fill) {
    var g = this
    var dx = x2 - x1
    var dy = y2 - y1
    var len = Math.sqrt(dy * dy + dx * dx)
    var th = Math.atan2(dy, dx)
    var th2 = th - Math.PI / 2
    if (len < arh * 1.5) {
      arh = len / 1.5
      if (arh / 2 < arw) { arw = arh / 2 }
    }
    var dx1 = Math.cos(th2) * arw
    var dy1 = Math.sin(th2) * arw
    var dx2 = Math.cos(th) * (len - arh)
    var dy2 = Math.sin(th) * (len - arh)
    var dx3 = Math.cos(th2) * (arh - arw)
    var dy3 = Math.sin(th2) * (arh - arw)
    g.beginPath()
    g.moveTo(x1, y1)
    g.lineTo(x1 + dx1, y1 + dy1)
    g.lineTo(x1 + dx1 + dx2, y1 + dy1 + dy2)
    g.lineTo(x1 + dx1 + dx2 + dx3, y1 + dy1 + dy2 + dy3)
    g.lineTo(x2, y2)
    g.lineTo(x1 - dx1 + dx2 - dx3, y1 - dy1 + dy2 - dy3)
    g.lineTo(x1 - dx1 + dx2, y1 - dy1 + dy2)
    g.lineTo(x1 - dx1, y1 - dy1)
    g.closePath()
    if (fill) { g.fill() } else { g.stroke() }
  }
  g.fillArrow = function (x1, y1, x2, y2, arw, arh) {
    this.drawArrow(x1, y1, x2, y2, arw, arh, true)
  }
  g.fillTextCenter = function (s, x, y) {
    const met = this.measureText(s)
    const sw = met.width
    this.fillText(s, x - sw / 2, y)
  }
  g.setFontSize = function (fonth) {
    g.font = 'normal ' + fonth + 'px sans-serif'
  }
}
exports.containsRect = function (px, py, x, y, w, h) {
  return px >= x && px < x + w && py >= y && py < y + h
}
exports.pairCharsToArray = function (s) {
  const res = []
  for (let i = 0; i < s.length; i += 2) {
    res.push(s.substring(i, i + 2))
  }
  return res
}

exports.rgb2hsv = function (rr, gg, bb) {
  var hsv = [0, 0, 0]
  var r = rr / 255
  var g = gg / 255
  var b = bb / 255
  var max = Math.max(r, g, b)
  var min = Math.min(r, g, b)
  if (max !== 0) {
    hsv[1] = (max - min) / max
    if (max === r) { hsv[0] = 60 * (g - b) / (max - min) } else if (max == g) { hsv[0] = 60 * (b - r) / (max - min) + 120 } else { hsv[0] = 60 * (r - g) / (max - min) + 240 }
    if (hsv[0] < 0) { hsv[0] += 360 }
  }
  hsv[2] = max
  return hsv
}
exports.hsv2rgb = function (h, s, v) {
  while (h < 0) { h += 360 }
  h %= 360
  if (s === 0) {
    v *= 255
    return [v, v, v]
  }
  var hi = h / 60 >> 0
  var f = h / 60 - hi
  var p = v * (1 - s)
  var q = v * (1 - f * s)
  var t = v * (1 - (1 - f) * s)
  var rgb = [1, 1, 1]
  if (hi === 0) {
    rgb = [v, t, p]
  } else if (hi === 1) {
    rgb = [q, v, p]
  } else if (hi === 2) {
    rgb = [p, v, t]
  } else if (hi === 3) {
    rgb = [p, q, v]
  } else if (hi === 4) {
    rgb = [t, p, v]
  } else if (hi === 5) {
    rgb = [v, p, q]
  }
  rgb[0] = rgb[0] * 255 >> 0
  rgb[1] = rgb[1] * 255 >> 0
  rgb[2] = rgb[2] * 255 >> 0
  return rgb
}

export default exports

