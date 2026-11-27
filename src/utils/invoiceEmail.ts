export interface InvoiceItemInput {
  name: string;
  details?: string;
  quantity: number;
  unitPriceFormatted: string;
  lineTotalFormatted: string;
}

export interface InvoiceDispatchPayload {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  deliveryLabel: string;
  paymentMethodLabel: string;
  items: InvoiceItemInput[];
  subtotalFormatted: string;
  discountFormatted?: string;
  shippingFormatted: string;
  totalFormatted: string;
  notes?: string;
  kind?: 'order' | 'service';
}

export interface InvoiceDispatchResult {
  ok: boolean;
  customerIncluded: boolean;
  needsActivation?: boolean;
  errorMessage?: string;
}

export const STORE_OFFICIAL_EMAIL = 'ventspilsvelo@gmail.com';
const FORMSUBMIT_STANDARD_URL = `https://formsubmit.co/${STORE_OFFICIAL_EMAIL}`;
const FORMSUBMIT_AJAX_URL = `https://formsubmit.co/ajax/${STORE_OFFICIAL_EMAIL}`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildInvoiceHtml(payload: InvoiceDispatchPayload): string {
  const safeName = escapeHtml(payload.customerName);
  const safeEmail = escapeHtml(payload.customerEmail || 'Nav norādīts');
  const safePhone = escapeHtml(payload.customerPhone || 'Nav norādīts');
  const safeAddress = escapeHtml(payload.address);
  const safeDelivery = escapeHtml(payload.deliveryLabel);
  const safePayment = escapeHtml(payload.paymentMethodLabel);
  const safeOrderNo = escapeHtml(payload.orderNumber);
  const safeDate = escapeHtml(payload.createdAt);

  const itemRows = payload.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e7e5e4; vertical-align: top;">
          <div style="font-weight: 600; color: #1c1917;">${escapeHtml(item.name)}</div>
          ${item.details ? `<div style="font-size: 12px; color: #57534e; margin-top: 2px;">${escapeHtml(item.details)}</div>` : ''}
        </td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e7e5e4; text-align: center; color: #44403c;">${item.quantity}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e7e5e4; text-align: right; font-family: monospace; font-weight: 600; color: #1c1917;">${escapeHtml(item.lineTotalFormatted)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; color: #1c1917; line-height: 1.55; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #1c1917; padding: 22px 24px; color: #ffffff;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-size: 20px; font-weight: 800; letter-spacing: -0.4px;"><span style="color: #f59e0b;">Vent</span>Velo</div>
            <div style="font-size: 12px; color: #a8a29e; margin-top: 2px;">SIA VentVelo · Rindas iela 44, Ventspils · +371 27 304 027</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; text-transform: uppercase; color: #fbbf24; font-weight: 700;">${payload.kind === 'service' ? 'Servisa tāme / Rēķins' : 'Elektroniskais rēķins'}</div>
            <div style="font-size: 15px; font-weight: 700; font-family: monospace;">#${safeOrderNo}</div>
          </div>
        </div>
      </div>

      <div style="padding: 24px;">
        <p style="margin: 0 0 16px; font-size: 14px;">
          Labdien, <strong>${safeName}</strong>! Paldies par pasūtījumu VentVelo. Zemāk pievienots Jūsu darījuma rēķins un kopsavilkums (kopija automātiski nosūtīta arī veikalam <strong>${STORE_OFFICIAL_EMAIL}</strong>).
        </p>

        <div style="background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 14px 16px; margin-bottom: 18px; font-size: 13px;">
          <div><strong>Datums:</strong> ${safeDate}</div>
          <div><strong>Klients:</strong> ${safeName}</div>
          <div><strong>E-pasts:</strong> ${safeEmail} · <strong>Tālrunis:</strong> ${safePhone}</div>
          <div><strong>Piegādes veids:</strong> ${safeDelivery}</div>
          <div><strong>Adrese / Saņemšana:</strong> ${safeAddress}</div>
          <div><strong>Apmaksas veids:</strong> ${safePayment}</div>
          ${payload.notes ? `<div><strong>Piezīmes:</strong> ${escapeHtml(payload.notes)}</div>` : ''}
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f5f5f4; text-align: left;">
              <th style="padding: 9px 8px; border-bottom: 2px solid #d6d3d1;">Prece / Pakalpojums</th>
              <th style="padding: 9px 8px; border-bottom: 2px solid #d6d3d1; text-align: center;">Daudz.</th>
              <th style="padding: 9px 8px; border-bottom: 2px solid #d6d3d1; text-align: right;">Summa</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="border-top: 2px solid #1c1917; padding-top: 12px; font-size: 13px; max-width: 280px; margin-left: auto;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #57534e;">
            <span>Starpsumma:</span>
            <span style="font-family: monospace; font-weight: 600;">${escapeHtml(payload.subtotalFormatted)}</span>
          </div>
          ${
            payload.discountFormatted
              ? `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #047857;">
                  <span>Atlaide:</span>
                  <span style="font-family: monospace; font-weight: 600;">-${escapeHtml(payload.discountFormatted)}</span>
                </div>`
              : ''
          }
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #57534e;">
            <span>Piegāde:</span>
            <span style="font-family: monospace; font-weight: 600;">${escapeHtml(payload.shippingFormatted)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #0c0a09; border-top: 1px solid #e7e5e4; padding-top: 8px;">
            <span>Kopā (ar PVN):</span>
            <span style="font-family: monospace;">${escapeHtml(payload.totalFormatted)}</span>
          </div>
        </div>

        <p style="margin: 22px 0 0; font-size: 12px; color: #78716c; border-top: 1px solid #f5f5f4; padding-top: 14px;">
          Jautājumu gadījumā sazinieties ar meistaru Raivi: <strong>+371 27 304 027</strong> vai <strong>${STORE_OFFICIAL_EMAIL}</strong>.
        </p>
      </div>
    </div>
  `;
}

export function downloadInvoiceHtml(payload: InvoiceDispatchPayload): void {
  const htmlDoc = `<!doctype html>
<html lang="lv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VentVelo Rēķins #${escapeHtml(payload.orderNumber)}</title>
</head>
<body style="margin: 24px; background: #f5f5f4;">
  ${buildInvoiceHtml(payload)}
</body>
</html>`;

  const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `VentVelo-Rekins-${payload.orderNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildFormPayloadFields(payload: InvoiceDispatchPayload): {
  fields: Record<string, string>;
  shouldCcCustomer: boolean;
} {
  const trimmedCustomerEmail = payload.customerEmail.trim();
  const hasValidCustomerEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedCustomerEmail);
  const shouldCcCustomer =
    hasValidCustomerEmail && trimmedCustomerEmail.toLowerCase() !== STORE_OFFICIAL_EMAIL;

  const itemsText = payload.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.name}${item.details ? ` (${item.details})` : ''} × ${item.quantity} = ${item.lineTotalFormatted}`
    )
    .join('\n');

  const fields: Record<string, string> = {
    _subject: `VentVelo Rēķins #${payload.orderNumber} — ${payload.customerName} (${payload.totalFormatted})`,
    _template: 'table',
    _captcha: 'false',
    Rēķina_numurs: `#${payload.orderNumber}`,
    Datums: payload.createdAt,
    Klients: payload.customerName,
    Klienta_epasts: trimmedCustomerEmail || 'Nav norādīts',
    Klienta_tālrunis: payload.customerPhone || 'Nav norādīts',
    Preces_un_pakalpojumi: itemsText,
    Starpsumma: payload.subtotalFormatted,
    ...(payload.discountFormatted ? { Atlaide: `-${payload.discountFormatted}` } : {}),
    Piegāde: `${payload.deliveryLabel} (${payload.shippingFormatted})`,
    Piegādes_adrese: payload.address,
    Apmaksas_veids: payload.paymentMethodLabel,
    Kopā_apmaksai_ar_PVN: payload.totalFormatted,
    ...(payload.notes ? { Piezīmes: payload.notes } : {}),
    Pārdevējs: `SIA VentVelo · Rindas iela 44, Ventspils · +371 27 304 027 · ${STORE_OFFICIAL_EMAIL}`,
  };

  if (shouldCcCustomer) {
    fields._cc = trimmedCustomerEmail;
    fields._replyto = trimmedCustomerEmail;
  }

  return { fields, shouldCcCustomer };
}

