import React from "react";
import { RailCarousel } from "./components/RailCarousel";
import { getRange, getRandomFromArray } from "./utils";
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
    transitionDelay: 1000,
    transitionThreshold: "25%",
    boundaryThreshold: "25%",
    // autoPlay: 1000,
  },
  // {
  //   totalItems: 4,
  //   slidesToShow: 3,
  //   dir: "ltr",
  //   infinite: true,
  //   startIndex: 2,
  //   onTransition: () => {
  //     console.log("Binary Transition");
  //   },
  //   onEvent: type => console.log(`Binary Event ${type}`),
  //   // autoPlay: 1500,
  // },
];

const imageSizes = [[768, 300]];

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
              <p
                style={{
                  height: 100,
                  backgroundColor: "cadetblue",
                  color: "black",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 50,
                  fontFamily: "monospace",
                  margin: 0,
                  width: getRandomFromArray([1000, 200, 50, 405]),
                }}
              >
                {p}
              </p>
              // <LazyImage
              //   background={true}
              //   src={`https://picsum.photos/${
              //     getRandomFromArray(imageSizes)[0]
              //   }/${
              //     getRandomFromArray(imageSizes)[1]
              //   }?random=1&random=${Math.random()}`}
              // />
            ))}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
