import messages from './packs/messages';
import commands from './packs/commands';
import { combineReducers } from 'redux';

export default combineReducers({
  ...messages,
  ...commands
});
