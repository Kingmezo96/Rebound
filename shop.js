const PAYSTACK_PUBLIC_KEY = 'PASTE_YOUR_PAYSTACK_PUBLIC_KEY_HERE';
const MIN_PREORDER_AMOUNT = 20000;

const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

const paystackForm = document.querySelector('[data-paystack-form]');

if (paystackForm) {
  const tierButtons = [...paystackForm.querySelectorAll('.tier-card')];
  const customAmount = paystackForm.querySelector('#custom-amount');
  const useCustom = paystackForm.querySelector('.use-custom');
  const selectedLabel = document.querySelector('[data-selected-label]');
  const selectedAmount = document.querySelector('[data-selected-amount]');
  const status = paystackForm.querySelector('.pay-status');
  const checkoutButton = paystackForm.querySelector('.checkout-button');
  const buyerName = paystackForm.querySelector('#buyer-name');
  const buyerEmail = paystackForm.querySelector('#buyer-email');
  const buyerPhone = paystackForm.querySelector('#buyer-phone');

  let preorder = {
    tier: 'regular',
    label: 'Regular',
    amount: MIN_PREORDER_AMOUNT
  };

  function updateSelected(next) {
    preorder = next;
    selectedLabel.textContent = preorder.label;
    selectedAmount.textContent = naira.format(preorder.amount);
    tierButtons.forEach(button => {
      const active = button.dataset.tier === preorder.tier;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  tierButtons.forEach(button => {
    button.addEventListener('click', () => {
      updateSelected({
        tier: button.dataset.tier,
        label: button.querySelector('span').textContent,
        amount: Number(button.dataset.amount)
      });
      status.textContent = '';
    });
  });

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

  paystackForm.addEventListener('submit', event => {
    event.preventDefault();
    const firstInvalid = [buyerName, buyerEmail, buyerPhone].find(field => !field.checkValidity());

    if (firstInvalid) {
      status.textContent = 'Please complete your name, email address, and phone number.';
      firstInvalid.focus();
      return;
    }

    if (preorder.amount < MIN_PREORDER_AMOUNT) {
      status.textContent = `Please enter ${naira.format(MIN_PREORDER_AMOUNT)} or above.`;
      customAmount.focus();
      return;
    }

    if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.includes('PASTE_YOUR')) {
      status.textContent = 'Paystack is ready for setup. Add your public key to activate live checkout.';
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

    popup.newTransaction({
      key: PAYSTACK_PUBLIC_KEY,
      email: buyerEmail.value.trim(),
      amount: preorder.amount * 100,
      currency: 'NGN',
      reference,
      metadata: {
        name: buyerName.value.trim(),
        phone: buyerPhone.value.trim(),
        preorder_tier: preorder.label,
        custom_fields: [
          {
            display_name: 'Name',
            variable_name: 'name',
            value: buyerName.value.trim()
          },
          {
            display_name: 'Phone',
            variable_name: 'phone',
            value: buyerPhone.value.trim()
          },
          {
            display_name: 'Pre-order Tier',
            variable_name: 'preorder_tier',
            value: preorder.label
          }
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
  });
}
