import * as repository from "@/repositories/product.repository";

export const ProductService = {
  getCategories() {
    return repository.getCategories();
  },

  searchProducts(search: string) {
    return repository.searchProducts(search);
  },

  createProduct(
    name: string,
    categoryId: string,
    unit: string
  ) {
    return repository.createProduct(
      name,
      categoryId,
      unit
    );
  },
};