import { handleActions } from 'redux-actions';
import { actionType } from 'redux-actions-lite';

export const incomingMessageAction = actionType(`Incoming message by WS`);

const ns = 'msg';
const reducer = {
  [ ns ]: handleActions({
    [ incomingMessageAction ](state, { payload }) {
      return JSON.stringify(payload);
    }
  }, null)
};

export default reducer;

export const accessLastMessage = () => ({ [ ns ]: state }) => state;
