import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";

export default function ProductDetails() {

  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.log(err));
  }, [id]);


  if (!product) {
    return <h2>Loading...</h2>;
  }


  return (
    <div className="product-details">

      <img 
        src={product.image_url}
        alt={product.name}
      />

      <div>
        <h1>{product.name}</h1>

        <h2>
          Rs {Number(product.price).toLocaleString()}
        </h2>

        <p>
          {product.description}
        </p>

        <p>
          Category: {product.category}
        </p>

        <p>
          {product.stock > 0 
          ? "In Stock" 
          : "Out of Stock"}
        </p>

        <button>
          Add to Cart
        </button>

      </div>

    </div>
  );
}
