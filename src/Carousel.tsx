import * as React from "react";
import { useMachine } from "@xstate/react";
import chunk from "lodash.chunk";
import { carouselMachineFactory } from "./machine/factory";
import { Dir } from "./types";
import "./Carousel.css";
import { defaultConfig } from "./machine/config";

function Dots({
  dots,
  onDotClick,
  activeIndex
}: {
  dots: any[];
  onDotClick: Function;
  activeIndex: number;
}) {
  return (
    <div style={{ textAlign: "center" }}>
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
            cursor: "pointer"
          }}
          onClick={() => {
            // Send the cursor of the group (1...ctx.groups.length)
            onDotClick({ type: "GO_TO", data: i + 1 });
          }}
        />
      ))}
    </div>
  );
}

export type CarouselProps = {
  items: JSX.Element[];
  totalItems: number;
  startIndex?: number;
  autoPlay?: number;
  dir?: Dir;
  infinite?: boolean;
  slidesToShow?: number;
  slidesToScroll?: number;
};

export function Carousel(props: CarouselProps) {
  const settings = { ...defaultConfig, ...props };
  const { items, totalItems, slidesToShow } = settings;
  const [state, sendEvent, service] = useMachine(
    carouselMachineFactory(settings)
  );

  // Calculate each item's width based on slidesToSHow
  const [itemWidth, setItemWidth] = React.useState(1);
  const listRef = React.useRef<HTMLDivElement>(null!);

  React.useEffect(() => {
    service.onTransition(state => {
      if (state.changed) {
        console.log(state.value);
        // console.log(state.nextEvents);
        console.log(state.context);
      }
    });
  }, [service]);

  React.useLayoutEffect(() => {
    setItemWidth(listRef.current.clientWidth / (slidesToShow as number));
  }, []);

  if (!itemWidth) return null;

  // Grouping items based on slidesToShow
  const chunked = chunk(items, slidesToShow);
  const totalWidth = totalItems * itemWidth;
  const transitionSpan = (state.context.startCursor - 1) * -1 * itemWidth;

  return (
    <div>
      <div className="items-list" ref={listRef}>
        <div
          className="items-track cf"
          style={{
            width: totalWidth,
            transform: `translate3d(${transitionSpan}px, 0, 0)`
          }}
        >
          {chunked.map((group, groupIdx) => (
            <div
              className="cf items-group"
              key={groupIdx}
              id={`group-${groupIdx}`}
            >
              {group.map((item, itemIdx) => (
                <div
                  className="item"
                  style={{ width: itemWidth, overflow: "hidden" }}
                  key={item.key || itemIdx}
                >
                  {React.cloneElement(item, {
                    ...item.props,
                    style: { ...item.props.style, maxWidth: "100%" }
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          sendEvent({ type: "NEXT" });
        }}
      >
        Next
      </button>
      <button
        onClick={() => {
          sendEvent({ type: "PREV" });
        }}
      >
        Prev
      </button>
      <Dots
        dots={state.context.groups}
        onDotClick={sendEvent}
        activeIndex={state.context.groups.findIndex(
          g =>
            g.start === state.context.startCursor &&
            g.end === state.context.endCursor
        )}
      />
    </div>
  );
}
