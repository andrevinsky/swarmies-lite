import { useNoSleepDirect } from '../../../logic/hooks/noSleepRef';
import { VscPin, VscPinned } from 'react-icons/vsc';
import { SquareButton } from '../../elements/SquareButton';

export function NoSleepPin() {
  const [ noSleepEnabled, toggleNoSleepEnabled ] = useNoSleepDirect();

  return <SquareButton topLeft
    onClick={ toggleNoSleepEnabled } title={ noSleepEnabled ?
    'No Sleep Enabled. Click to Disable' :
    'No Sleep Disabled. Click to Enable' }>{
    noSleepEnabled ?
      (<VscPinned />) :
      (<VscPin />)
  }</SquareButton>;
}
