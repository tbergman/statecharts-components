import React from "react";

export function CarouselItem({
  item,
  style = {},
}: {
  item: React.ComponentElement<any, any>;
  style?: React.CSSProperties;
}) {
  return React.cloneElement(item, {
    ...item.props,
    style: { ...item.props.style, ...style, maxWidth: "100%" },
  });
}
