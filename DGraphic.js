// https://textalive.jp/templates/DGraphic/1248

import { DUtil } from "./DUtil.js";
import { cubicOut } from "./cubicOut.js";

/**
 * グラフィック描画用
 */
function DGraphic() {
  this.name = "Graphic";
  // this.type = PUBLIC;

  // var DUtil = require("DUtil@1247");
  var util = DUtil ? new DUtil() : null;

  /**
   * 中空図形の描画
   * @param {Graphics} g グラフィックス
   * @param {Number} x 中心座標 x
   * @param {Number} y 中心座標 y
   * @param {Number} r0 半径 (内側)
   * @param {Number} r1 半径 (外側)
   * @param {Number} n n 角形
   * @param {Number} rot 回転 (ラジアン)
   * @param {Color} color 色
   * @param {Number} start 描画開始角の割合
   * @param {Number} end 描画終了角の割合
   */
  this.drawDonut = function(g, x, y, r0, r1, n, rot, color, start, end) {
    if (typeof start === "undefined") start = 0;
    if (typeof end === "undefined") end = 1;

    if (start == end) return;

    g.beginFill(color);

    if (r0 < r1) {
      var tmp = r0;
      r0 = r1;
      r1 = tmp;
    }
    var drad = (Math.PI * 2) / n;

    var n0 = Math.floor(start * n);
    var m0 = (start * n) % 1;
    var n1 = Math.floor(end * n);
    var m1 = (end * n) % 1;

    var pt = __getPt(r0, drad, x, y, rot, n0, m0);
    g.moveTo(pt.x, pt.y);

    var i, rad, px, py;
    for (i = n0 + 1; i <= n1; i++) {
      rad = drad * i + rot;
      px = Math.cos(rad) * r0 + x;
      py = Math.sin(rad) * r0 + y;
      g.lineTo(px, py);
    }

    if (0 < r1) {
      /// 内側が 0 以上
      pt = __getPt(r0, drad, x, y, rot, n1, m1);
      g.lineTo(pt.x, pt.y);

      pt = __getPt(r1, drad, x, y, rot, n1, m1);
      g.lineTo(pt.x, pt.y);

      for (i = n1; n0 + 1 <= i; i--) {
        rad = drad * i + rot;
        px = Math.cos(rad) * r1 + x;
        py = Math.sin(rad) * r1 + y;
        g.lineTo(px, py);
      }
      pt = __getPt(r1, drad, x, y, rot, n0, m0);
      g.lineTo(pt.x, pt.y);
    }
    g.endFill();
  };
  function __getPt(r, drad, x, y, rot, n, m) {
    var rad = drad * n + rot;
    var x0 = Math.cos(rad) * r + x;
    var y0 = Math.sin(rad) * r + y;

    rad += drad;
    var x1 = Math.cos(rad) * r + x;
    var y1 = Math.sin(rad) * r + y;

    return { x: (x1 - x0) * m + x0, y: (y1 - y0) * m + y0 };
  }

  /**
   * 花火の描画
   * @param {Graphics} g グラフィックス
   * @param {Number} x 中心座標 x
   * @param {Number} y 中心座標 y
   * @param {Number} r0 半径 (内側)
   * @param {Number} r1 半径 (外側)
   * @param {Number} n n 角形
   * @param {Number} thick 線の太さ
   * @param {Number} rot 回転 (ラジアン)
   * @param {Color} color 色
   * @param {Number} start 描画開始位置の割合
   * @param {Number} end 描画終了位置の割合
   * @param {Number} rot0 内側の回転オフセット
   * @param {Number} rot1 外側の回転オフセット
   */
  this.drawFlower = function(
    g,
    x,
    y,
    r0,
    r1,
    n,
    thick,
    rot,
    color,
    start,
    end,
    rot0,
    rot1
  ) {
    if (typeof start === "undefined") start = 0;
    if (typeof end === "undefined") end = 1;
    if (typeof rot0 === "undefined") rot0 = 0;
    if (typeof rot1 === "undefined") rot1 = 0;

    if (start == end) return;

    var drad = (Math.PI * 2) / n;

    for (var i = 0; i < n; i++) {
      var rad = drad * i + rot;
      var p0 = util.rotatePoint(r0, 0, rad + rot0);
      var p1 = util.rotatePoint(r1, 0, rad + rot1);

      this.drawLine(
        g,
        p0.x + x,
        p0.y + y,
        p1.x + x,
        p1.y + y,
        thick,
        color,
        start,
        end
      );
    }
  };

  /**
   * 線の描画
   */
  this.drawLine = function(g, x0, y0, x1, y1, thick, color, start, end) {
    if (typeof start === "undefined") start = 0;
    if (typeof end === "undefined") end = 1;

    var xx0 = (x1 - x0) * start + x0;
    var yy0 = (y1 - y0) * start + y0;
    var xx1 = (x1 - x0) * end + x0;
    var yy1 = (y1 - y0) * end + y0;

    g.setStrokeStyle(thick);
    g.beginStroke(color);

    g.moveTo(xx0, yy0);
    g.lineTo(xx1, yy1);
    g.endStroke();
  };

  /**
   * ／の描画
   */
  this.drawSlash = function(g, x, y, w, h, p, color, start, end) {
    if (typeof start === "undefined") start = 0;
    if (typeof end === "undefined") end = 1;

    var px = x - (w + h * p) / 2;
    var py = y - h / 2;

    var h0 = h * start;
    var h1 = h * end;

    g.beginFill(color);
    g.moveTo(px + h0 * p, py + h0);
    g.lineTo(px + w + h0 * p, py + h0);
    g.lineTo(px + w + h1 * p, py + h1);
    g.lineTo(px + h1 * p, py + h1);
    g.endFill();
  };

  /**
   * 背景トランジション
   */
  this.drawBg = function(g, seedDir, seed, prog, color, isCurve, bgColor, width, height) {
    if (1 <= prog) {
      g.beginFill(color);
      g.drawRect(0, 0, width, height);
      return;
    }
    if (typeof bgColor !== "undefined") {
      g.beginFill(bgColor);
      g.drawRect(0, 0, width, height);
    }

    util.seed = seedDir;
    var direction = util.randInt(0, 3);

    util.seed = seed;
    var times = [
      util.rand(0.45, 1.0),
      util.rand(0.45, 1.0),
      util.rand(0.45, 1.0)
    ];
    var p1 = cubicOut(prog / times[0]);
    var p2 = cubicOut(prog / times[1]);
    var p3 = cubicOut(prog / times[2]);

    g.beginFill(color);

    switch (direction) {
      case 0: // →
        g.moveTo(0, height);
        g.lineTo(0, 0);
        g.lineTo(width * p1, 0);
        if (isCurve) {
          g.curveTo(width * p2, height * 0.5, width * p3, height);
        } else {
          g.lineTo(width * p2, height * 0.5);
          g.lineTo(width * p3, height);
        }
        break;
      case 1: // ↓
        g.moveTo(width, 0);
        g.lineTo(0, 0);
        g.lineTo(0, height * p1);
        if (isCurve) {
          g.curveTo(width * 0.5, height * p2, width, height * p3);
        } else {
          g.lineTo(width * 0.5, height * p2);
          g.lineTo(width, height * p3);
        }
        break;
      case 2: // ←
        g.moveTo(width, height);
        g.lineTo(width, 0);
        g.lineTo(width * (1 - p1), 0);
        if (isCurve) {
          g.curveTo(width * (1 - p2), height * 0.5, width * (1 - p3), height);
        } else {
          g.lineTo(width * (1 - p2), height * 0.5);
          g.lineTo(width * (1 - p3), height);
        }
        break;
      default:
        // ↑
        g.moveTo(width, height);
        g.lineTo(0, height);
        g.lineTo(0, height * (1 - p1));
        if (isCurve) {
          g.curveTo(width * 0.5, height * (1 - p2), width, height * (1 - p3));
        } else {
          g.lineTo(width * 0.5, height * (1 - p2));
          g.lineTo(width, height * (1 - p3));
        }
        break;
    }
    g.endFill();
  };

  /**
   * 座標配列から図形の描画
   * @param {Graphics} g グラフィックス
   * @param {Color} color 色
   * @param {Array} vts 頂点座標配列
   * @param {Number|Array} bendAmount しなりの変化量（デフォルト：0）
   * @param {Array} bendTargets しなりの対象となる配列番号の配列
   */
  this.drawVertexes = function(g, color, vts, bendAmount, bendTargets) {
    if (typeof bendAmount === "undefined") bendAmount = 0;
    if (typeof bendTargets === "undefined") bendTargets = null;

    var isArray = Array.isArray(bendAmount);

    if (isArray || bendAmount != 0) {
      var vts2 = util.getBendVertexes(vts, bendAmount);
    }

    if (color) g.beginFill(color);
    g.moveTo(vts[0][0], vts[0][1]);
    var l = vts.length;
    for (var i = 1; i <= l; i++) {
      if (bendAmount != 0 && (!bendTargets || 0 <= bendTargets.indexOf(i)))
        g.curveTo(vts2[i - 1][0], vts2[i - 1][1], vts[i % l][0], vts[i % l][1]);
      else g.lineTo(vts[i % l][0], vts[i % l][1]);
    }
    g.endFill();
  };

  /**
   * 円の描画
   * @param {Graphics} g グラフィックス
   * @param {Color} color 色
   * @param {Number} x 中心座標 x
   * @param {Number} y 中心座標 y
   * @param {Number} radius 半径
   * @param {Number} rot 回転 (ラジアン)
   * @param {Number} start 描画開始角の割合
   * @param {Number} end 描画終了角の割合
   */
  this.drawCircle = function(g, color, x, y, radius, rot, start, end) {
    if (typeof rot === "undefined") rot = 0;
    if (typeof start === "undefined") start = 0;
    if (typeof end === "undefined") end = 1;

    g.beginFill(color);

    var p = Math.PI * 2;
    var offset = rot / p;

    g.arc(x, y, radius, (start + offset) * p, (end + offset) * p);
    g.endFill();
  };
}

export { DGraphic };
