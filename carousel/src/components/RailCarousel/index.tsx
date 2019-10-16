import React, { useRef, useState, useLayoutEffect } from "react";
import { CarouselProps } from "../../types";
import "./index.css";
import { defaultConfig } from "../../machine/config";
import { hasAutoPlay, parsePercentage } from "../../utils";
import { CarouselItem } from "../CarouselItem";
import { Dots } from "../Dot";
import { useCarousel } from "../HeadlessCarousel/useCarousel";

interface RailCarouselSettings extends CarouselProps {
  boundaryThreshold: number | string;
  transitionThreshold: number | string;
}

function handleThreshold(
  input: number | string,
  baseScale: number,
  fallback: number,
) {
  switch (typeof input) {
    case "string": {
      try {
        const percentage = parsePercentage(input);
        return baseScale * percentage;
      } catch (err) {
        return fallback;
      }
    }
    case "number": {
      return input;
    }
    default:
      console.log(`invalid threshold, using fallback: ${fallback}`);
      return fallback;
  }
}

export function RailCarousel(props: CarouselProps) {
  const settings: RailCarouselSettings = {
    ...defaultConfig,
    boundaryThreshold: 50,
    transitionThreshold: "50%",
    ...props,
  };
  const {
    items,
    totalItems,
    slidesToShow,
    transitionDelay,
    responsive,
    boundaryThreshold: propsBoundaryThreshold,
    transitionThreshold: propsTransitionThreshold,
  } = settings;

  const {
    state,
    data,
    next,
    prev,
    goTo,
    play,
    pause,
    grab,
    release,
    turnOn,
    turnOff,
  } = useCarousel(settings);
  // Calculate each item's width based on slidesToShow
  const [itemWidth, setItemWidth] = useState(1);
  const listRef = useRef<HTMLDivElement>(null!);
  const trackRef = useRef<HTMLDivElement>(null!);
  const [boundaryThreshold, setBoundaryThreshold] = useState(50);
  const [transitionThreshold, setTransitionThreshold] = useState(50);
  const [move, setMove] = useState(0);
  const start = useRef<number>(0);
  const [isGrabbing, setGrabbing] = useState(false);

  function setStart(s: number) {
    start.current = s;
  }

  function updateLayout() {
    console.log("updating layout");
    // TODO: margins, paddings and borders are not considered here
    const w = listRef.current.clientWidth / slidesToShow;
    setItemWidth(w);
  }

  function resetTouch() {
    setMove(0);
    setStart(0);
    setGrabbing(false);
  }

  function isTouchEvent(e: any) {
    return !!e.changedTouches;
  }

  function onTouchStart(e: any) {
    e.preventDefault();

    grab();

    let diff = 0;
    if (isTouchEvent(e)) {
      diff = (e as TouchEvent).changedTouches[0].pageX;
    } else {
      diff = (e as MouseEvent).pageX;
    }

    setMove(0);
    setStart(diff);
    setGrabbing(true);
  }

  function onTouchMove(e: any) {
    e.preventDefault();
    if (!isGrabbing) {
      return;
    }

    let diff = 0;
    if (isTouchEvent(e)) {
      diff = (e as TouchEvent).changedTouches[0].pageX;
    } else {
      diff = (e as MouseEvent).pageX;
    }

    const newMove = diff - start.current;

    // Do not let more than 1 slide to be grabbed and moved
    if (Math.abs(newMove) >= itemWidth) {
      return;
    }

    // On the 1st item, grabbing 50 px to the right will circle back to the last item
    if (
      data.cursor === 1 &&
      newMove > 0 &&
      Math.abs(newMove) >= boundaryThreshold
    ) {
      release();
      prev();
      resetTouch();
      return;
    }

    // On the last item, grabbing 50 px to the left will circle back to the 1st item
    if (
      data.cursor === data.groups.length &&
      newMove < 0 &&
      Math.abs(newMove) >= boundaryThreshold
    ) {
      release();
      next();
      resetTouch();
      return;
    }

    setMove(diff - start.current);
  }

  function onTouchEnd(e: any) {
    e.preventDefault();

    release();

    let diff = 0;
    if (isTouchEvent(e)) {
      diff = (e as TouchEvent).changedTouches[0].pageX;
    } else {
      diff = (e as MouseEvent).pageX;
    }

    if (Math.abs(move) >= transitionThreshold) {
      // grab to left
      if (move < 0) {
        next();
      } else {
        // grab to right
        prev();
      }
      resetTouch();
    }

    setMove(0);
    setStart(diff);
    setGrabbing(false);
  }

  useLayoutEffect(() => {
    setBoundaryThreshold(
      handleThreshold(propsBoundaryThreshold, itemWidth, 50),
    );
    setTransitionThreshold(
      handleThreshold(propsTransitionThreshold, itemWidth, 50),
    );
  }, [itemWidth]);

  useLayoutEffect(() => {
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
    <div
      className="rail-carousel"
      style={
        {
          "--transition-delay": `${transitionDelay}ms`,
        } as React.CSSProperties
      }
    >
      <pre>{JSON.stringify(state)}</pre>
      <pre>cursor: {data.cursor}</pre>
      <div className="items-list" ref={listRef}>
        <div
          ref={trackRef}
          className={`items-track ${!isGrabbing && "animated"}`}
          style={{
            width: totalWidth,
            transform: `translate3d(${(data.cursor - 1) * -1 * itemWidth +
              move}px, 0, 0)`,
          }}
        >
          {items.map((item, itemIdx) => {
            return (
              <div className="items-group" key={itemIdx}>
                <div
                  className={`item ${isGrabbing && "grabbing"}`}
                  style={{
                    width: itemWidth,
                    overflow: "hidden",
                  }}
                  key={item.key || itemIdx}
                  onMouseDown={onTouchStart}
                  onTouchStart={onTouchStart}
                  onMouseUp={onTouchEnd}
                  onTouchEnd={onTouchEnd}
                  onMouseMove={onTouchMove}
                  onTouchMove={onTouchMove}
                >
                  <CarouselItem item={item} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <button
        className="next"
        onClick={() => {
          next();
        }}
      />
      <button
        className="prev"
        onClick={() => {
          prev();
        }}
      />
      {
        <button
          onClick={() => {
            pause();
          }}
        >
          PAUSE
        </button>
      }
      {
        <button
          onClick={() => {
            play();
          }}
        >
          PLAY
        </button>
      }
      {
        <button
          onClick={() => {
            turnOn();
          }}
        >
          TURN ON
        </button>
      }
      {
        <button
          onClick={() => {
            turnOff();
          }}
        >
          TURN OFF
        </button>
      }
      <Dots
        dots={data.groups}
        onDotClick={goTo}
        activeIndex={data.cursor - 1}
      />
    </div>
  );
}
