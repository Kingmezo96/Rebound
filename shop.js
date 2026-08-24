const PAYSTACK_PUBLIC_KEY = 'pk_live_507f26f5d2f6fdac6ecaf88d92ca408e9753cd63';
const MIN_PREORDER_AMOUNT = 20000;

const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

document.querySelectorAll('[data-paystack-form]').forEach(paystackForm => {
  const root = paystackForm.closest('section') || document;
  const tierButtons = [...paystackForm.querySelectorAll('.tier-card')];
  const customAmount = paystackForm.querySelector('[name="customAmount"]');
  const useCustom = paystackForm.querySelector('.use-custom');
  const selectedLabel = root.querySelector('[data-selected-label]');
  const selectedAmount = root.querySelector('[data-selected-amount]');
  const status = paystackForm.querySelector('.pay-status');
  const checkoutButton = paystackForm.querySelector('.checkout-button');
  const buyerName = paystackForm.querySelector('[name="name"]');
  const buyerEmail = paystackForm.querySelector('[name="email"]');
  const buyerPhone = paystackForm.querySelector('[name="phone"]');
  const quickPay = paystackForm.hasAttribute('data-quick-pay');

  let preorder = {
    tier: 'regular',
    label: 'Regular',
    amount: MIN_PREORDER_AMOUNT
  };

  function updateSelected(next) {
    preorder = next;
    if (selectedLabel) selectedLabel.textContent = preorder.label;
    if (selectedAmount) selectedAmount.textContent = naira.format(preorder.amount);
    tierButtons.forEach(button => {
      const active = button.dataset.tier === preorder.tier;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function fieldInvalid(field) {
    return field && !field.checkValidity();
  }

  function getBuyerValue(field) {
    return field ? field.value.trim() : '';
  }

  function startCheckout() {
    const requiredFields = [buyerName, buyerEmail, buyerPhone].filter(Boolean);
    const firstInvalid = requiredFields.find(fieldInvalid);

    if (firstInvalid) {
      const label = firstInvalid.name === 'email' ? 'email address' : firstInvalid.name;
      status.textContent = `Please add your ${label}.`;
      firstInvalid.focus();
      return;
    }

    if (preorder.amount < MIN_PREORDER_AMOUNT) {
      status.textContent = `Please enter ${naira.format(MIN_PREORDER_AMOUNT)} or above.`;
      if (customAmount) customAmount.focus();
      return;
    }

    if (!window.PaystackPop) {
      status.textContent = 'Paystack could not load. Please refresh and try again.';
      return;
    }

    checkoutButton.disabled = true;
    status.textContent = 'Opening secure Paystack checkout...';

    const reference = `REB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const popup = new PaystackPop();
    const name = getBuyerValue(buyerName);
    const email = getBuyerValue(buyerEmail);
    const phone = getBuyerValue(buyerPhone);

    popup.newTransaction({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: preorder.amount * 100,
      currency: 'NGN',
      reference,
      metadata: {
        name,
        phone,
        preorder_tier: preorder.label,
        custom_fields: [
          { display_name: 'Name', variable_name: 'name', value: name },
          { display_name: 'Phone', variable_name: 'phone', value: phone },
          { display_name: 'Pre-order Tier', variable_name: 'preorder_tier', value: preorder.label }
        ]
      },
      onSuccess: transaction => {
        status.textContent = `Payment received. Reference: ${transaction.reference}`;
        checkoutButton.disabled = false;
        paystackForm.reset();
        updateSelected({ tier: 'regular', label: 'Regular', amount: MIN_PREORDER_AMOUNT });
      },
      onCancel: () => {
        status.textContent = 'Payment window closed. You can continue whenever you are ready.';
        checkoutButton.disabled = false;
      },
      onError: () => {
        status.textContent = 'Payment could not start. Please try again.';
        checkoutButton.disabled = false;
      }
    });
  }

  tierButtons.forEach(button => {
    button.addEventListener('click', () => {
      updateSelected({
        tier: button.dataset.tier,
        label: button.dataset.label || button.querySelector('span').textContent,
        amount: Number(button.dataset.amount)
      });
      status.textContent = '';
      if (quickPay && buyerEmail && buyerEmail.checkValidity()) startCheckout();
    });
  });

  if (useCustom && customAmount) {
    useCustom.addEventListener('click', () => {
      const amount = Number(customAmount.value);
      if (!Number.isFinite(amount) || amount < MIN_PREORDER_AMOUNT) {
        status.textContent = `Please enter ${naira.format(MIN_PREORDER_AMOUNT)} or above.`;
        customAmount.focus();
        return;
      }

      updateSelected({
        tier: 'custom',
        label: 'Custom',
        amount: Math.round(amount)
      });
      status.textContent = 'Custom preorder amount selected.';
    });
  }

  paystackForm.addEventListener('submit', event => {
    event.preventDefault();
    startCheckout();
  });
});
