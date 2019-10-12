import React from "react";
import { RailCarousel } from "./components/RailCarousel";
import { getRange } from "./utils";
import { HeadlessCarouselProps } from "./types";
import { FadeCarousel } from "./components/FadeCarousel";
import { LazyImage } from "./components/LazyImage";

const carousels: HeadlessCarouselProps[] = [
  {
    totalItems: 7,
    slidesToShow: 2,
    dir: "ltr",
    infinite: true,
    startIndex: 2,
    onTransition: () => {
      console.log("Ternary Transition");
    },
    onEvent: type => console.log(`Ternary Event ${type}`),
    // transitionDelay: 10,
    // autoPlay: 1000,
  },
  {
    totalItems: 4,
    slidesToShow: 3,
    dir: "ltr",
    infinite: true,
    startIndex: 2,
    onTransition: () => {
      console.log("Binary Transition");
    },
    onEvent: type => console.log(`Binary Event ${type}`),
    // autoPlay: 1500,
  },
];

const configs: HeadlessCarouselProps[] = carousels;

function Code({ content }: { content: Object }) {
  return (
    <pre
      style={{
        backgroundColor: "#eee",
        padding: 15,
        display: "inline-block",
      }}
    >
      {JSON.stringify(content, undefined, 2)}
    </pre>
  );
}

export function App() {
  return (
    <div style={{ margin: 30 }}>
      {configs.map((s, i) => (
        <React.Fragment key={i}>
          <Code content={s} />
          <RailCarousel
            {...s}
            items={getRange(s.totalItems).map(p => (
              // <p
              //   style={{
              //     height: 100,
              //     backgroundColor: "orange",
              //     color: "black",
              //     display: "flex",
              //     justifyContent: "center",
              //     alignItems: "center",
              //     fontSize: 50,
              //     fontFamily: "monospace",
              //     margin: 0,
              //   }}
              // >
              //   {p}
              // </p>
              <LazyImage
                background={false}
                src={`https://picsum.photos/600/300?random=1&random=${Math.random()}`}
              />
              // <iframe
              //   width="560"
              //   height="315"
              //   src="https://www.youtube.com/embed/n0F6hSpxaFc"
              // />
            ))}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
