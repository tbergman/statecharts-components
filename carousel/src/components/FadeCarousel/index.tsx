import React from "react";
import { CarouselProps } from "../../types";
import "./index.css";
import { hasAutoPlay } from "../../utils";
import { HeadlessCarousel } from "../HeadlessCarousel";
import { defaultConfig } from "../../machine/config";

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

export function FadeCarousel(props: CarouselProps) {
  const settings = { ...defaultConfig, ...props };
  const { items } = settings;

  return (
    <HeadlessCarousel {...settings}>
      {headlessCarousel => {
        return (
          <div className="fade-carousel">
            <div className="items-list">
              {headlessCarousel.data.groups.map((group, groupIdx) => (
                <div
                  className={`cf items-group ${
                    headlessCarousel.data.cursor - 1 === groupIdx
                      ? "items-group-active"
                      : null
                  }`}
                  key={groupIdx}
                >
                  {group.map((item, itemIdx) => {
                    const elem = items[item - 1];
                    return (
                      <div className="item" key={itemIdx}>
                        {React.cloneElement(elem, {
                          ...elem.props,
                          style: { ...elem.props.style, maxWidth: "100%" },
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
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
        );
      }}
    </HeadlessCarousel>
  );
}
