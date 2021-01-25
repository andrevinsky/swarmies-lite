import cx from 'classnames';
import { If } from '../Branching';
import theme from './view.module.scss';
import { SquareButton } from '../SquareButton';

export function View({ children, square, bgColor, toggle, ...etc }) {
  const { className, style } = etc;
  const resultingStyle = Object.assign(
    style ? style : {},
    bgColor ? { 'backgroundColor': bgColor } : {});

  return <div className={ cx(className, theme.view, square ? theme.viewSquare : '') } { ...etc }
    style={ resultingStyle }><If condition={ toggle }>
    <SquareButton className={ theme.toggleButton } onClick={ toggle }>X</SquareButton>
  </If>{
    children
  }</div>;
}
