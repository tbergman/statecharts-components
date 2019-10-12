import React from "react";

export function CarouselItem({
  item,
}: {
  item: React.ComponentElement<any, any>;
}) {
  return React.cloneElement(item, {
    ...item.props,
    style: { ...item.props.style, maxWidth: "100%" },
  });
}
