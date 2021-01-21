import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import { defaultChannelName } from 'swarmies-lite-shared';
import { safelyUnwrapJson } from '../utils/json';
import { incomingMessageAction } from '../../model/packs/messages';

const ENDPOINT = process.env.REACT_APP_WS_ENDPOINT;

export const useWsConnection = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT, {
      // TODO: provide options to reconnect!
    });

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
