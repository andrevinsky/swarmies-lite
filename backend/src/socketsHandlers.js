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


const makeSeriesColorCommandIter = makeSeriesOfColorCommands(makeStaticColorCommand)([
  '#ffff0080', '#00ff8080', '#8000ff80'
]);
const makeSeriesColorTransCommandIter = makeSeriesOfColorTransitionCommands(makeStaticColorCommand)([
  '#ff000080', '#00ff0080', '#0000ff80'
], colorTransitionWithStops(64));

const makeSeriesColorCommand = () => makeSeriesColorTransCommandIter.next().value;

const worker = makeWorker(makeSeriesColorCommand);

export const socketsOnConnectionHandler = socket => {
  console.log('New client connected', new Date());
  const unsub = subscribeToSwarm(worker, socket);
  socket.on('disconnect', () => {
    console.log('Client disconnected', new Date());
    unsub && unsub();
  });
};

function makeResponse(payload) {
  return JSON.stringify(payload);
}

/////////

function makeStaticColorCommand(hint = '#ffffff80') {
  //  console.log('Producing color: ' + hint);
  return { command: 'COLOR', arg: hint };
}

function makeSeriesOfColorCommands(commandMaker) {
  return function* makeSeriesOfColorsGen(source) {
    for (; ;) {
      for (const el of source) {
        yield commandMaker ? commandMaker(el) : el;
      }
    }
  };
}

function makeSeriesOfColorTransitionCommands(commandMaker) {
  return function* makeTransitionedSeriesOfColorGen(source, transition) {
    let prev = null;
    for (; ;) {
      for (const el of source) {
        if (prev) {
          for (const el0 of transition(prev, el)) {
            prev = el0;
            yield commandMaker ? commandMaker(el0) : el0;
          }
        } else {
          prev = el;
          yield commandMaker ? commandMaker(el) : el;
        }
      }
    }
  };
}


function colorTransitionWithStops(stops) {

  return function* colorTransition(start, end) {
    if (start === end) {
      yield end;
      return;
    }
    const hslaStart = breakDownColorIntoHslaArray(start);
    const hslaEnd = breakDownColorIntoHslaArray(end);

    const fromHue = hslaStart[ 0 ];
    const toHue = hslaEnd[ 0 ];

    const [ fromHValue, toHValue ] = (fromHue < toHue ) ? (
      dist(fromHue, toHue) < dist(fromHue + 360, toHue) ? [ fromHue, toHue ] : [ fromHue + 360, toHue ]
    ) : (
      dist(fromHue, toHue + 360) < dist(fromHue + 360, toHue + 360 * 2) ? [ fromHue, toHue + 360 ] : [ fromHue + 360, toHue + 360 * 2 ]
    );

    console.log(`Transition hue from ${ fromHValue} to ${ toHValue } (${ start } -> ${ end }). Route: ${ fromHValue} to ${ toHValue }`);

    for (let i = 0, iMax = stops + 1; i < iMax; i++) {
      let hsla = [
        (fromHValue + (toHValue - fromHValue) * i / stops) % 360,
        hslaStart[ 1 ] + (hslaEnd[ 1 ] - hslaStart[ 1 ]) * i / stops,
        hslaStart[ 2 ] + (hslaEnd[ 2 ] - hslaStart[ 2 ]) * i / stops,
        hslaStart[ 3 ] + (hslaEnd[ 3 ] - hslaStart[ 3 ]) * i / stops
      ];
      let result = '#' + (hsl.hex(hsla) + (Math.floor(Math.max(Math.min(1, hsla[ 3 ]), 0) * 255)).toString(16)).toLowerCase();
      //      console.log(`Transition from ${ start } -> ${ result } -> ${ end }, stop #${ i }`)
      yield result;
    }
  };
}

function breakDownColorIntoHslaArray(hexColor) {
  const parsedColor = colorParse(hexColor);
  return [
    ...(/^hsl/i.test(parsedColor.space) ? parsedColor.values : rgb.hsl(...parsedColor.values)),
    typeof parsedColor.alpha === 'undefined' ? 1.0 : parsedColor.alpha
  ];
}

function dist(a, b) {
  return Math.max(a, b) - Math.min(a, b);
}
