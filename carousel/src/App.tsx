import React from "react";
import { RailCarousel } from "./components/RailCarousel";
import { getRange, getRandomFromArray } from "./utils";
import { HeadlessCarouselProps } from "./types";
import { FadeCarousel } from "./components/FadeCarousel";
import { LazyImage } from "./components/LazyImage";
import { InstagramCarousel } from "./components/InstagramCarousel";

const carousels: HeadlessCarouselProps[] = [
  {
    totalItems: 12,
    slidesToShow: 1,
    dir: "ltr",
    infinite: true,
    startIndex: 1,
    onTransition: () => {
      console.log("Ternary Transition");
    },
    onEvent: type => console.log(`Ternary Event ${type}`),
    transitionDelay: 1000,
    transitionThreshold: "25%",
    boundaryThreshold: "25%",
    swipe: true,
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

const imageSizes = [[768, 300], [1000, 350]];

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
    <div>
      {configs.map((s, i) => (
        <React.Fragment key={i}>
          {/* <Code content={s} /> */}
          <InstagramCarousel
            {...s}
            items={getRange(s.totalItems).map((p, i) => (
              // <p
              //   style={{
              //     height: 100,
              //     backgroundColor: "cadetblue",
              //     color: "black",
              //     display: "flex",
              //     justifyContent: "center",
              //     alignItems: "center",
              //     fontSize: 50,
              //     fontFamily: "monospace",
              //     margin: 0,
              //     width: getRandomFromArray([1000, 2000, 3000]),
              //   }}
              // >
              //   {p}
              //   <button onClick={() => alert("Yay")}>Click me</button>
              // </p>(
              // <LazyImage
              //   background={true}
              //   src={`https://picsum.photos/${
              //     getRandomFromArray(imageSizes)[0]
              //   }/${
              //     getRandomFromArray(imageSizes)[1]
              //   }?random=1&random=${Math.random()}`}
              // />
              <LazyImage
                background={true}
                h2wRatio={1350 / 1080}
                src={`https://picsum.photos/1080/1350?random=1&rand=${Math.random()}`}
              />
            ))}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
