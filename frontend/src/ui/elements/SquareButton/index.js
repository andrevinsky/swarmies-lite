import theme from './squareButton.module.scss';
import { useSelector } from 'react-redux';
import { accessCurrentColor } from '../../../model/packs/commands';
import { useMemo } from 'react';
import { getContrast } from '../../../logic/utils/color';

export const SquareButton = ({ className, style, topLeft, bottomRight, ...props }) => {
  const positioningClass = topLeft ? theme.topLeft : (
    bottomRight ? theme.bottomRight : ''
  );
  const colorBg = useSelector(accessCurrentColor());
  const color = useMemo(() => getContrast(colorBg), [ colorBg ]);

  const newStyle = { ...(style ?? {}), color, borderColor: color };

  return <button className={ [ className, theme.squareButton, positioningClass ].join(' ') }
    style={ newStyle } { ...props } />;
};
