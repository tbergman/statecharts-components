import React, { useState, useRef, useEffect } from "react";
import { CarouselProps } from "../../types";
import "../globalStyle.css";
import "./index.css";
import { parsePercentage, handleThreshold } from "../../utils";
import { defaultConfig } from "../../machines/config";
import { CarouselItem } from "../CarouselItem";
import { Dots } from "../Dot";
import { useCarousel } from "../HeadlessCarousel/useCarousel";
import classnames from "classnames";

interface RailCarouselSettings extends CarouselProps {
  boundaryThreshold: number | string;
  transitionThreshold: number | string;
}

export function FadeCarousel(props: CarouselProps) {
  const settings: RailCarouselSettings = {
    ...defaultConfig,
    boundaryThreshold: 50,
    transitionThreshold: "50%",
    ...props,
  };
  const {
    items,
    slidesToShow,
    responsive,
    transitionDelay,
    swipe,
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
  const [boundaryThreshold, setBoundaryThreshold] = useState(50);
  const [transitionThreshold, setTransitionThreshold] = useState(50);
  const [move, setMove] = useState(0);
  const start = useRef<number>(0);

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
  }

  function onTouchMove(e: any) {
    e.preventDefault();

    if (!state.matches("grabbed")) {
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

    // On the 1st item, grabbing by the size of boundaryThreshold to the right will circle back to the last item
    if (
      data.cursor === 1 &&
      newMove > 0 &&
      Math.abs(newMove) >= boundaryThreshold
    ) {
      release();
      // TODO: this needs to be represented in Machine layer
      data.dir === "ltr" && prev();
      data.dir === "rtl" && next();
      // prev();
      resetTouch();
      return;
    }

    // On the last item, grabbing by the size of  boundaryThreshold to the left will circle back to the 1st item
    if (
      data.cursor === data.groups.length &&
      newMove < 0 &&
      Math.abs(newMove) >= boundaryThreshold
    ) {
      release();
      data.dir === "ltr" && next();
      data.dir === "rtl" && prev();
      // next();
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
        data.dir === "ltr" && next();
        data.dir === "rtl" && prev();
        // next();
      } else {
        // grab to right
        data.dir === "ltr" && prev();
        data.dir === "rtl" && next();
        // prev();
      }
      resetTouch();
    }

    setMove(0);
    setStart(diff);
    // setGrabbing(false);
  }

  // Sync boundaryThreshold and transitionThreshold with itemWidth
  useEffect(() => {
    setBoundaryThreshold(
      handleThreshold(propsBoundaryThreshold, itemWidth, 50),
    );
    setTransitionThreshold(
      handleThreshold(propsTransitionThreshold, itemWidth, 50),
    );
  }, [itemWidth]);

  // Resize listener
  useEffect(() => {
    updateLayout();

    if (responsive) {
      window.addEventListener("resize", updateLayout);
    }

    return () => {
      console.debug("removing resize listener");
      window.removeEventListener("resize", updateLayout);
    };
  }, []);

  const swipeEventListeners = {
    onMouseDown: onTouchStart,
    onTouchStart: onTouchStart,
    onMouseUp: onTouchEnd,
    onTouchEnd: onTouchEnd,
    onMouseMove: onTouchMove,
    onTouchMove: onTouchMove,
  };

  return (
    <div
      className="carousel fade-carousel"
      style={
        {
          "--transition-delay": `${transitionDelay}ms`,
        } as React.CSSProperties
      }
    >
      <pre>{JSON.stringify(state.value)}</pre>
      <pre>cursor: {data.cursor}</pre>
      <div className="items-list" ref={listRef}>
        {data.groups.map((group, groupIdx) => (
          <div
            className={classnames("items-group", {
              "items-group-active": data.cursor - 1 === groupIdx,
            })}
            key={groupIdx}
            {...(swipe && swipeEventListeners)}
          >
            {group.map((item, itemIdx) => {
              const elem = items[item - 1];
              return (
                <div
                  className={classnames("item", {
                    grabbable: swipe,
                    grabbing: state.matches("grabbed"),
                  })}
                  key={itemIdx}
                >
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
      <button
        onClick={() => {
          turnOn();
        }}
      >
        Turn ON
      </button>
      <button
        onClick={() => {
          turnOff();
        }}
      >
        Turn Off
      </button>
      <Dots
        dots={data.groups}
        onDotClick={goTo}
        activeIndex={data.cursor - 1}
      />
    </div>
  );
}
