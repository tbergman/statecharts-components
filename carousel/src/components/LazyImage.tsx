import React, { useEffect, useState, useRef } from "react";
import Spinner from "react-svg-spinner";

type ImageState =
  | { state: "Idle" }
  | { state: "Loading" }
  | { state: "Loaded"; img: HTMLImageElement }
  | { state: "Error"; error: any };

export function LazyImage({
  src,
  background = false,
}: {
  src: string;
  background?: boolean;
}) {
  const [imageState, setImageState] = useState<ImageState>({ state: "Idle" });
  const divRef = useRef<HTMLDivElement>(undefined!);
  useEffect(() => {
    setImageState({ state: "Loading" });
    const img = new Image();
    img.onload = () => {
      setImageState({ state: "Loaded", img: img });
    };
    img.onerror = err => {
      setImageState({ state: "Error", error: err });
      console.error(err);
    };
    requestAnimationFrame(() => {
      img.src = src;
    });
  }, []);

  // const bgWidth = imageState.img.width / refWidth;
  // const bgHeight = imageState.img.height * bgWidth;

  switch (imageState.state) {
    case "Loading":
      return <Spinner />;
    case "Loaded":
      return background ? (
        <div
          ref={divRef}
          style={{
            backgroundImage: `url(${imageState.img.src})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
          }}
        />
      ) : (
        <img src={imageState.img.src} />
      );
    case "Error":
      return <span style={{ color: "red" }}>{imageState.error}</span>;
    case "Idle":
    default:
      return null;
  }
}
