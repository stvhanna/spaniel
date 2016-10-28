import w from './window-proxy';
import {
  raf as RAFStream,
  measure as measureStream
} from './streams/streams';
import { default as QueueElement, QueueDOMElement } from './queues/element';
import Frame from './streams/frame';
import { default as Queue, DOMQueue } from './queues/queue';
import { Terminal, default as Stream } from './streams/stream';
import { QueueElementInterface, QueueDOMElementInterface, StreamInterface, QueueInterface } from './interfaces';

interface AbsoluteRect {
  top: number;
  bottom: number;
  width: number;
  height: number;
}

interface Offset {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export {
  Offset,
  Frame,
  RAFStream,
  QueueElementInterface,
  QueueDOMElementInterface,
  StreamInterface,
  QueueInterface,
  Stream,
  Queue,
  DOMQueue,
  QueueElement,
  QueueDOMElement,
  Terminal
};
