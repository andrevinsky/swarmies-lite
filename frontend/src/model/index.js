import messages from './packs/messages';
import commands from './packs/commands';
import ui from './packs/ui';
import { combineReducers } from 'redux';

export default combineReducers({
  ...messages,
  ...commands,
  ...ui,
});
