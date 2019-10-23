import React from "react";
import classnames from "classnames";
import { CarouselProps } from "../../types";
import "../globalStyle.css";
import "./index.css";
import { CarouselItem } from "../CarouselItem";
import { Dots } from "../Dot";
import { HeadlessRailCarousel } from "./Headless";

export function RailCarousel(props: CarouselProps) {
  return (
    <HeadlessRailCarousel
      items={props.items}
      totalItems={props.totalItems}
      slidesToShow={props.slidesToShow}
      startIndex={props.startIndex}
      dir={props.dir}
      infinite={props.infinite}
      swipe={props.swipe}
      preItems={nProps => (
        <>
          <pre>{JSON.stringify(nProps.state.value)}</pre>
          <pre>cursor: {nProps.data.cursor}</pre>
        </>
      )}
      postItems={nProps => (
        <>
          <button
            className="next"
            onClick={() => {
              nProps.next();
            }}
          />
          <button
            className="prev"
            onClick={() => {
              nProps.prev();
            }}
          />
          {
            <button
              onClick={() => {
                nProps.pause();
              }}
            >
              PAUSE
            </button>
          }
          {
            <button
              onClick={() => {
                nProps.play();
              }}
            >
              PLAY
            </button>
          }
          {
            <button
              onClick={() => {
                nProps.turnOn();
              }}
            >
              TURN ON
            </button>
          }
          {
            <button
              onClick={() => {
                nProps.turnOff();
              }}
            >
              TURN OFF
            </button>
          }
          {
            <button
              onClick={() => {
                nProps.grab();
              }}
            >
              GRAB
            </button>
          }
          {
            <button
              onClick={() => {
                nProps.release();
              }}
            >
              RELEASE
            </button>
          }
          <Dots
            dots={nProps.data.groups}
            onDotClick={nProps.goTo}
            activeIndex={nProps.data.cursor - 1}
          />
        </>
      )}
    >
      {hProps => (
        <>
          {hProps.items.map((item, itemIdx) => {
            return (
              <div className="items-group" key={itemIdx}>
                <div
                  className={classnames("item", {
                    grabbable: hProps.swipe,
                    grabbing: hProps.state.matches("grabbed"),
                  })}
                  style={{
                    width: hProps.itemWidth,
                    overflow: "hidden",
                  }}
                  key={item.key || itemIdx}
                >
                  <CarouselItem item={item} />
                </div>
              </div>
            );
          })}
        </>
      )}
    </HeadlessRailCarousel>
  );
}
