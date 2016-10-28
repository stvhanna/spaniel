import Stream from './stream';
import W from './../window-proxy';
import Frame from './frame';
import { RAFPhase, StreamInterface } from './../interfaces';

let raf = new Stream({
  init() {
    let pollForAF = () => {
      this.write(Date.now());
      W.rAF(pollForAF);
    };
    W.rAF(pollForAF);
  },
  process(value: number | Frame) {
    if (typeof value === 'number') {
      let frame = new Frame(
        RAFPhase.MEASURE,
        value,
        W.getScrollTop(),
        W.getScrollLeft(),
        W.getWidth(),
        W.getHeight()
      );
      this.write(frame);
      frame.phase = RAFPhase.MUTATE;
      return frame;
    } else {
      return value;
    }
  }
});

let measure = raf.pipe(new Stream({
  process(frame: Frame) {
    if (frame.phase === RAFPhase.MEASURE) {
      return frame;
    }
  }
}));

export {
  StreamInterface,
  raf,
  measure
};
