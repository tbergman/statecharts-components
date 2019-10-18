import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
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

  switch (imageState.state) {
    case "Loading":
      return <Spinner />;
    case "Loaded":
      return background ? (
        <div
          ref={divRef}
          style={{
            // width: imageState.img.width,
            // height: imageState.img.height,
            paddingBottom: "100%",
            maxWidth: "100%",
            minWidth: "100%",
            backgroundImage: `url(${imageState.img.src})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />
      ) : (
        <img src={imageState.img.src} />
      );
    case "Error":
      return (
        <span style={{ color: "red" }}>
          {typeof imageState.error === "string"
            ? imageState.error
            : imageState.error.toString()}
        </span>
      );
    case "Idle":
    default:
      return null;
  }
}
