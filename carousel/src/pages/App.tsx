import React from "react";
import { Carousel, CarouselProps } from "../Carousel";
import { getRange, getCarouselType } from "../utils";
import "./App.css";
import { CarouselMachineFactoryConfig } from "../machine/factory";

function buildTitle(setting: CarouselMachineFactoryConfig) {
  return `${getCarouselType(setting.totalItems, setting.slidesToShow)}-${
    setting.dir
  }-${setting.infinite ? "♾" : "finite"}`;
}

const configs: CarouselMachineFactoryConfig[] = [
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
];

type Setting = CarouselMachineFactoryConfig & { title: string };
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
          <Carousel
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
