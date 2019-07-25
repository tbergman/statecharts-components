import React from "react";
import { RailCarousel } from "../components/RailCarousel";
import { getRange, getCarouselType } from "../utils";
import "./App.css";
import { HeadlessCarouselProps } from "../types";

function buildTitle(setting: HeadlessCarouselProps) {
  let title = `${getCarouselType(setting.totalItems, setting.slidesToShow)}-${
    setting.dir
  }-${setting.infinite ? "♾" : "finite"}`;
  if (setting.autoPlay !== undefined) {
    title += `-autoPlay:${setting.autoPlay}`;
  }
  return title;
}

const configs: HeadlessCarouselProps[] = [
  {
    totalItems: 10,
    slidesToShow: 5,
    dir: "ltr",
    infinite: true,
    startIndex: 1,
  },
  {
    totalItems: 5,
    slidesToShow: 4,
    dir: "ltr",
    infinite: true,
    startIndex: 1,
  },
  {
    totalItems: 4,
    slidesToShow: 4,
    dir: "ltr",
    infinite: true,
    startIndex: 1,
  },
  {
    totalItems: 10,
    slidesToShow: 5,
    dir: "ltr",
    infinite: false,
    startIndex: 1,
  },
  {
    totalItems: 5,
    slidesToShow: 4,
    dir: "ltr",
    infinite: false,
    startIndex: 1,
  },
  {
    totalItems: 4,
    slidesToShow: 4,
    dir: "ltr",
    infinite: false,
    startIndex: 1,
  },
  {
    totalItems: 10,
    slidesToShow: 5,
    dir: "rtl",
    infinite: true,
    startIndex: 1,
  },
  {
    totalItems: 5,
    slidesToShow: 4,
    dir: "rtl",
    infinite: true,
    startIndex: 1,
  },
  {
    totalItems: 4,
    slidesToShow: 4,
    dir: "rtl",
    infinite: true,
    startIndex: 1,
  },
  {
    totalItems: 10,
    slidesToShow: 5,
    dir: "rtl",
    infinite: false,
    startIndex: 1,
  },
  {
    totalItems: 5,
    slidesToShow: 4,
    dir: "rtl",
    infinite: false,
    startIndex: 1,
  },
  {
    totalItems: 4,
    slidesToShow: 4,
    dir: "rtl",
    infinite: false,
    startIndex: 1,
  },
  // Auto Play
  // {
  //   totalItems: 10,
  //   slidesToShow: 5,
  //   dir: "ltr",
  //   infinite: true,
  //   startIndex: 1,
  //   autoPlay: 2000,
  // },
  // {
  //   totalItems: 5,
  //   slidesToShow: 4,
  //   dir: "ltr",
  //   infinite: true,
  //   startIndex: 1,
  //   autoPlay: 2000,
  // },
  // {
  //   totalItems: 4,
  //   slidesToShow: 4,
  //   dir: "ltr",
  //   infinite: true,
  //   startIndex: 1,
  //   autoPlay: 2000,
  // },
  // {
  //   totalItems: 10,
  //   slidesToShow: 5,
  //   dir: "ltr",
  //   infinite: false,
  //   startIndex: 1,
  //   autoPlay: 2000,
  // },
  // {
  //   totalItems: 5,
  //   slidesToShow: 4,
  //   dir: "ltr",
  //   infinite: false,
  //   startIndex: 1,
  //   autoPlay: 2000,
  // },
  // {
  //   totalItems: 4,
  //   slidesToShow: 4,
  //   dir: "ltr",
  //   infinite: false,
  //   startIndex: 1,
  //   autoPlay: 2000,
  // },
  // {
  //   totalItems: 10,
  //   slidesToShow: 5,
  //   dir: "rtl",
  //   infinite: true,
  //   startIndex: 1,
  //   autoPlay: 2000,
  // },
  // {
  //   totalItems: 5,
  //   slidesToShow: 4,
  //   dir: "rtl",
  //   infinite: true,
  //   startIndex: 1,
  //   autoPlay: 2000,
  // },
  // {
  //   totalItems: 4,
  //   slidesToShow: 4,
  //   dir: "rtl",
  //   infinite: true,
  //   startIndex: 1,
  //   autoPlay: 2000,
  // },
  // {
  //   totalItems: 10,
  //   slidesToShow: 5,
  //   dir: "rtl",
  //   infinite: false,
  //   startIndex: 1,
  //   autoPlay: 2000,
  // },
  // {
  //   totalItems: 5,
  //   slidesToShow: 4,
  //   dir: "rtl",
  //   infinite: false,
  //   startIndex: 1,
  //   autoPlay: 2000,
  // },
  // {
  //   totalItems: 4,
  //   slidesToShow: 4,
  //   dir: "rtl",
  //   infinite: false,
  //   startIndex: 1,
  //   autoPlay: 2000,
  // },
];

type Setting = HeadlessCarouselProps & { title: string };
const settings: Setting[] = configs.map(cfg => ({
  ...cfg,
  title: buildTitle(cfg),
}));

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
      {settings.map((s, i) => (
        <React.Fragment key={i}>
          <Code content={s} />
          <code style={{ display: "block", marginBottom: 10 }}>
            <em>
              <strong>{s.title}</strong>
            </em>
          </code>
          <RailCarousel
            {...s}
            items={getRange(s.totalItems).map(p => (
              <p
                style={{
                  height: 100,
                  backgroundColor: "orange",
                  color: "black",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 50,
                  fontFamily: "monospace",
                  margin: 0,
                }}
              >
                {p}
              </p>
            ))}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
