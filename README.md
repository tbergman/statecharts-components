## Carousel Component with statecharts

- [x] Next, Prev with static items
- [x] Cyclic transition
- [x] Custom go to and click on dots
- [x] Autoplay
- [x] Support for direction
- [x] Fix the active dot bug when doing next and prev on `{ "totalItems": 2, "startIndex": 1, "dir": "ltr", "infinite": true }`
- [x] Don't accept `Next` and `Prev` events for **machines of items length 1 and 2**
- [ ] Support for touch
- [ ] Config for dots and buttons
- [ ] Support for carousel methods (goToSlide, next, prev, ...)
- [ ] Support for fade
- [ ] Support for different layouts
- [ ] Add validation for negative, zero and float numbers
- [ ] React component should be exactly the same as react-slick `<Slider />`

## Run locally

Run `yarn start` to start the local server on port 3000.

Homepage will show rendered components.

`localhost:3000/__viz` will show the visualizer.
