import { useSelector } from 'react-redux';
import { useNoSleep } from 'use-no-sleep';
import { accessLastMessage } from '../../../model/packs/messages';
import { useWsConnection } from '../../../logic/hooks';
import viewTheme from './view.module.scss';
import { accessCurrentColor } from '../../../model/packs/commands';
import { useCallback, useState } from 'react';

function WsCommandNotifier() {
  const response = useSelector(accessLastMessage());
  const [ noSleepEnabled, setNoSleepEnabled ] = useState(false);

  const noSleepHanlder = useCallback(() => {
    // https://richtr.github.io/NoSleep.js/example/
    setNoSleepEnabled(!noSleepEnabled)
  }, [ noSleepEnabled, setNoSleepEnabled ]);

  useNoSleep(noSleepEnabled);
  return (<div>
    It's <span>{ response }</span>
    <br/>
    <button onClick={ noSleepHanlder }>{ noSleepEnabled ? 'Disable No Sleep' : 'Enable No Sleep'}</button>
  </div>);
}

function View({ children, bgColor, ...etc }) {
  const { className, style } = etc;
  const resultingStyle = Object.assign(
    style ? style : {},
    bgColor ? { 'backgroundColor': bgColor } : {});

  return <div className={ className ? [ className, viewTheme.view ].join(' ') : viewTheme.view } { ...etc }
    style={ resultingStyle }>{
    children
  }</div>;
}

export function App() {
  useWsConnection();

  const color = useSelector(accessCurrentColor());
  console.log(color);

  return <View bgColor={ color || '#ffffff80' }>
    <WsCommandNotifier />
  </View>;
}

