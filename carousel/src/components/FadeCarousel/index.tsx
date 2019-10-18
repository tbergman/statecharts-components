import React from "react";
import { CarouselProps } from "../../types";
import "./index.css";
import { hasAutoPlay } from "../../utils";
import { HeadlessCarousel } from "../HeadlessCarousel";
import { defaultConfig } from "../../machines/config";
import { CarouselItem } from "../CarouselItem";
import { Dots } from "../Dot";
import { useCarousel } from "../HeadlessCarousel/useCarousel";

export function FadeCarousel(props: CarouselProps) {
  const settings = { ...defaultConfig, ...props };
  const { items } = settings;
  const { state, data, next, prev, goTo, play, pause } = useCarousel(settings);

  return (
    <div className="fade-carousel">
      <div className="items-list">
        {data.groups.map((group, groupIdx) => (
          <div
            className={`cf items-group ${
              data.cursor - 1 === groupIdx ? "items-group-active" : null
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
          next();
        }}
      >
        Next
      </button>
      <button
        onClick={() => {
          prev();
        }}
      >
        Prev
      </button>
      <button
        onClick={() => {
          pause();
        }}
      >
        PAUSE
      </button>
      <button
        onClick={() => {
          play();
        }}
      >
        PLAY
      </button>
      <Dots
        dots={data.groups}
        onDotClick={goTo}
        activeIndex={data.cursor - 1}
      />
    </div>
  );
}
