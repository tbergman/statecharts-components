import React from "react";
import { CarouselProps } from "../../types";
import "./index.css";
import { defaultConfig } from "../../machine/config";
import { hasAutoPlay } from "../../utils";
import { HeadlessCarousel } from "../HeadlessCarousel";

function Dots({
  dots,
  onDotClick,
  activeIndex,
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

export function RailCarousel(props: CarouselProps) {
  const settings = { ...defaultConfig, ...props };
  const { items, totalItems, slidesToShow } = settings;

  // Calculate each item's width based on slidesToSHow
  const [itemWidth, setItemWidth] = React.useState(1);
  const listRef = React.useRef<HTMLDivElement>(null!);

  function updateLayout() {
    console.debug("updating layout");
    setItemWidth(listRef.current.clientWidth / slidesToShow);
  }

  React.useLayoutEffect(() => {
    updateLayout();

    if (settings.responsive) {
      window.addEventListener("resize", updateLayout);
    }

    return () => {
      console.debug("removing resize listener");
      window.removeEventListener("resize", updateLayout);
    };
  }, []);

  if (!itemWidth) return null;

  const totalWidth = totalItems * itemWidth;

  return (
    <HeadlessCarousel {...settings}>
      {headlessCarousel => (
        <div>
          <div className="items-list" ref={listRef}>
            <div
              className="items-track cf"
              style={{
                width: totalWidth,
                transform: `translate3d(${(headlessCarousel.data.cursor - 1) *
                  -1 *
                  itemWidth}px, 0, 0)`,
              }}
            >
              {items.map((item, itemIdx) => (
                <div
                  className="cf items-group"
                  key={itemIdx}
                  id={`group-${itemIdx}`}
                >
                  <div
                    className="item"
                    style={{ width: itemWidth, overflow: "hidden" }}
                    key={item.key || itemIdx}
                  >
                    {React.cloneElement(item, {
                      ...item.props,
                      style: { ...item.props.style, maxWidth: "100%" },
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {headlessCarousel.type !== "Unary" && (
            <button
              onClick={() => {
                headlessCarousel.next();
              }}
            >
              Next
            </button>
          )}
          {headlessCarousel.type !== "Unary" && (
            <button
              onClick={() => {
                headlessCarousel.prev();
              }}
            >
              Prev
            </button>
          )}
          {hasAutoPlay(settings) &&
            typeof headlessCarousel.state === "object" &&
            !!headlessCarousel.state.playing && (
              <button
                onClick={() => {
                  headlessCarousel.pause();
                }}
              >
                PAUSE
              </button>
            )}
          {hasAutoPlay(settings) &&
            typeof headlessCarousel.state === "object" &&
            !!headlessCarousel.state.paused && (
              <button
                onClick={() => {
                  headlessCarousel.play();
                }}
              >
                PLAY
              </button>
            )}
          {headlessCarousel.type !== "Unary" && (
            <Dots
              dots={headlessCarousel.data.groups}
              onDotClick={headlessCarousel.goTo}
              activeIndex={headlessCarousel.data.cursor - 1}
            />
          )}
        </div>
      )}
    </HeadlessCarousel>
  );
}
