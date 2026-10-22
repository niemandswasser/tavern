'use strict';
(() => {
  // Four-connected fill; recolor before queueing so each pixel is visited once.
  function floodFill(data,width,height,x,y,color) {
    x = Math.floor(x);y = Math.floor(y);
    if (x < 0 || y < 0 || x >= width || y >= height) return 0;
    const start = y * width + x, offset = start * 4, target = Array.from(data.slice(offset,offset + 4));
    if (target.every((channel,i) => channel === color[i])) return 0;
    const queue = new Uint32Array(width * height);let head = 0, tail = 0;
    function visit(index) {
      const at = index * 4;
      if (!target.every((channel,i) => data[at + i] === channel)) return;
      data.set(color,at);queue[tail++] = index;
    }
    visit(start);
    while (head < tail) {
      const index = queue[head++], column = index % width;
      if (column > 0) visit(index - 1);if (column < width - 1) visit(index + 1);
      if (index >= width) visit(index - width);if (index < width * (height - 1)) visit(index + width);
    }
    return tail;
  }
  function pixelLine(x,y,endX,endY,draw) {
    const dx = Math.abs(endX - x), dy = -Math.abs(endY - y), sx = x < endX ? 1 : -1, sy = y < endY ? 1 : -1;let error = dx + dy;
    while (true) {draw(x,y);if (x === endX && y === endY) break;const twice = 2 * error;if (twice >= dy) {error += dy;x += sx;}if (twice <= dx) {error += dx;y += sy;}}
  }
  globalThis.TavernPaint = {floodFill,pixelLine};
})();
