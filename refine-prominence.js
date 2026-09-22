/* Longevity Refine prominence — DOM upgrade after free estimate.
 * Keeps #38 honesty; opens the same #refineDetails long form.
 */
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function openRefineForm() {
    const details = document.getElementById('refineDetails');
    if (!details) return;
    details.open = true;
    details.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function upgrade() {
    const summary = document.getElementById('refineSummary');
    if (summary) {
      summary.textContent = 'Optional — add more answers for a fuller picture of this estimate.';
      summary.style.fontWeight = '500';
      summary.style.fontSize = '15px';
      summary.style.color = 'var(--text-secondary)';
    }

    const oldNote = document.querySelector('.refine-inline-note');
    if (!oldNote || document.getElementById('refinePrimary')) return;

    const block = document.createElement('div');
    block.className = 'refine-primary';
    block.id = 'refinePrimary';
    block.innerHTML =
      '<h3 class="refine-primary-title" id="refinePrimaryTitle">Want a fuller picture?</h3>' +
      '<button type="button" class="refine-primary-button" id="refineNumberPrimary">Add more answers</button>';

    oldNote.replaceWith(block);

    const style = document.createElement('style');
    style.textContent = [
      '.refine-primary{margin:18px 0 8px;padding:16px 16px 14px;border-radius:16px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.08);}',
      '.refine-primary-title{margin:0 0 12px;font-size:20px;font-weight:700;letter-spacing:0.2px;color:#fff;line-height:1.35;}',
      '.refine-primary-button{display:inline-flex;align-items:center;justify-content:center;width:100%;max-width:420px;border:none;border-radius:14px;padding:14px 18px;font:inherit;font-size:16px;font-weight:700;color:#1a2340;background:linear-gradient(135deg,#f4f7ff,#d7e2ff);box-shadow:0 10px 24px rgba(10,16,40,0.28);cursor:pointer;}',
      '.refine-primary-button:hover{filter:brightness(1.04);}'
    ].join('');
    document.head.appendChild(style);

    document.getElementById('refineNumberPrimary')?.addEventListener('click', openRefineForm);
    document.getElementById('refineNumber')?.addEventListener('click', openRefineForm);
  }

  ready(upgrade);
})();
