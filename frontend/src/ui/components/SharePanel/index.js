import { QRCode } from 'react-qr-svg';
import { accessUIPanelState, uiCommandDismiss } from '../../../model/packs/ui';
import { useDispatch, useSelector } from 'react-redux';
import { useMemo } from 'react';
import { If } from '../../elements/Branching';
import { View } from '../../elements/View';
import theme from './sharePanel.module.scss';

export const SharePanel = () => {
  const qrPanelShown = useSelector(accessUIPanelState('qr'));
  const dispatch = useDispatch();
  const handleDismissPanel = useMemo(() => () => dispatch(uiCommandDismiss('qr')), [ dispatch ]);

  return <If condition={ qrPanelShown }>
    <View square toggle={ handleDismissPanel }>
      <div className={ theme.qrContainer }>
        <QRCode
          bgColor="#FFFFFF"
          fgColor="#000000"
          level="Q"
          style={ {} }
          value={ process.env.REACT_APP_SITE_URL }
        />
      </div>
      <div><a href={ process.env.REACT_APP_SITE_URL }>{ process.env.REACT_APP_SITE_URL }</a></div>
    </View>
  </If>;
};
