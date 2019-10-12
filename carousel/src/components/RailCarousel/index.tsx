import React from "react";
import { CarouselProps } from "../../types";
import "./index.css";
import { defaultConfig } from "../../machine/config";
import { hasAutoPlay } from "../../utils";
import { HeadlessCarousel } from "../HeadlessCarousel";
import { CarouselItem } from "../CarouselItem";
import { Dots } from "../Dot";

export function RailCarousel(props: CarouselProps) {
  const settings = { ...defaultConfig, ...props };
  const {
    items,
    totalItems,
    slidesToShow,
    transitionDelay,
    responsive,
  } = settings;

  // Calculate each item's width based on slidesToSHow
  const [itemWidth, setItemWidth] = React.useState(1);
  const listRef = React.useRef<HTMLDivElement>(null!);

  function updateLayout() {
    console.debug("updating layout");
    setItemWidth(listRef.current.clientWidth / slidesToShow);
  }

  React.useLayoutEffect(() => {
    updateLayout();

    if (responsive) {
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
        <div
          className="rail-carousel"
          style={
            {
              "--transition-delay": `${transitionDelay}ms`,
            } as React.CSSProperties
          }
        >
          <pre>{JSON.stringify(headlessCarousel.state)}</pre>
          <div className="items-list" ref={listRef}>
            <div
              className="items-track"
              style={{
                width: totalWidth,
                transform: `translate3d(${(headlessCarousel.data.cursor - 1) *
                  -1 *
                  itemWidth}px, 0, 0)`,
              }}
            >
              {items.map((item, itemIdx) => (
                <div className="items-group" key={itemIdx}>
                  <div
                    className="item"
                    style={{ width: itemWidth, overflow: "hidden" }}
                    key={item.key || itemIdx}
                  >
                    <CarouselItem item={item} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            className="next"
            onClick={() => {
              headlessCarousel.next();
            }}
          />
          <button
            className="prev"
            onClick={() => {
              headlessCarousel.prev();
            }}
          />
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
          {hasAutoPlay(settings) && headlessCarousel.state === "paused" && (
            <button
              onClick={() => {
                headlessCarousel.play();
              }}
            >
              PLAY
            </button>
          )}
          <Dots
            dots={headlessCarousel.data.groups}
            onDotClick={headlessCarousel.goTo}
            activeIndex={headlessCarousel.data.cursor - 1}
          />
        </div>
      )}
    </HeadlessCarousel>
  );
}
