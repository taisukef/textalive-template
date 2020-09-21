// https://textalive.jp/templates/DLineGraphic/1249

import { DUtil } from "./DUtil.js";

/**
 * 線グラフィック描画用
 */
function DLineGraphic() {
  this.name = "LineGraphic";
  this.type = PUBLIC;

  // var DUtil = require("DUtil@1247");
  var util = DUtil ? new DUtil() : null;

  /**
   * 直線
   */
  this.draw = function (g, thick, color, x0, y0, x1, y1, start, end) {
    if (typeof start === "undefined") start = 0;
    if (typeof end === "undefined") end = 1;

    var dx = x1 - x0;
    var dy = y1 - y0;

    g.setStrokeStyle(thick);
    g.beginStroke(color);

    g.moveTo(x0 + dx * start, y0 + dy * start);
    g.lineTo(x0 + dx * end, y0 + dy * end);
    g.endStroke();
  };

  /**
   * 直線（点線）
   */
  this.drawDash = function (
    g,
    thick,
    color,
    x0,
    y0,
    x1,
    y1,
    segments,
    start,
    end
  ) {
    if (typeof start === "undefined") start = 0;
    var dx = x1 - x0;
    var dy = y1 - y0;
    var dist = Math.sqrt(dx * dx + dy * dy);

    g.setStrokeDash(segments, dist * start);
    this.draw(g, thick, color, x0, y0, x1, y1, start, end);
    g.setStrokeDash([]);
  };

  /**
   * 円
   */
  this.drawCircle = function (g, thick, color, x, y, radius, rot, start, end) {
    if (typeof rot === "undefined") rot = 0;
    if (typeof start === "undefined") start = 0;
    if (typeof end === "undefined") end = 1;

    g.setStrokeStyle(thick);
    g.beginStroke(color);

    var p = Math.PI * 2;
    var offset = rot / p;

    g.arc(x, y, radius, (start + offset) * p, (end + offset) * p);
    g.endStroke();
  };
  /**
   * 円（点線）
   */
  this.drawCircleDash = function (
    g,
    thick,
    color,
    x,
    y,
    radius,
    radian,
    segments,
    start,
    end
  ) {
    if (typeof start === "undefined") start = 0;
    var dist = 2 * Math.PI * radius;

    g.setStrokeDash(segments, dist * start);
    this.drawCircle(g, thick, color, x, y, radius, radian, start, end);
    g.setStrokeDash([]);
  };

  /**
   * 座標配列から描画
   * @param {Graphics} g グラフィックス
   * @param {Number} thick 線の太さ
   * @param {Color} color 色
   * @param {Array} vts 頂点座標配列
   * @param {Array} segments 点線の間隔配列（デフォルト：null）
   * @param {Number|Array} bendAmount しなりの変化量（デフォルト：0）
   * @param {Array} bendTargets しなりの対象となる配列番号の配列（デフォルト：null）
   */
  this.drawVertexes = function (
    g,
    thick,
    color,
    vts,
    segments,
    bendAmount,
    bendTargets,
    close
  ) {
    if (typeof segments === "undefined") segments = null;
    if (typeof bendAmount === "undefined") bendAmount = 0;
    if (typeof bendTargets === "undefined") bendTargets = null;
    if (typeof close === "undefined") close = true;

    if (vts.length == 0) return;

    var isArray = Array.isArray(bendAmount);

    if (isArray || bendAmount != 0) {
      var vts2 = util.getBendVertexes(vts, bendAmount);
    }

    if (segments) g.setStrokeDash(segments);
    g.setStrokeStyle(thick);
    g.beginStroke(color);
    g.moveTo(vts[0][0], vts[0][1]);
    var l = vts.length,
      n = 0;
    if (close) n = 1;

    for (var i = 1; i < l + n; i++) {
      if (bendAmount != 0 && (!bendTargets || 0 <= bendTargets.indexOf(i)))
        g.curveTo(vts2[i - 1][0], vts2[i - 1][1], vts[i % l][0], vts[i % l][1]);
      else g.lineTo(vts[i % l][0], vts[i % l][1]);
    }

    if (close) g.closePath();
    g.endStroke();
    if (segments) g.setStrokeDash([]);
  };

  /**
   * 座標配列から描画（線分）
   */
  this.drawVertexesLine = function (
    g,
    thick,
    color,
    vts,
    segments,
    start,
    end
  ) {
    if (typeof segments === "undefined") segments = null;
    if (typeof start === "undefined") start = 0;
    if (typeof end === "undefined") end = 1;

    if (vts.length == 0) return;

    var l = vts.length;

    var dsum = 0;
    var dlist = [];
    for (var i = 0; i < l - 1; i++) {
      var dx = vts[i + 1][0] - vts[i][0];
      var dy = vts[i + 1][1] - vts[i][1];

      var dist = Math.sqrt(dx * dx + dy * dy);
      dlist[i] = dist;
      dsum += dist;
    }

    var d0 = start * dsum;
    var d1 = end * dsum;

    if (segments) g.setStrokeDash(segments);
    g.setStrokeStyle(thick);
    g.beginStroke(color);

    var isFirst = true;
    for (var i = 0; i < l - 1; i++) {
      if (d0 < dlist[i]) {
        var p0 = d0 / dlist[i];
        var p1 = 0;

        if (d1 < dlist[i]) {
          p1 = d1 / dlist[i];
          d1 = 0;
        } else {
          p1 = 1;
          d1 -= dlist[i];
        }

        if (0 < p1) {
          var dx = vts[i + 1][0] - vts[i][0];
          var dy = vts[i + 1][1] - vts[i][1];

          if (isFirst) {
            isFirst = false;
            g.moveTo(vts[i][0] + dx * p0, vts[i][1] + dy * p0);
          }
          g.lineTo(vts[i][0] + dx * p1, vts[i][1] + dy * p1);
        }

        d0 = 0;
      } else {
        d0 -= dlist[i];
        d1 -= dlist[i];
      }
    }

    g.endStroke();
    if (segments) g.setStrokeDash([]);
  };

  /**
   * 三角波
   */
  this.drawTriangularWave = function (
    g,
    thick,
    color,
    x0,
    y0,
    x1,
    y1,
    interval,
    amt,
    seed,
    linearRatio,
    start,
    end,
    time,
    wavelength,
    amplitude
  ) {
    if (typeof interval === "undefined") interval = 10;
    if (typeof amt === "undefined") amt = 30;
    if (typeof seed === "undefined") seed = 0;
    if (typeof linearRatio === "undefined") linearRatio = 0.5;

    if (typeof start === "undefined") start = 0;
    if (typeof end === "undefined") end = 1;

    var dx = x1 - x0;
    var dy = y1 - y0;

    var dist = Math.sqrt(dx * dx + dy * dy);
    var distance = dist * end;

    var rad = Math.atan2(dy, dx);
    var x = dist * start,
      y = 0;

    var ct = 0;

    g.setStrokeStyle(thick);
    g.beginStroke(color);

    util.seed = seed;

    var waveEnabled = false;
    if (typeof amplitude !== "undefined" && typeof amplitude != 0) {
      waveEnabled = true;
      var dwavelen = (2 * Math.PI * interval) / wavelength;
    }

    while (1) {
      /// wave
      if (waveEnabled) y += Math.sin(time + ct * dwavelen) * amplitude;

      var p = util.rotatePoint(x, y, rad);
      p.x += x0;
      p.y += y0;

      if (ct == 0) g.moveTo(p.x, p.y);
      else g.lineTo(p.x, p.y);

      if (distance <= x) break;

      var ha = amt / 2;

      x += interval;
      if (util.random() < linearRatio) y = 0;
      else y = util.rand(-ha, ha);

      if (distance <= x) {
        x = distance;
        y = 0;
      }
      ct++;
    }
    g.endStroke();
  };

  /**
   * ||||||||| ← こんな感じの
   */
  this.drawBars = function (
    g,
    thick,
    color,
    x0,
    y0,
    x1,
    y1,
    interval,
    amt,
    seed,
    linearRatio,
    start,
    end
  ) {
    if (typeof interval === "undefined") interval = 10;
    if (typeof amt === "undefined") amt = 30;
    if (typeof seed === "undefined") seed = 0;
    if (typeof linearRatio === "undefined") linearRatio = 0.0;

    if (typeof start === "undefined") start = 0;
    if (typeof end === "undefined") end = 1;

    var dx = x1 - x0;
    var dy = y1 - y0;

    var dist = Math.sqrt(dx * dx + dy * dy);
    var distance = dist * end;

    var rad = Math.atan2(dy, dx);
    var x,
      y = 0;

    g.setStrokeStyle(thick);
    g.beginStroke(color);

    util.seed = seed;

    for (x = start * dist; x <= distance; x += interval) {
      y = util.rand(0, amt / 2);

      var ox = 0;
      if (util.random() < linearRatio) {
        y = 0;
        ox = interval / 2;
      }

      var p0 = util.rotatePoint(x - ox, -y, rad);
      p0.x += x0;
      p0.y += y0;
      var p1 = util.rotatePoint(x + ox, y, rad);
      p1.x += x0;
      p1.y += y0;

      g.moveTo(p0.x, p0.y);
      g.lineTo(p1.x, p1.y);
    }
  };
}

export { DLineGraphic };
