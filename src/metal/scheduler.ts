/*
Copyright 2017 LinkedIn Corp. Licensed under the Apache License,
Version 2.0 (the "License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License
at http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

import {
  EngineInterface,
  SchedulerInterface,
  ElementSchedulerInterface,
  FrameInterface,
  QueueInterface
} from './interfaces';
import W from './window-proxy';

import { default as Queue, DOMQueue} from './queue';
import { getGlobalEngine } from './engine';

import { getBoundingClientRect } from '../utils';

const TOKEN_SEED = 'xxxx'.replace(/[xy]/g, function(c) {
  let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});
let tokenCounter = 0;
let elementSchedulerCounter = 0;

export class Frame implements FrameInterface {
  constructor(
    public timestamp: number,
    public scrollTop: number,
    public scrollLeft: number,
    public width: number,
    public height: number,
    public x: number,
    public y: number,
    public top: number,
    public left: number
  ) {}
  static generate(root?: Element): Frame {
    if (root && document.documentElement.contains(root)) {
      let rootClientRect = getBoundingClientRect(root);
      return new Frame(
        Date.now(),
        root.scrollTop,
        root.scrollLeft,
        rootClientRect.width,
        rootClientRect.height,
        rootClientRect.x,
        rootClientRect.y,
        rootClientRect.top,
        rootClientRect.left
      );
    }
    return new Frame(
      Date.now(),
      W.meta.scrollTop,
      W.meta.scrollLeft,
      W.meta.width,
      W.meta.height,
      0,
      0,
      0,
      0
    );
  }
}

export function generateToken() {
  return tokenCounter++ + TOKEN_SEED;
}

export abstract class BaseScheduler {
  protected root: Element;
  protected engine: EngineInterface;
  protected queue: QueueInterface;
  protected isTicking: Boolean = false;
  protected toRemove: Array<string| Element | Function> = [];
  protected id?: string;

  constructor(customEngine?: EngineInterface, root?: Element) {
    if (customEngine) {
      this.engine = customEngine;
    } else {
      this.engine = getGlobalEngine();
    }

    if (root) {
      this.root = root;
    }
  }
  protected abstract applyQueue(frame: Frame): void;

  protected tick() {
    if (this.queue.isEmpty()) {
      this.isTicking = false;
    } else {
      if (this.toRemove.length > 0) {
        for (let i = 0; i < this.toRemove.length; i++) {
          this.queue.remove(this.toRemove[i]);
        }
        this.toRemove = [];
      }
      this.applyQueue(Frame.generate(this.root));
      this.engine.scheduleRead(this.tick.bind(this));
    }
  }
  scheduleWork(callback: Function) {
    this.engine.scheduleWork(callback);
  }
  scheduleRead(callback: Function) {
    this.engine.scheduleRead(callback);
  }
  queryElement(el: Element, callback: (clientRect: ClientRect, frame: Frame) => void) {
    let clientRect: ClientRect = null;
    let frame: Frame = null;
    this.engine.scheduleRead(() => {
      clientRect = getBoundingClientRect(el);
      frame = Frame.generate();
    });
    this.engine.scheduleWork(() => {
      callback(clientRect, frame);
    });
  }
  unwatch(id: string| Element | Function) {
    this.toRemove.push(id);
  }
  unwatchAll() {
    this.queue.clear();
    if (this.id) {
      W.disconnectIsDirtyListener(this.id);
    }
  }
  startTicking() {
    if (!this.isTicking) {
      this.isTicking = true;
      this.engine.scheduleRead(this.tick.bind(this));
    }
  }
}

export class Scheduler extends BaseScheduler implements SchedulerInterface {
  protected queue: Queue = new Queue();
  applyQueue(frame: Frame) {
    for (let i = 0; i < this.queue.items.length; i++) {
      let { id, callback } = this.queue.items[i];
      callback(frame, id);
    }
  }
  watch(callback: (frame: FrameInterface) => void): string {
    this.startTicking();
    let id = generateToken();
    this.queue.push({
      callback,
      id
    });
    return id;
  }
}

export class PredicatedScheduler extends Scheduler implements SchedulerInterface {
  predicate: (frame: Frame) => Boolean;
  constructor(predicate: (frame: Frame) => Boolean) {
    super(null);
    this.predicate = predicate;
  }
  applyQueue(frame: Frame) {
    if (this.predicate(frame)) {
      super.applyQueue(frame);
    }
  }
}

export class ElementScheduler extends BaseScheduler implements ElementSchedulerInterface {
  protected queue: DOMQueue;
  protected isDirty: boolean = false;

  constructor(customEngine?: EngineInterface, root?: Element) {
    super(customEngine, root);
    this.queue = new DOMQueue();
    this.id = 'element-scheduler-' + elementSchedulerCounter++;
    this.initWindowIsDirtyListeners();
  }

  applyQueue(frame: Frame) {
    for (let i = 0; i < this.queue.items.length; i++) {
      let { callback, el, id, clientRect } = this.queue.items[i];

      if (this.isDirty || !clientRect) {
        clientRect = this.queue.items[i].clientRect = getBoundingClientRect(el);
      }

      callback(frame, id, clientRect);
    }

    this.isDirty = false;
  }

  watch(el: Element, callback: (frame: FrameInterface, id: string, clientRect?: ClientRect | null) => void, id?: string): string {
    this.startTicking();
    id = id || generateToken();
    let clientRect = null;

    this.queue.push({
      el,
      callback,
      id,
      clientRect
    });
    return id;
  }

  initWindowIsDirtyListeners() {
    W.onWindowIsDirtyListeners.push({ fn: this.windowIsDirtyHandler, scope: this, id: this.id });
  }

  windowIsDirtyHandler() {
    this.isDirty = true;
  }
}

let globalScheduler: Scheduler = null;

export function getGlobalScheduler() {
  return globalScheduler || (globalScheduler = new Scheduler());
}
