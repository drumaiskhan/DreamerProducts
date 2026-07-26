import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';

const PLACEHOLDERS = {
  skin: '/product-skin.jpg',
  hair: '/product-hair.jpg',
  perfumes: '/product-perfume.jpg',
};

export default function ProductCard({ product, onEnquire }) {

  const navigate = useNavigate();

  const [imgIndex, setImgIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();


  const rawImages = (() => {
    try {
      const parsed = Array.isArray(product.images)
        ? product.images
        : JSON.parse(product.images || '[]');

      return parsed.length > 0
        ? parsed
        : (product.image_url ? [product.image_url] : []);

    } catch {
      return product.image_url ? [product.image_url] : [];
    }
  })();


  const images = rawImages
    .map(u =>
      u && u.startsWith('http')
        ? u
        : u
        ? `${api.base}${u}`
        : null
    )
    .filter(Boolean);


  const placeholder =
    PLACEHOLDERS[product.category] || PLACEHOLDERS.skin;


  const currentSrc =
    images[imgIndex] ?? placeholder;


  const hasMultiple = images.length > 1;


  function prev(e) {
    e.stopPropagation();

    setImgIndex(i =>
      (i - 1 + images.length) % images.length
    );

    setImgLoaded(false);
  }


  function next(e) {
    e.stopPropagation();

    setImgIndex(i =>
      (i + 1) % images.length
    );

    setImgLoaded(false);
  }


  function handleAdd(e) {

    e.stopPropagation();

    addToCart(product);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1600);
  }


  const catLabel =
    product.category === 'skin'
      ? 'Skincare'
      : product.category === 'hair'
      ? 'Haircare'
      : 'Perfumes';



  return (

    <article
      className="card"
      onClick={() =>
        navigate(`/product/${product.id || product._id}`)
      }
    >


      <div className="card-image">

        {!imgLoaded && <div className="card-skel" />}


        <img
          key={currentSrc}
          src={currentSrc}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          style={{
            opacity: imgLoaded ? 1 : 0
          }}
        />


        <div className="card-badges">

          <span className="card-tag">
            {catLabel}
          </span>


          {Boolean(product.featured) &&
            <span className="card-tag card-tag-gold">
              Featured
            </span>
          }

        </div>



        {hasMultiple && (

          <>

            <button
              className="img-nav img-nav-prev"
              onClick={prev}
            >
              ‹
            </button>


            <button
              className="img-nav img-nav-next"
              onClick={next}
            >
              ›
            </button>



            <div className="img-dots">

              {images.map((_, i) => (

                <button
                  key={i}
                  className={`img-dot ${
                    i === imgIndex ? 'active' : ''
                  }`}
                  onClick={(e)=>{

                    e.stopPropagation();

                    setImgIndex(i);

                    setImgLoaded(false);

                  }}
                />

              ))}

            </div>


          </>

        )}




        <div className="card-overlay">

          <button
            className="card-quick-add btn btn-primary"
            onClick={handleAdd}
          >

            {added
              ? '✓ Added'
              : '+ Add to Cart'
            }

          </button>

        </div>


      </div>




      <div className="card-body">


        <div className="card-meta">

          <span className="card-cat-label">
            {catLabel}
          </span>


          {product.stock > 0
            ? <span className="stock in">
                In Stock
              </span>

            : <span className="stock out">
                Out of Stock
              </span>
          }

        </div>




        <h3 className="card-name">
          {product.name}
        </h3>



        {product.description &&
          <p className="card-desc">
            {product.description}
          </p>
        }




        <div className="card-footer">


          <span className="card-price">
            Rs {Number(product.price).toLocaleString()}
          </span>



          <div className="card-actions">


            <button
              className="btn btn-primary card-add"
              onClick={handleAdd}
              disabled={
                product.stock === 0 || added
              }
            >

              {added
                ? '✓ Added!'
                : product.stock === 0
                ? 'Out of Stock'
                : 'Add'
              }

            </button>



            <button
              className="btn btn-outline card-enq"
              onClick={(e)=>{

                e.stopPropagation();

                onEnquire(product);

              }}
            >

              Enquire

            </button>


          </div>


        </div>


      </div>


    </article>

  );
}
