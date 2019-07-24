import { constructGroups, getCarouselType } from "../utils";

describe("getCarouselType", () => {
  it("should detect unary carousels", () => {
    expect(getCarouselType(1, 1)).toBe("Unary");
    expect(getCarouselType(4, 4)).toBe("Unary");
  });
  it("should detect binary carousels", () => {
    expect(getCarouselType(2, 1)).toBe("Binary");
    expect(getCarouselType(5, 4)).toBe("Binary");
  });
  it("should detect ternary carousels", () => {
    expect(getCarouselType(3, 1)).toBe("Ternary");
    expect(getCarouselType(10, 4)).toBe("Ternary");
  });
});

describe("constructGroups", () => {
  it("should group ternary carousel", () => {
    expect(constructGroups({ totalItems: 10, slidesToShow: 5 })).toEqual([
      { start: 1, end: 5 },
      { start: 2, end: 6 },
      { start: 3, end: 7 },
      { start: 4, end: 8 },
      { start: 5, end: 9 },
      { start: 6, end: 10 },
    ]);
    expect(constructGroups({ totalItems: 3, slidesToShow: 1 })).toEqual([
      { start: 1, end: 1 },
      { start: 2, end: 2 },
      { start: 3, end: 3 },
    ]);
  });
  it("should group binary carousel", () => {
    expect(
      constructGroups({
        totalItems: 5,
        slidesToShow: 4,
      }),
    ).toEqual([{ start: 1, end: 4 }, { start: 2, end: 5 }]);
  });
  it("should group unary carousel carousel", () => {
    expect(
      constructGroups({
        totalItems: 4,
        slidesToShow: 4,
      }),
    ).toEqual([{ start: 1, end: 4 }]);
  });

  describe("should consider startIndex", () => {
    it("in ternary carousels", () => {
      expect(
        constructGroups({ totalItems: 10, slidesToShow: 5, startIndex: 2 }),
      ).toEqual([
        { start: 2, end: 6 },
        { start: 3, end: 7 },
        { start: 4, end: 8 },
        { start: 5, end: 9 },
        { start: 6, end: 10 },
        { start: 1, end: 5 },
      ]);
    });
    it("in binary carousels", () => {
      expect(
        constructGroups({
          totalItems: 5,
          slidesToShow: 4,
          startIndex: 2,
        }),
      ).toEqual([{ start: 2, end: 5 }, { start: 1, end: 4 }]);
    });
    it("in unary carousels", () => {
      expect(
        constructGroups({
          totalItems: 4,
          slidesToShow: 4,
          startIndex: 2,
        }),
      ).toEqual([{ start: 1, end: 4 }]);
    });
  });
});
