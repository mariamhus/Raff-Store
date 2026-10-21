import { beforeEach, describe, expect, it } from "vitest";
import { useCart } from "./cart";

const phone = { id: 1, title: "Phone", thumbnail: "", price: 500, discountPercentage: 10, stock: 3 };

describe("cart store", () => {
  beforeEach(() => useCart.setState({ items: [] }));

  it("merges repeat adds and never exceeds stock", () => {
    useCart.getState().add(phone, 2);
    useCart.getState().add(phone, 5);
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0].quantity).toBe(3);
  });

  it("ignores products that are out of stock", () => {
    useCart.getState().add({ ...phone, id: 2, stock: 0 });
    expect(useCart.getState().items).toHaveLength(0);
  });

  it("clamps quantity updates between one and the limit", () => {
    useCart.getState().add(phone);
    useCart.getState().setQuantity(1, 0);
    expect(useCart.getState().items[0].quantity).toBe(1);
    useCart.getState().setQuantity(1, 50);
    expect(useCart.getState().items[0].quantity).toBe(3);
  });

  it("restores a removed item to its original position", () => {
    useCart.getState().add(phone);
    useCart.getState().add({ ...phone, id: 2, title: "Case" });
    const removed = useCart.getState().remove(1)!;
    useCart.getState().restore(removed, 0);
    expect(useCart.getState().items.map((item) => item.id)).toEqual([1, 2]);
  });
});
