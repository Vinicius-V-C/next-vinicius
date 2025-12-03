
// Avaliação (rating) de um produto
export interface Rating {
  rate: number;   // classificação média
  count: number;  // número de avaliações
}

// Produto devolvido pela API
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: Rating; // usa a interface Rating
}
