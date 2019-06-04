import * as React from "react";
import { Carousel } from "../Carousel";

function itemsGenerator(total: number) {
  const result = [];
  for (let i = 0; i < total; i++) {
    result.push({ value: `${i + 1}`, id: i + 1 });
  }
  return result;
}

export function App() {
  return (
    <>
      <div>
        <h3>
          <pre>
            {JSON.stringify(
              {
                startIndex: 1,
                autoPlay: 2000
              },
              null,
              2
            )}
          </pre>
        </h3>
        <Carousel items={itemsGenerator(6)} startIndex={1} autoPlay={2000} />
      </div>
      <div>
        <h3>
          <pre>
            {JSON.stringify(
              {
                startIndex: 4
              },
              null,
              2
            )}
          </pre>
        </h3>
        <Carousel items={itemsGenerator(12)} startIndex={4} />
      </div>
    </>
  );
}
