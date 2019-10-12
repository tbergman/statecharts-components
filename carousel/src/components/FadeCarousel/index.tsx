import React from "react";
import { CarouselProps } from "../../types";
import "./index.css";
import { hasAutoPlay } from "../../utils";
import { HeadlessCarousel } from "../HeadlessCarousel";
import { defaultConfig } from "../../machine/config";
import { CarouselItem } from "../CarouselItem";
import { Dots } from "../Dot";

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
                        <CarouselItem item={elem} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                headlessCarousel.next();
              }}
            >
              Next
            </button>
            <button
              onClick={() => {
                headlessCarousel.prev();
              }}
            >
              Prev
            </button>
            <button
              onClick={() => {
                headlessCarousel.pause();
              }}
            >
              PAUSE
            </button>
            <button
              onClick={() => {
                headlessCarousel.play();
              }}
            >
              PLAY
            </button>
            <Dots
              dots={headlessCarousel.data.groups}
              onDotClick={headlessCarousel.goTo}
              activeIndex={headlessCarousel.data.cursor - 1}
            />
          </div>
        );
      }}
    </HeadlessCarousel>
  );
}
