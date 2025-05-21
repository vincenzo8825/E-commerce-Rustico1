import React from 'react';
import './Cart.scss';

const Cart = () => {
  return (
    <div className="cart">
      <div className="cart__container">
        <h1 className="cart__title">Il Tuo Carrello</h1>
        <div className="cart__content">
          <p>Il tuo carrello è vuoto.</p>
        </div>
      </div>
    </div>
  );
};

export default Cart;