export function submitViaStandardForm(payload: InvoiceDispatchPayload): void {
  const { fields } = buildFormPayloadFields(payload);
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = FORMSUBMIT_STANDARD_URL;
  form.target = '_blank';
  form.style.display = 'none';

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

export async function sendInvoiceEmails(payload: InvoiceDispatchPayload): Promise<InvoiceDispatchResult> {
  const { fields, shouldCcCustomer } = buildFormPayloadFields(payload);

  try {
    const response = await fetch(FORMSUBMIT_AJAX_URL, {
      method: 'POST',
      mode: 'cors',
      referrerPolicy: 'origin-when-cross-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(fields),
    });

    const result = await response.json().catch(() => null);
    const success = result?.success === 'true' || result?.success === true;
    const msg = typeof result?.message === 'string' ? result.message : '';
    const needsActivation = /activat/i.test(msg);

    if (!response.ok || !success) {
      return {
        ok: false,
        customerIncluded: shouldCcCustomer,
        needsActivation,
        errorMessage: msg || `HTTP ${response.status}`,
      };
    }

    return {
      ok: true,
      customerIncluded: shouldCcCustomer,
    };
  } catch (err) {
    return {
      ok: false,
      customerIncluded: shouldCcCustomer,
      errorMessage: err instanceof Error ? err.message : 'Tīkla kļūda',
    };
  }
}
