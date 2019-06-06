import * as React from "react";
import { Carousel } from "../Carousel";
import { CarouselMachineFactoryConfig } from "../machine";

function itemsGenerator(total: number) {
  const result = [];
  for (let i = 0; i < total; i++) {
    result.push({ value: `${i + 1}`, id: i + 1 });
  }
  return result;
}

function DemoSection({
  config,
  children
}: {
  config: Omit<CarouselMachineFactoryConfig, "totalItems">;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3>
        <pre>{JSON.stringify(config, null, 2)}</pre>
      </h3>
      {children}
    </div>
  );
}

const carousels: CarouselMachineFactoryConfig[] = [
  { totalItems: 3, startIndex: 2, dir: "ltr", autoPlay: 1500, infinite: true },
  { totalItems: 1, startIndex: 1, dir: "rtl", autoPlay: 500, infinite: true }
];

export function App() {
  return (
    <>
      {carousels.map((c, i) => {
        const { totalItems, ...restC } = c;
        return (
          <DemoSection config={c} key={i}>
            <Carousel items={itemsGenerator(totalItems)} {...restC} />
          </DemoSection>
        );
      })}
    </>
  );
}
