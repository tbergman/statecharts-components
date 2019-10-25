import React from "react";
import { HeadlessRailCarousel } from "../RailCarousel/Headless";
import { CarouselProps } from "../../types";
import classnames from "classnames";
import { CarouselItem } from "../CarouselItem";
import "./index.css";

export function InstagramCarousel(props: CarouselProps) {
  const {
    totalItems,
    items,
    slidesToShow,
    startIndex,
    dir,
    infinite,
    swipe,
  } = props;
  return (
    <div className="instagram-carousel">
      <HeadlessRailCarousel
        items={items}
        totalItems={totalItems}
        slidesToShow={1}
        startIndex={2}
        dir={dir}
        infinite={false}
        swipe={swipe}
        transitionThreshold="25%"
        preItems={hProps => {
          return (
            <>
              <p className="counter">
                {hProps.data.cursor}/{hProps.totalItems}
              </p>
            </>
          );
        }}
        postItems={hProps => {
          const activeDotColor = "#3897f0";
          const dots = hProps.data.groups;
          const activeIndex = hProps.data.cursor;
          const preActiveIndexes = dots.slice(activeIndex - 3, activeIndex - 1);
          const postActiveIndexes = dots.slice(activeIndex, activeIndex + 2);
          return (
            <>
              <div className="next">
                <button onClick={hProps.next}>
                  <span className="chevron-right"></span>
                </button>
              </div>
              <div className="prev">
                <button onClick={hProps.prev}>
                  <span className="chevron-left"></span>
                </button>
              </div>
              {/* Dots */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  margin: "15px auto",
                }}
              >
                {preActiveIndexes.map((d, i) => (
                  <div
                    style={{
                      width: i === 0 ? 4 : 2,
                      height: i === 0 ? 4 : 2,
                      transition: "background 0.2s ease-in-out",
                      backgroundColor: "#dbdbdb",
                      margin: "0 2px",
                      borderRadius: "50%",
                    }}
                    key={i}
                  />
                ))}
                <div
                  style={{
                    width: 6,
                    height: 6,
                    transition: "background 0.2s ease-in-out",
                    backgroundColor: activeDotColor,
                    margin: "0 2px",
                    borderRadius: "50%",
                  }}
                />
                {postActiveIndexes.map((d, i) => (
                  <div
                    style={{
                      width: i === 0 ? 4 : 2,
                      height: i === 0 ? 4 : 2,
                      transition: "background 0.2s ease-in-out",
                      backgroundColor: "#dbdbdb",
                      margin: "0 2px",
                      borderRadius: "50%",
                    }}
                    key={i}
                  />
                ))}
              </div>
            </>
          );
        }}
      >
        {hProps => {
          console.log(hProps);
          return (
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
          );
        }}
      </HeadlessRailCarousel>
    </div>
  );
}
