import React from "react";

export function Dots({
  dots,
  onDotClick,
  activeIndex,
}: {
  dots: any[];
  onDotClick: Function;
  activeIndex: number;
}) {
  return (
    <div className="dots">
      {dots.map((_, i) => (
        <div
          key={i}
          style={{
            width: 10,
            height: 10,
            backgroundColor: i === activeIndex ? "orange" : "#eee",
            borderRadius: "50%",
            display: "inline-block",
            margin: "0 5px",
            cursor: "pointer",
          }}
          onClick={() => {
            // Send the cursor of the group (1...ctx.groups.length)
            onDotClick(i + 1);
          }}
        />
      ))}
    </div>
  );
}
