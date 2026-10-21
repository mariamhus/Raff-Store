import { describe, expect, it } from "vitest";
import { cartTotals, finalPrice, maxQuantity, stockLevel } from "./pricing";

describe("finalPrice", () => {
  it("applies the discount and rounds to cents", () => {
    expect(finalPrice(9.99, 7.17)).toBe(9.27);
    expect(finalPrice(100, 0)).toBe(100);
  });
});

describe("cartTotals", () => {
  it("adds shipping below the free-shipping threshold", () => {
    const totals = cartTotals([{ price: 20, discountPercentage: 10, quantity: 2 }]);
    expect(totals).toMatchObject({ original: 40, subtotal: 36, savings: 4, shipping: 10, total: 46, count: 2 });
  });

  it("ships free from 100 and charges nothing for an empty cart", () => {
    expect(cartTotals([{ price: 50, discountPercentage: 0, quantity: 2 }]).shipping).toBe(0);
    expect(cartTotals([]).total).toBe(0);
  });
});

describe("stock helpers", () => {
  it("caps quantity at the stock or ten, whichever is lower", () => {
    expect(maxQuantity(3)).toBe(3);
    expect(maxQuantity(99)).toBe(10);
    expect(maxQuantity(0)).toBe(0);
  });

  it("classifies stock levels", () => {
    expect(stockLevel(0)).toBe("out");
    expect(stockLevel(4)).toBe("low");
    expect(stockLevel(40)).toBe("in");
  });
});
