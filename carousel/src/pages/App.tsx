import React from "react";
import { RailCarousel } from "../components/RailCarousel";
import { getRange, getCarouselType } from "../utils";
import "./App.css";
import { HeadlessCarouselProps } from "../types";
import { FadeCarousel } from "../components/FadeCarousel";

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
    slidesToShow: 2,
    dir: "ltr",
    infinite: true,
    startIndex: 10,
  },
  {
    totalItems: 5,
    slidesToShow: 4,
    dir: "ltr",
    infinite: true,
    startIndex: 5,
  },
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
      <Code content={{ totalItem: 6, slidesToShow: 1, infinite: true }} />
      <FadeCarousel
        totalItems={6}
        slidesToShow={1}
        infinite={true}
        items={getRange(6).map(p => (
          <img
            src={`https://picsum.photos/640/640?random=1&${Math.random()}`}
            style={{
              display: "block",
              margin: "0 auto",
            }}
          />
        ))}
      />
    </div>
  );
}
