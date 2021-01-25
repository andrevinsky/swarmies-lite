import { SquareButton } from '../../elements/SquareButton';
import { AiOutlineQrcode } from 'react-icons/all';
import { useDispatch } from 'react-redux';
import { uiCommandInvoke } from '../../../model/packs/ui';
import { useCallback } from 'react';

export const QRButton = () => {
  const dispatch = useDispatch();
  const handleShowPanel = useCallback(() => dispatch(uiCommandInvoke('qr')), [ dispatch ]);

  return <SquareButton bottomRight onClick={ handleShowPanel }
    style={ { position: 'fixed', zIndex: 2 } }><AiOutlineQrcode /></SquareButton>;
};
