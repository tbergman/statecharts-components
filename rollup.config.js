import typescript from "rollup-plugin-typescript2";

export default [
  {
    input: "carousel/src/machine/binaryMachine.ts", // our source file
    output: [
      {
        file: "binaryCarousel.js",
        format: "cjs",
        name: "binaryCarousel",
        globals: {
          xstate: "XState"
        }
      }
    ],
    external: ["xstate"],
    // globals: {
    //   xstate: "xstate"
    // },
    plugins: [
      typescript({
        typescript: require("typescript")
      })
    ]
  },
  {
    input: "carousel/src/machine/TernaryMachine.ts", // our source file
    output: [
      {
        file: "ternaryCarousel.js",
        format: "cjs",
        name: "ternaryCarousel",
        globals: {
          xstate: "XState"
        }
      }
    ],
    // external: ["xstate"],
    // globals: {
    //   xstate: "xstate"
    // },
    plugins: [
      typescript({
        typescript: require("typescript")
      })
    ]
  }
];
