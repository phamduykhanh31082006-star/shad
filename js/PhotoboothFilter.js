/*
 * Photobooth Multi-Shot Filter v1.2
 * Source-only filter pipeline, free/open source. No camera, network, or DOM access.
 * An actual app integration MUST provide each captured image via addFrame().
 * Neither a CA certificate nor an HTTP rewrite can provide native camera frames.
 * MIT license: see photobooth/LICENSE in repository.
 */
(function (root) {
  'use strict';
  const MAX_FRAMES = 4;

  class PhotoboothFilter {
    constructor(options = {}) {
      this._frames = Array(MAX_FRAMES).fill(null);
      this._count = 0;
      this._cursor = 0;
      this._version = 0;
      this._validate = typeof options.validateFrame === 'function'
        ? options.validateFrame : value => value !== null && value !== undefined;
    }

    get count() { return this._count; }
    get capacity() { return MAX_FRAMES; }
    get isReady() { return this._count === MAX_FRAMES; }
    get nextSlot() { return this._cursor; }
    get version() { return this._version; }
    get frames() { return this._frames.slice(); }

    _index(index) {
      if (!Number.isInteger(index) || index < 0 || index >= MAX_FRAMES) {
        throw new RangeError('Frame index must be 0, 1, 2, or 3');
      }
      return index;
    }

    addFrame(image, index = null) {
      if (!this._validate(image)) throw new TypeError('Invalid captured frame');
      const i = index == null ? this._frames.findIndex(frame => frame === null) : this._index(index);
      if (i === -1) throw new Error('All four slots are filled; select a slot to retake');
      if (this._frames[i] === null) this._count += 1;
      this._frames[i] = image;
      this._cursor = this._frames.findIndex(frame => frame === null);
      this._version += 1;
      return {slot: i, count: this._count, ready: this.isReady, version: this._version};
    }

    async capture(frameProvider, index = null) {
      if (typeof frameProvider !== 'function') throw new TypeError('Provide a camera frame callback');
      const frame = await frameProvider();
      return this.addFrame(frame, index);
    }

    removeFrame(index) {
      const i = this._index(index);
      if (this._frames[i] !== null) {
        this._frames[i] = null;
        this._count -= 1;
        this._version += 1;
      }
      this._cursor = this._frames.findIndex(frame => frame === null);
      return this.state();
    }

    reset() {
      this._frames.fill(null);
      this._count = 0;
      this._cursor = 0;
      this._version += 1;
      return this.state();
    }

    state() {
      return Object.freeze({
        count: this._count,
        capacity: MAX_FRAMES,
        ready: this.isReady,
        nextSlot: this._cursor,
        version: this._version,
        filled: Object.freeze(this._frames.map(frame => frame !== null))
      });
    }

    compose(compositor, config = {}) {
      if (!this.isReady) throw new Error('Capture four frames before composing');
      if (typeof compositor !== 'function') throw new TypeError('Provide a compositor callback');
      return compositor(this.frames, config);
    }
  }

  const api = Object.freeze({ PhotoboothFilter, version: '1.2.0' });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.PhotoboothMultiShot = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
