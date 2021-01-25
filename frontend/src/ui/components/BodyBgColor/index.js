import { useSelector } from 'react-redux';
import { accessCurrentColor } from '../../../model/packs/commands';
import { useEffect } from 'react';

function setBodyBgColor(color) {
  if (color) {
    window.document.body.style.backgroundColor = color;
  } else {
    window.document.body.style.backgroundColor = null;
  }
}

export function BodyBgColor() {
  const color = useSelector(accessCurrentColor());

  useEffect(() => {
    console.log({ color });
    setBodyBgColor(color);
  }, [ color ]);

  return null;
}
