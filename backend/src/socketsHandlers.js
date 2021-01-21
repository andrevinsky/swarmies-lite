import { defaultChannelName } from 'swarmies-lite-shared';
import { EventEmitter } from 'events';
import colorParse from 'color-parse';
import { hsl, rgb } from 'color-convert';

const emitterRef = {
  current: null
};

const lastMessageListener = message => emitterRef.lastMessage = message;
const subscribeToSwarm = (worker, socket) => {
  if (!emitterRef.current) {
    emitterRef.current = new EventEmitter();
    emitterRef.unsubAll = worker(emitterRef.current);
    emitterRef.current.on('message', lastMessageListener);
  }
  const emitter = emitterRef.current;
  emitterRef.lastMessage && socket.emit(defaultChannelName, makeResponse(emitterRef.lastMessage));
  const handler = message => socket.emit(defaultChannelName, makeResponse(message));
  emitter.on('message', handler);
  return () => {
    emitter.off('message', handler);
    if (emitter.listenerCount('message') === 1) {
      emitter.off('message', lastMessageListener);
      emitter.current = null;
      emitterRef.unsubAll && emitterRef.unsubAll();
      delete emitterRef.unsubAll;
      delete emitterRef.lastMessage;
    }
  };
};

function makeWorker(fn) {
  return function intervalWorker(emitter) {
    console.log('Started worker');
    let interval = setInterval(() => {
      emitter.emit('message', fn());
    }, 1000);
    return () => {
      interval && clearInterval(interval);
      interval = null;
    };
  };
}


const makeSeriesColorCommandIter = makeSeriesOfColorsGen([ '#ffff0080', '#00ff8080', '#8000ff80' ], makeStaticColorCommand);
const makeSeriesColorTransCommandIter = makeTransitionedSeriesOfColorGen(
  [ '#ff000080', '#00ff0080', '#0000ff80' ],
  colorTransitionWithStops(40),
  makeStaticColorCommand);
const makeSeriesColorCommand = () => makeSeriesColorTransCommandIter.next().value;

const worker = makeWorker(makeSeriesColorCommand);

export const socketsOnConnectionHandler = socket => {
  console.log('New client connected', new Date());
  const unsub = subscribeToSwarm(worker, socket);
  socket.on('disconnect', unsub);
};

function makeResponse(payload) {
  return JSON.stringify(payload);
}

function makeStaticColorCommand(hint = '#ffffff80') {
//  console.log('Producing color: ' + hint);
  return { command: 'COLOR', arg: hint };
}

function* makeSeriesOfColorsGen(source, fn) {
  for (; ;) {
    for (const el of source) {
      yield fn ? fn(el) : el;
    }
  }
}

function* makeTransitionedSeriesOfColorGen(source, transition, fn) {
  let prev = null;
  for (; ;) {
    for (const el of source) {
      if (prev) {
        yield* transition(prev, el, fn);
      } else {
        prev = el;
        yield fn ? fn(el) : el;
      }
    }
  }
}

function colorTransitionWithStops(stops) {

  return function* colorTransition(start, end, fn) {
    if (start === end) {
      yield fn ? fn(end) : end;
      return;
    }
    const startSplit = colorParse(start);
    const endSplit = colorParse(end);
    const hslaStart = [ ...(/^hsl/i.test(startSplit.space) ? startSplit.values : rgb.hsl(...startSplit.values)),
      typeof startSplit.alpha === 'undefined' ? 1.0 : startSplit.alpha ];
    const hslaEnd = [ ...(/^hsl/i.test(endSplit.space) ? endSplit.values : rgb.hsl(...endSplit.values)),
      typeof startSplit.alpha === 'undefined' ? 1.0 : startSplit.alpha ];

    for (let i = 0, iMax = stops + 1; i < iMax; i++) {
      let hsla = [
        hslaStart[ 0 ] + (hslaEnd[ 0 ] - hslaStart[ 0 ]) * i / stops,
        hslaStart[ 1 ] + (hslaEnd[ 1 ] - hslaStart[ 1 ]) * i / stops,
        hslaStart[ 2 ] + (hslaEnd[ 2 ] - hslaStart[ 2 ]) * i / stops,
        hslaStart[ 3 ] + (hslaEnd[ 3 ] - hslaStart[ 3 ]) * i / stops
      ];
      let result = '#' +( hsl.hex(hsla) + (Math.floor(Math.max(Math.min(1, hsla[3]), 0) * 255)).toString(16)).toLowerCase();
//      console.log(`Transition from ${ start } -> ${ result } -> ${ end }, stop #${ i }`)
      yield fn ? fn(result) : result;
    }
  };
}

