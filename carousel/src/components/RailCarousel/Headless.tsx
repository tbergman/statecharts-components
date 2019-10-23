import React, { useRef, useState, useEffect } from "react";
import classnames from "classnames";
import { CarouselProps } from "../../types";
import "../globalStyle.css";
import "./index.css";
import { defaultConfig } from "../../machines/config";
import { handleThreshold } from "../../utils";
import { useCarousel } from "../HeadlessCarousel/useCarousel";
import { ChildrenProps } from "../HeadlessCarousel/types";

interface RailCarouselSettings extends CarouselProps {
  boundaryThreshold: number | string;
  transitionThreshold: number | string;
}

export type HeadlessRailCarouselChildrenProps = RailCarouselSettings &
  ChildrenProps & { itemWidth: number };

export type HeadlessRailCarouselProps = CarouselProps & {
  children: (args: HeadlessRailCarouselChildrenProps) => React.ReactNode;
  preItems?: (args: HeadlessRailCarouselChildrenProps) => React.ReactNode;
  postItems?: (args: HeadlessRailCarouselChildrenProps) => React.ReactNode;
};

export function HeadlessRailCarousel(props: HeadlessRailCarouselProps) {
  const settings: RailCarouselSettings = {
    ...defaultConfig,
    boundaryThreshold: 50,
    transitionThreshold: "50%",
    ...props,
  };
  const {
    totalItems,
    slidesToShow,
    transitionDelay,
    responsive,
    swipe,
    boundaryThreshold: propsBoundaryThreshold,
    transitionThreshold: propsTransitionThreshold,
  } = settings;

  const carousel = useCarousel(settings);
  const { state, data, next, prev, grab, release } = carousel;

  // Calculate each item's width based on slidesToShow
  const [itemWidth, setItemWidth] = useState(1);
  const listRef = useRef<HTMLDivElement>(null!);
  const trackRef = useRef<HTMLDivElement>(null!);
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
      } else {
        // grab to right
        data.dir === "ltr" && prev();
        data.dir === "rtl" && next();
      }
      resetTouch();
    }

    setMove(0);
    setStart(diff);
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

  const totalWidth = totalItems * itemWidth;

  const swipeEventListeners = {
    onMouseDown: onTouchStart,
    onTouchStart: onTouchStart,
    onMouseUp: onTouchEnd,
    onTouchEnd: onTouchEnd,
    onMouseMove: onTouchMove,
    onTouchMove: onTouchMove,
  };

  const rendererArguments: HeadlessRailCarouselChildrenProps = {
    ...settings,
    ...carousel,
    itemWidth,
  };

  // TODO: explore the possibility of exposing HeadlessRailCarousel.Track component instead
  return (
    <div
      className="carousel rail-carousel"
      style={
        {
          "--transition-delay": `${transitionDelay}ms`,
        } as React.CSSProperties
      }
    >
      {/* Render preItems */}
      {typeof props.preItems === "function" &&
        props.preItems({
          ...settings,
          ...carousel,
          itemWidth,
        })}
      {/* Render list of items in carousel */}
      <div className="items-list" ref={listRef}>
        <div
          ref={trackRef}
          className={classnames("items-track", {
            animated: !state.matches("grabbed"),
          })}
          style={{
            width: totalWidth,
            transform: `translate3d(${(data.cursor - 1) * -1 * itemWidth +
              move}px, 0, 0)`,
          }}
          {...(swipe && swipeEventListeners)}
        >
          {props.children(rendererArguments)}
        </div>
      </div>
      {/* Render postItems */}
      {typeof props.postItems === "function" &&
        props.postItems({
          ...settings,
          ...carousel,
          itemWidth,
        })}
    </div>
  );
}
