import { useMemo } from "react";
import { useCatalog } from "../../hooks/queries";
import { applyEdits, useCatalogEdits } from "../../stores/catalogEdits";

export function useAdminCatalog() {
  const query = useCatalog();
  const edited = useCatalogEdits((state) => state.edited);
  const added = useCatalogEdits((state) => state.added);
  const deleted = useCatalogEdits((state) => state.deleted);
  const products = useMemo(
    () => (query.data ? applyEdits(query.data.products, { edited, added, deleted }) : undefined),
    [query.data, edited, added, deleted],
  );
  return { ...query, products };
}
