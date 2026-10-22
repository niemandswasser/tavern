'use strict';
// Standalone game rules. No network, DOM, dependencies or saved personal data.
(() => {
  function shuffle(items, random = Math.random) {
    for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
    return items;
  }
  class Minesweeper {
    constructor(size = 9, mines = 10, random = Math.random) {
      this.size = size; this.mines = mines; this.random = random;
      this.cells = Array.from({length:size * size}, () => ({mine:false, adjacent:0, open:false, flag:false}));
      this.status = 'ready'; this.revealed = 0; this.exploded = -1;
    }
    neighbors(index) {
      const row = Math.floor(index / this.size), column = index % this.size, result = [];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const y = row + dy, x = column + dx;
        if ((dy || dx) && y >= 0 && y < this.size && x >= 0 && x < this.size) result.push(y * this.size + x);
      }
      return result;
    }
    plant(first) {
      const safe = new Set([first, ...this.neighbors(first)]);
      const candidates = shuffle(this.cells.map((_, i) => i).filter(i => !safe.has(i)), this.random);
      for (const index of candidates.slice(0, this.mines)) this.cells[index].mine = true;
      this.cells.forEach((cell, i) => cell.adjacent = this.neighbors(i).filter(n => this.cells[n].mine).length);
      this.status = 'playing';
    }
    flag(index) {
      const cell = this.cells[index];
      if (!cell || cell.open || ['won','lost'].includes(this.status)) return false;
      cell.flag = !cell.flag; return true;
    }
    reveal(index) {
      const cell = this.cells[index];
      if (!cell || cell.flag || ['won','lost'].includes(this.status)) return false;
      if (cell.open) {
        const neighbors = this.neighbors(index);
        if (!cell.adjacent || neighbors.filter(n => this.cells[n].flag).length !== cell.adjacent) return false;
        return this.openMany(neighbors.filter(n => !this.cells[n].flag && !this.cells[n].open));
      }
      if (this.status === 'ready') this.plant(index);
      return this.openMany([index]);
    }
    openMany(queue) {
      let changed = false;
      while (queue.length && this.status === 'playing') {
        const index = queue.pop(), cell = this.cells[index];
        if (cell.open || cell.flag) continue;
        changed = true; cell.open = true;
        if (cell.mine) { this.status = 'lost'; this.exploded = index; break; }
        this.revealed++;
        if (!cell.adjacent) queue.push(...this.neighbors(index).filter(n => !this.cells[n].open && !this.cells[n].flag));
      }
      if (this.status === 'playing' && this.revealed === this.cells.length - this.mines) {
        this.status = 'won'; for (const cell of this.cells) if (cell.mine) cell.flag = true;
      }
      return changed;
    }
    get flags() { return this.cells.filter(cell => cell.flag).length; }
  }
  class Solitaire {
    constructor(random = Math.random) {
      this.undoStack = [];
      const deck = shuffle(Array.from({length:52},(_,id) => ({id,rank:id % 13 + 1,suit:Math.floor(id / 13),up:false})),random);
      this.state = {stock:[], waste:[], foundations:[[],[],[],[]], tableau:[[],[],[],[],[],[],[]], moves:0, won:false};
      this.state.tableau.forEach((pile,index) => { for (let i = 0; i <= index; i++) pile.push(deck.pop()); pile.at(-1).up = true; });
      this.state.stock = deck;
    }
    getPile(location) {
      if (location.zone === 'stock' || location.zone === 'waste') return this.state[location.zone];
      if (location.zone === 'tableau') return this.state.tableau[location.pile];
      if (location.zone === 'foundation') return this.state.foundations[location.pile];
      return null;
    }
    cardsAt(source) {
      const pile = this.getPile(source);
      if (!pile?.length || source.zone === 'stock') return [];
      if (source.zone === 'tableau') {
        if (!Number.isInteger(source.index) || source.index < 0 || source.index >= pile.length) return [];
        const cards = pile.slice(source.index);
        if (cards.some(card => !card.up)) return [];
        for (let i = 1; i < cards.length; i++) if (cards[i - 1].rank !== cards[i].rank + 1 || this.isRed(cards[i - 1]) === this.isRed(cards[i])) return [];
        return cards;
      }
      return [pile.at(-1)];
    }
    isRed(card) { return card.suit === 1 || card.suit === 2; }
    canMove(source, target) {
      if (!source || !target || this.state.won || (source.zone === target.zone && source.pile === target.pile)) return false;
      const cards = this.cardsAt(source), destination = this.getPile(target);
      if (!cards.length || !destination) return false;
      const first = cards[0], last = destination.at(-1);
      if (target.zone === 'tableau') return last ? last.up && last.rank === first.rank + 1 && this.isRed(last) !== this.isRed(first) : first.rank === 13;
      if (target.zone === 'foundation' && cards.length === 1) return last ? last.suit === first.suit && last.rank + 1 === first.rank : first.rank === 1;
      return false;
    }
    remember() { this.undoStack.push(JSON.stringify(this.state)); if (this.undoStack.length > 200) this.undoStack.shift(); }
    draw() {
      if (this.state.won || (!this.state.stock.length && !this.state.waste.length)) return false;
      this.remember();
      if (this.state.stock.length) {const card = this.state.stock.pop();card.up = true;this.state.waste.push(card);}
      else { this.state.stock = this.state.waste.reverse();this.state.waste = [];this.state.stock.forEach(card => card.up = false); }
      this.state.moves++; return true;
    }
    move(source, target) {
      if (!this.canMove(source,target)) return false;
      const from = this.getPile(source), cards = this.cardsAt(source);
      this.remember();from.splice(from.length - cards.length);this.getPile(target).push(...cards);
      if (source.zone === 'tableau' && from.length) from.at(-1).up = true;
      this.state.moves++;this.state.won = this.state.foundations.every(pile => pile.length === 13);return true;
    }
    toFoundation(source) {
      for (let pile = 0; pile < 4; pile++) if (this.move(source,{zone:'foundation',pile})) return true;
      return false;
    }
    autoFoundation() {
      let moved = false, repeat = true;
      while (repeat) {
        repeat = false;
        const sources = [{zone:'waste'},...this.state.tableau.map((cards,pile) => ({zone:'tableau',pile,index:cards.length - 1}))];
        for (const source of sources) if (this.toFoundation(source)) {moved = true;repeat = true;}
      }
      return moved;
    }
    undo() { const previous = this.undoStack.pop();if (!previous) return false;this.state = JSON.parse(previous);return true; }
  }
  globalThis.TavernGames = {Minesweeper,Solitaire};
})();
