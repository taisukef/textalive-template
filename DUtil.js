// https://textalive.jp/templates/DUtil/1247

/**
 * 乱数生成その他ユーティリティ
 */
function DUtil() {
  this.name = "Utility";
  // this.type = PUBLIC;

  // 乱数生成用シード
  this.seed = 123456789;

  /** value の値を min - max の範囲で [0-1] に */
  this.normalize = function (value, min, max) {
    if (value < min) return 0;
    if (max < value) return 1;
    return (value - min) / (max - min);
  };

  /** min - max の範囲で乱数生成 (整数) */
  this.randInt = function (min, max, seed) {
    return Math.floor(this.rand(min, max + 1, seed));
  };
  /** min - max の範囲で乱数生成 */
  this.rand = function (min, max, seed) {
    if (max < min) {
      var t = min;
      min = max;
      max = t;
    }
    return this.random(seed) * (max - min) + min;
  };
  /** 乱数生成 [0-1] */
  this.random = function (seed) {
    // Xorshift
    var x = this.seed;
    if (!isNaN(seed)) x = seed;
    x = x ^ (x << 13);
    x = x ^ (x >> 17);
    x = x ^ (x << 15);
    this.seed = x;
    return x / 4294967296 + 0.5;
  };

  /** 座標を原点中心に回転 */
  this.rotatePoint = function (x, y, rad) {
    return {
      x: x * Math.cos(rad) - y * Math.sin(rad),
      y: x * Math.sin(rad) + y * Math.cos(rad),
    };
  };

  /** 歌唱中かどうかの判定 */
  this._checkSinging = function (time, times, interval, offset, offsetAfter) {
    if (typeof interval === "undefined") interval = 3000; // 間奏と判定する最低インターバル
    if (typeof offset === "undefined") offset = 500; // 前オフセット
    if (typeof offsetAfter === "undefined") offsetAfter = 100; // 後オフセット

    var ts = times,
      l = ts.length;
    for (var i = 0; i < l; i++) {
      if (ts[i][0] - offset <= time && time <= ts[i][1] + offsetAfter)
        return true;

      if (0 < i) {
        if (
          ts[i - 1][1] < time &&
          time < ts[i][0] &&
          ts[i][0] - ts[i - 1][1] <= interval
        ) {
          return true;
        }
      }
    }
    return false;
  };
  /** キーとなる文字（漢字・カタカナ）かどうか */
  this._checkKeyLetter = function (c) {
    if (!c) return false;
    var s = c.text;
    if (s.match(/^[ぁ-ん,、。　]*$/)) {
      return false;
    } else if (s == "ー") {
      return this._checkKeyLetter(c.previous);
    }
    return true;
  };

  /**
   * 1拍目のビートを取得
   * @param {*} beat Beat
   * @param {Number} n n 回分さかのぼる
   */
  this.getFirstBeat = function (beat, n) {
    if (typeof n === "undefined") n = 0;

    while (1) {
      if (beat.position == 1) {
        if (n <= 0) return beat;
        n--;
      }
      if (!beat.previous) return beat;
      beat = beat.previous;
    }
  };

  /**
   * 現在の拍における位置
   */
  this.getBeatProgress = function (now, beat, min, max) {
    if (typeof min === "undefined") min = -100;
    if (typeof max === "undefined") max = 100;

    var r = (now - beat.startTime) / beat.duration;
    if (r < min) r = min;
    if (max < r) r = max;
    return r;
  };
  /**
   * 現在の小節における位置
   */
  this.getMeasureProgress = function (now, beat, min, max) {
    if (typeof min === "undefined") min = -100;
    if (typeof max === "undefined") max = 100;

    if (beat.position != 1) beat = this.getFirstBeat(beat);

    var duration = beat.length * beat.duration;
    var r = (now - beat.startTime) / duration;
    if (r < min) r = min;
    if (max < r) r = max;
    return r;
  };

  /**
   * 線分の頂点座標配列を取得
   */
  this.getLineVertexes = function (x0, y0, x1, y1, start, end) {
    if (typeof start === "undefined") start = 0;
    if (typeof end === "undefined") end = 1;

    var dx = x1 - x0;
    var dy = y1 - y0;
    var vts = [
      [x0 + dx * start, y0 + dy * start],
      [x0 + dx * end, y0 + dy * end],
    ];
    return vts;
  };

  /**
   * 四角形の頂点座標配列を取得
   */
  this.getSquareVertexes = function (x, y, w, h, pivot) {
    if (typeof pivot === "undefined") pivot = [0.5, 0.5];

    var dw = w * pivot[0];
    var dh = h * pivot[1];

    var vts = [
      [x - dw, y - dh],
      [x - dw + w, y - dh],
      [x - dw + w, y - dh + h],
      [x - dw, y - dh + h],
    ];
    return vts;
  };

  /**
   * 多角形の頂点座標配列を取得
   * @param {Number} x 中心座標 x
   * @param {Number} y 中心座標 y
   * @param {Number} r 半径
   * @param {Number} n n 角形
   * @param {Number} rot 回転 (ラジアン)
   * @param {Number} pivot 回転の中心（デフォルト：[0.5, 0.5]）
   */
  this.getPolygonVertexes = function (x, y, r, n, rot, pivot) {
    if (typeof rot === "undefined") rot = 0;
    if (typeof pivot === "undefined") pivot = [0.5, 0.5];

    var drad = (Math.PI * 2) / n;

    var vts = [];
    var usePivot = Array.isArray(pivot);

    var i, rad, px, py;
    for (i = 0; i < n; i++) {
      rad = drad * i;
      if (!usePivot) rad += rot;

      px = Math.cos(rad) * r + x;
      py = Math.sin(rad) * r + y;
      vts[i] = [px, py];
    }

    if (usePivot) {
      var dx = (pivot[0] - 0.5) * 2 * r;
      var dy = (pivot[1] - 0.5) * 2 * r;

      for (i = 0; i < n; i++) {
        var xx = vts[i][0] - dx - x;
        var yy = vts[i][1] - dy - y;

        var p = this.rotatePoint(xx, yy, rot);

        px = p.x + x;
        py = p.y + y;
        vts[i] = [px, py];
      }
    }

    return vts;
  };

  /**
   * 頂点座標配列を回転
   * @param {Number} vts 頂点座標配列
   * @param {Number} rot 回転 (ラジアン)
   * @param {Number} pivot 回転の中心（デフォルト：[0.5, 0.5]）
   */
  this.getRotateVertexes = function (vts, rot, pivot) {
    if (typeof pivot === "undefined") pivot = [0.5, 0.5];

    var l = vts.length;
    var min = [10000, 10000],
      max = [-10000, -10000];
    var ave = [0, 0];

    for (var i = 0; i < l; i++) {
      var x = vts[i][0];
      var y = vts[i][1];
      if (x < min[0]) min[0] = x;
      if (y < min[1]) min[1] = y;
      if (max[0] < x) max[0] = x;
      if (max[1] < y) max[1] = y;

      ave[0] += x;
      ave[1] += y;
    }
    ave[0] /= l;
    ave[1] /= l;

    var dx = ave[0] + (pivot[0] - 0.5) * (max[0] - min[0]);
    var dy = ave[1] + (pivot[1] - 0.5) * (max[1] - min[1]);

    var v = [];
    for (var i = 0; i < l; i++) {
      var xx = vts[i][0] - dx;
      var yy = vts[i][1] - dy;

      var p = this.rotatePoint(xx, yy, rot);

      v[i] = [p.x + dx, p.y + dy];
    }
    return v;
  };

  /**
   * 多角形の頂点座標配列をしならせる
   * @param {Number} vts 頂点座標配列
   * @param {Number|Array} amount しなりの変化量（負の値で内側）
   */
  this.getBendVertexes = function (vts, amount) {
    var l = vts.length;
    var ave = [0, 0];
    var v = [];

    for (var i = 0; i < l; i++) {
      var x = vts[i][0];
      var y = vts[i][1];
      ave[0] += x;
      ave[1] += y;

      x = (x + vts[(i + 1) % l][0]) * 0.5;
      y = (y + vts[(i + 1) % l][1]) * 0.5;
      v[i] = [x, y];
    }
    var cx = (ave[0] /= l);
    var cy = (ave[1] /= l);

    var isArray = Array.isArray(amount);

    for (var i = 0; i < l; i++) {
      var dx = v[i][0] - cx;
      var dy = v[i][1] - cy;

      if (!isArray) {
        v[i][0] += dx * amount;
        v[i][1] += dy * amount;
      } else {
        var len = amount.length;
        v[i][0] += dx * amount[i % len];
        v[i][1] += dy * amount[i % len];
      }
    }
    return v;
  };

  /**
   * 多角形の頂点座標配列をワイプ
   * @param {Array} vts 頂点座標配列
   * @param {Number} start 開始（デフォルト：0）
   * @param {Number} end 終了（デフォルト：1）
   * @param {Number} shift 配列のシフト値
   */
  this.getWipeVertexes = function (vts, start, end, shift) {
    if (typeof start === "undefined") start = 0;
    if (typeof end === "undefined") end = 1;
    if (typeof shift === "undefined") shift = 0;

    var len = vts.length;
    var l = len / 2;

    var v = [];
    for (var i = 0; i < len; i++) v[i] = [vts[i][0], vts[i][1]];

    for (var i = 0; i < l; i++) {
      var n0 = (i + shift) % len;
      var n1 = (len - 1 - i + shift) % len;

      var p0 = vts[n0];
      var p1 = vts[n1];

      var dx = p1[0] - p0[0];
      var dy = p1[1] - p0[1];

      v[n0] = [p0[0] + dx * start, p0[1] + dy * start];
      v[n1] = [p0[0] + dx * end, p0[1] + dy * end];
    }
    return v;
  };

  /** 配列のシャッフル（配列の中身を直接書き換え） */
  this.shuffleArray = function (a) {
    var l = a.length;
    for (var i = 0; i < l; i++) {
      var tmp = a[i];
      var r = this.randInt(0, l - 1);
      a[i] = a[r];
      a[r] = tmp;
    }
  };

  /** HSL -> RGB */
  this.hslToRgb = function (h, s, l) {
    h = h % 360;
    var L = l <= 49 ? l : 100 - l;
    var max = 2.55 * (l + L * (s / 100));
    var min = 2.55 * (l - L * (s / 100));
    var calc = function (H) {
      return min + (max - min) * (H / 60);
    };
    var rgb;
    if (h < 60) rgb = [max, calc(h), min];
    else if (h < 120) rgb = [calc(120 - h), max, min];
    else if (h < 180) rgb = [min, max, calc(h - 120)];
    else if (h < 240) rgb = [min, calc(240 - h), max];
    else if (h < 300) rgb = [calc(h - 240), min, max];
    else rgb = [max, min, calc(360 - h)];

    return "rgb(" + rgb.join(",") + ")";
  };
}

export { DUtil };
