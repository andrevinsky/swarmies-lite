import { useSelector } from 'react-redux';
import { accessLastMessage } from '../../../model/packs/messages';
import { useWsConnection } from '../../../logic/hooks/wsConnection';
import { NoSleepPin } from '../NoSleep';
import { QRButton } from '../QRButton';
import { BodyBgColor } from '../BodyBgColor';
import { View } from '../../elements/View';
import { SharePanel } from '../SharePanel';

function WsCommandNotifier() {
  const response = useSelector(accessLastMessage());

  if (!response) {
    return (<pre>No response yet.</pre>);
  }

  return (<pre>
    <code>{ response }</code>
  </pre>);
}

export function App() {
  useWsConnection();

  return <>
    <BodyBgColor />
    <NoSleepPin />
    <QRButton />
    <View>
      <SharePanel />
      <WsCommandNotifier />
    </View>
  </>;
}

