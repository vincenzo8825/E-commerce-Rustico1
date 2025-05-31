import React from 'react';
import './CheckoutSteps.scss';

const CheckoutSteps = ({ currentStep = 1 }) => {
  const steps = [
    {
      id: 1,
      title: 'Carrello',
      description: 'Revisione prodotti',
      icon: '🛒'
    },
    {
      id: 2,
      title: 'Spedizione',
      description: 'Dati di consegna',
      icon: '📍'
    },
    {
      id: 3,
      title: 'Pagamento',
      description: 'Metodo di pagamento',
      icon: '💳'
    },
    {
      id: 4,
      title: 'Conferma',
      description: 'Riepilogo ordine',
      icon: '✅'
    }
  ];

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className="checkout-steps">
      <div className="checkout-steps__container">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="checkout-steps__item">
              <div className={`checkout-steps__step checkout-steps__step--${status}`}>
                <div className="checkout-steps__icon">
                  {status === 'completed' ? '✓' : step.icon}
                </div>
                <div className="checkout-steps__content">
                  <h3 className="checkout-steps__title">{step.title}</h3>
                  <p className="checkout-steps__description">{step.description}</p>
                </div>
              </div>
              
              {!isLast && (
                <div className={`checkout-steps__connector checkout-steps__connector--${
                  step.id < currentStep ? 'completed' : 'pending'
                }`}>
                  <div className="checkout-steps__line"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutSteps; 