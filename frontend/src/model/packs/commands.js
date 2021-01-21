import { handleActions } from 'redux-actions';
import { incomingMessageAction } from './messages';

const ns = 'cmd';
const reducer = {
  [ ns ]: handleActions({
    [ incomingMessageAction ](state, { payload }) {
      if (!payload) {
        return state;
      }
      const { command, arg } = payload;
      return {
        ...state,
        ...(command === 'COLOR' ? { color: arg } : {})
      };
    }
  }, { color: null })
};

export default reducer;

export const accessCurrentColor = () => ({ [ ns ]: state }) => state.color;
