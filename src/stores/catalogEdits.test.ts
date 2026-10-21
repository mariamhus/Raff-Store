import { describe, expect, it } from "vitest";
import { applyEdits, type CatalogProduct } from "./catalogEdits";

const base: CatalogProduct[] = [
  { id: 1, title: "Mascara", price: 9.99, discountPercentage: 7, rating: 4.9, stock: 5, category: "beauty", thumbnail: "" },
  { id: 2, title: "Lipstick", price: 12.99, discountPercentage: 0, rating: 4.2, stock: 40, category: "beauty", thumbnail: "" },
];

describe("applyEdits", () => {
  it("adds new products first, applies edits, and hides deleted ones", () => {
    const added: CatalogProduct = { ...base[0], id: 195, title: "New serum" };
    const result = applyEdits(base, { added: [added], edited: { 1: { price: 8.5 } }, deleted: [2] });
    expect(result.map((product) => product.id)).toEqual([195, 1]);
    expect(result[1].price).toBe(8.5);
  });
});
