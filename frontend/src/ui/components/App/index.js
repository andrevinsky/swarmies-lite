import { useSelector } from 'react-redux';
import { accessLastMessage } from '../../../model/packs/messages';
import { accessCurrentColor } from '../../../model/packs/commands';
import { useWsConnection } from '../../../logic/hooks/wsConnection';
import { useNoSleepDirect } from '../../../logic/hooks/noSleepRef';
import viewTheme from './view.module.scss';

function WsCommandNotifier() {
  const [ noSleepEnabled, toggleNoSleepEnabled ] = useNoSleepDirect();
  const response = useSelector(accessLastMessage());

  if (!response) {
    return (<div>No response yet.</div>)
  }
  return (<div>
    <div>{ response }</div>
    <br />
    <br />
    <button onClick={ toggleNoSleepEnabled }>{ noSleepEnabled ? 'Disable No Sleep' : 'Enable No Sleep' }</button>
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
  console.log({ color });

  return <View bgColor={ color || '#ffffff80' }>
    <WsCommandNotifier />
  </View>;
}

