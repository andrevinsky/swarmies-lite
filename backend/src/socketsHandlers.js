import { defaultChannelName } from 'swarmies-lite-shared';
import { EventEmitter } from 'events';
import colorParse from 'color-parse';
import { hsl, rgb } from 'color-convert';


const createLastMessageListener = store => message => store.lastMessage = message;

class CommandsCoordinator {
  constructor(commandsGenFunction) {
    console.log('CommandsCoordinator.ctor');
    this.commandsGenFn = commandsGenFunction;
  }

  start() {
    console.log('CommandsCoordinator.start', !!this);
    if (!this.isStopped) {
      return;
    }
    const emitter = new EventEmitter();
    this.lastMessageHandler = createLastMessageListener(this);
    emitter.on('message', this.lastMessageHandler);
    this.cleanupEmitter = () => emitter.off('message', this.lastMessageHandler);
    this.isCurrentEmitterEmpty = () => emitter.listenerCount('message') === 1;
    this.emitter = emitter;

    const makeIntervalHandler = (emitter, commandsGenFn) => () => {
      const payload = makeResponse(commandsGenFn());
      console.log('Emitting message', JSON.stringify(payload), !!emitter);
      emitter.emit('message', commandsGenFn());
    };

    this.interval = setInterval(makeIntervalHandler(emitter, this.commandsGenFn), 1000);
  }

  tryAndDispose() {
    if (this.isCurrentEmitterEmpty && this.isCurrentEmitterEmpty()) {
      this.stop();
    }
  }

  stop() {
    this.cleanupEmitter && this.cleanupEmitter();
    delete this.cleanupEmitter;
    delete this.lastMessageHandler;
    delete this.emitter;

    if (this.interval) {
      clearInterval(this.interval);
      delete this.interval;
    }
  }

  get isStopped() {
    console.log('isStopped');
    return !this.interval;
  }

  subscribeSocket(socketAsEmitter) {
    console.log('subscribeSocket', this, this.interval);

    // subscribe socket to on message
    // emit last command
    const handler = message => socketAsEmitter.emit(defaultChannelName, makeResponse(message));
    if (this.lastMessage) {
      handler(this.lastMessage);
    }
    this.emitter && this.emitter.on('message', handler);

    const coordinator = this;
    return function unsubscribeSocket() {
      console.log('Unsubscribe', coordinator, coordinator.interval);
      socketAsEmitter.off('message', handler);
      coordinator.tryAndDispose();
    };
  }
}


const makeSeriesColorCommandIter = makeSeriesOfColorCommands(makeStaticColorCommand)([
  '#ffff0080', '#00ff8080', '#8000ff80'
]);
const makeSeriesColorTransCommandIter = makeSeriesOfColorTransitionCommands(makeStaticColorCommand)([
  '#ff000080', '#00ff0080', '#0000ff80'
], colorTransitionWithStops(64));

const makeSeriesColorCommand = () => {
  console.log('makeSeriesColorCommand..next()');
  return makeSeriesColorTransCommandIter.next().value;
};

const coordinator = {
  current: new CommandsCoordinator(makeSeriesColorCommand)
};

export const socketsOnConnectionHandler = socket => {
  console.log('New client connected', new Date());
  if (coordinator.current.isStopped) {
    coordinator.current.start();
  }
  const unsubscribeSocket = coordinator.current.subscribeSocket(socket);

  socket.on('disconnect', () => {
    console.log('Client disconnected', new Date());
    unsubscribeSocket();
  });
};

function makeResponse(payload) {
  return JSON.stringify(payload);
}

/////////

function makeStaticColorCommand(hint = '#ffffff80') {
    console.log('makeStaticColorCommand color: ' + hint);
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

    const [ fromHValue, toHValue ] = (fromHue < toHue) ? (
      dist(fromHue, toHue) < dist(fromHue + 360, toHue) ? [ fromHue, toHue ] : [ fromHue + 360, toHue ]
    ) : (
      dist(fromHue, toHue + 360) < dist(fromHue + 360, toHue + 360 * 2) ? [ fromHue, toHue + 360 ] : [ fromHue + 360, toHue + 360 * 2 ]
    );

    console.log(`Transition hue from ${ fromHValue } to ${ toHValue } (${ start } -> ${ end }). Route: ${ fromHValue } to ${ toHValue }`);

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
