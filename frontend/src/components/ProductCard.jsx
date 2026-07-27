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
    <>
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

      <style>{`
        .card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: box-shadow var(--t-base) ease, transform var(--t-base) ease, border-color var(--t-base) ease;
        }
        .card:hover {
          box-shadow: var(--shadow);
          transform: translateY(-4px);
          border-color: var(--border-dark);
        }

        /* Image */
        .card-image {
          position: relative;
          aspect-ratio: 1 / 1.15;
          background: var(--sage-pale);
          overflow: hidden;
        }
        .card-image img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: opacity var(--t-slow) ease, transform 0.5s var(--ease-out);
        }
        .card:hover .card-image img { transform: scale(1.04); }
        .card-skel {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, var(--sage-pale) 25%, #fff 50%, var(--sage-pale) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        /* Badges */
        .card-badges {
          position: absolute; top: 12px; left: 12px;
          display: flex; gap: 6px; z-index: 2;
        }
        .card-tag {
          font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(255,255,255,0.92); color: var(--forest);
          padding: 5px 10px; border-radius: 3px;
          backdrop-filter: blur(4px);
        }
        .card-tag-gold { background: var(--gold); color: #fff; }

        /* Image nav arrows + dots */
        .img-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,0.85); border: none;
          font-size: 16px; line-height: 1; color: var(--forest);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 2; opacity: 0;
          transition: opacity var(--t-base) ease, background var(--t-base) ease;
        }
        .card:hover .img-nav { opacity: 1; }
        .img-nav:hover { background: #fff; }
        .img-nav-prev { left: 10px; }
        .img-nav-next { right: 10px; }
        .img-dots {
          position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 5px; z-index: 2;
        }
        .img-dot {
          width: 5px; height: 5px; border-radius: 50%; border: none;
          background: rgba(255,255,255,0.6); cursor: pointer; padding: 0;
        }
        .img-dot.active { background: #fff; width: 14px; border-radius: 3px; }

        /* Hover quick-add overlay */
        .card-overlay {
          position: absolute; left: 0; right: 0; bottom: 0;
          padding: 14px 12px;
          background: linear-gradient(to top, rgba(0,0,0,0.45), transparent);
          display: flex; justify-content: center;
          opacity: 0; transform: translateY(6px);
          transition: opacity var(--t-base) ease, transform var(--t-base) ease;
          z-index: 2;
        }
        .card:hover .card-overlay { opacity: 1; transform: translateY(0); }
        .card-quick-add { width: 100%; font-size: 12px; padding: 10px 20px; }

        /* Body */
        .card-body {
          padding: 16px 16px 18px;
          display: flex; flex-direction: column; gap: 6px;
          flex: 1;
        }
        .card-meta {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 2px;
        }
        .card-cat-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--sage);
        }
        .stock { font-size: 10.5px; font-weight: 600; letter-spacing: 0.04em; }
        .stock.in { color: var(--sage); }
        .stock.out { color: #B54040; }

        .card-name {
          font-size: 19px;
          margin: 0;
        }
        .card-desc {
          font-size: 12.5px; color: var(--ink-soft); line-height: 1.5;
          margin: 2px 0 0;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          margin-top: auto; padding-top: 12px;
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
        }
        .card-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 600; color: var(--ink);
        }
        .card-actions { display: flex; gap: 8px; }
        .card-add, .card-enq {
          padding: 8px 14px; font-size: 11px;
        }

        @media (max-width: 400px) {
          .card-body { padding: 12px 12px 14px; }
          .card-name { font-size: 16px; }
          .card-price { font-size: 17px; }
          .card-footer { flex-direction: column; align-items: stretch; gap: 8px; }
          .card-actions { justify-content: stretch; }
          .card-add, .card-enq { flex: 1; }
        }
      `}</style>
    </>
  );
}
