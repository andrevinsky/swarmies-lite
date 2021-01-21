import { useDispatch } from 'react-redux';
import socketIOClient from 'socket.io-client';
import { useEffect } from 'react';
import { incomingMessageAction } from '../model/packs/messages';
import { defaultChannelName } from 'swarmies-lite-shared';

const ENDPOINT = process.env.REACT_APP_WS_ENDPOINT;

export const useWsConnection = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on(defaultChannelName, data => {
      const [ err, command ] = safelyUnwrapJson(data);
      if (err) {
        dispatch(incomingMessageAction({ command: 'default', arg: data }));
      }
      dispatch(incomingMessageAction(command));
    });
    return () => socket.disconnect();
  }, [ dispatch ]);
};


function safelyUnwrapJson(json) {
  try { return [ null, JSON.parse(json) ];} catch (ex) { return [ ex ]; }
}
