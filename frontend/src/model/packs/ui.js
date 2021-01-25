import { actionType } from 'redux-actions-lite';
import { handleActions } from 'redux-actions';

export const uiCommandInvoke = actionType(`UI-related action. Request to show panel`,
  (panel) => ({ panel }));
export const uiCommandDismiss = actionType(`UI-related action. Request to hide panel`,
  (panel) => ({ panel }));

const ns = 'ui';
const reducer = {
  [ ns ]: handleActions({
    [ uiCommandInvoke ] (state, { payload: { panel } }) {
      return {
        ...state,
        [ panel ]: true
      };
    },
    [ uiCommandDismiss ] (state, { payload: { panel } }) {
      return {
        ...state,
        [ panel ]: false
      };
    },
  }, {})
};

export default reducer;

export const accessUIPanelState = panel => ({ [ns]: state }) => state[ panel ] ?? false;
