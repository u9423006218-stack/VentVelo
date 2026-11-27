import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

let pdfFontsInitialized = false;

function ensurePdfFonts(): void {
  if (pdfFontsInitialized) return;
  const fontMap = (pdfFonts as { pdfMake?: { vfs?: Record<string, string> } })?.pdfMake?.vfs || pdfFonts;
  if (typeof pdfMake.addVirtualFileSystem === 'function') {
    pdfMake.addVirtualFileSystem(fontMap as Record<string, string>);
  }
  pdfFontsInitialized = true;
}

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

function buildPdfDocDefinition(payload: InvoiceDispatchPayload): TDocumentDefinitions {
  const itemRows: Content[][] = [
    [
      { text: 'Prece / Pakalpojums', style: 'tableHeader' },
      { text: 'Daudz.', style: 'tableHeader', alignment: 'center' },
      { text: 'Cena', style: 'tableHeader', alignment: 'right' },
      { text: 'Summa', style: 'tableHeader', alignment: 'right' },
    ],
    ...payload.items.map((item): Content[] => {
      const itemStack: Content[] = [
        { text: item.name, bold: true, fontSize: 10, color: '#1c1917' },
      ];
      if (item.details) {
        itemStack.push({
          text: item.details,
          fontSize: 8.5,
          color: '#57534e',
          margin: [0, 2, 0, 0],
        });
      }

      return [
        { stack: itemStack },
        { text: String(item.quantity), alignment: 'center', fontSize: 10, color: '#292524' },
        { text: item.unitPriceFormatted, alignment: 'right', fontSize: 10, color: '#44403c' },
        { text: item.lineTotalFormatted, alignment: 'right', bold: true, fontSize: 10, color: '#1c1917' },
      ];
    }),
  ];

  const summaryRows: Content[][] = [
    [
      { text: 'Starpsumma:', fontSize: 10, color: '#57534e' },
      { text: payload.subtotalFormatted, fontSize: 10, bold: true, alignment: 'right', color: '#1c1917' },
    ],
  ];

  if (payload.discountFormatted) {
    summaryRows.push([
      { text: 'Atlaide:', fontSize: 10, color: '#047857' },
      { text: `-${payload.discountFormatted}`, fontSize: 10, bold: true, alignment: 'right', color: '#047857' },
    ]);
  }

  summaryRows.push([
    { text: 'Piegāde:', fontSize: 10, color: '#57534e' },
    { text: payload.shippingFormatted, fontSize: 10, bold: true, alignment: 'right', color: '#1c1917' },
  ]);

  summaryRows.push([
    { text: 'Kopā apmaksai (ar PVN):', fontSize: 12, bold: true, color: '#0c0a09', margin: [0, 4, 0, 0] },
    { text: payload.totalFormatted, fontSize: 13, bold: true, alignment: 'right', color: '#0c0a09', margin: [0, 4, 0, 0] },
  ]);

  const content: Content[] = [
    {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            {
              stack: [
                {
                  text: [
                    { text: 'Vent', color: '#f59e0b', bold: true },
                    { text: 'Velo', color: '#ffffff', bold: true },
                  ],
                  fontSize: 22,
                },
                {
                  text: 'SIA VentVelo · Velosipēdu darbnīca un salons',
                  fontSize: 9.5,
                  color: '#d6d3d1',
                  margin: [0, 3, 0, 0],
                },
                {
                  text: 'Rindas iela 44, Ventspils, LV-3602 · Tālr. +371 27 304 027 · ventspilsvelo@gmail.com',
                  fontSize: 8.5,
                  color: '#a8a29e',
                  margin: [0, 2, 0, 0],
                },
              ],
              fillColor: '#1c1917',
              margin: [14, 14, 14, 14],
            },
            {
              stack: [
                {
                  text: payload.kind === 'service' ? 'SERVISA RĒĶINS / TĀME' : 'ELEKTRONISKAIS RĒĶINS',
                  fontSize: 9,
                  bold: true,
                  color: '#fbbf24',
                  alignment: 'right',
                },
                {
                  text: `#${payload.orderNumber}`,
                  fontSize: 16,
                  bold: true,
                  color: '#ffffff',
                  alignment: 'right',
                  margin: [0, 4, 0, 0],
                },
                {
                  text: `Datums: ${payload.createdAt}`,
                  fontSize: 9,
                  color: '#d6d3d1',
                  alignment: 'right',
                  margin: [0, 4, 0, 0],
                },
              ],
              fillColor: '#1c1917',
              margin: [14, 14, 14, 14],
            },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 18],
    },
    {
      columns: [
        {
          width: '*',
          stack: [
            { text: 'SAŅĒMĒJS / KLIENTS', fontSize: 8.5, bold: true, color: '#78716c', margin: [0, 0, 0, 4] },
            { text: payload.customerName, bold: true, fontSize: 11 },
            { text: `E-pasts: ${payload.customerEmail || 'Nav norādīts'}`, fontSize: 9.5, color: '#44403c', margin: [0, 2, 0, 0] },
            { text: `Tālrunis: ${payload.customerPhone || 'Nav norādīts'}`, fontSize: 9.5, color: '#44403c', margin: [0, 2, 0, 0] },
          ],
        },
        {
          width: '*',
          stack: [
            { text: 'PIEGĀDE UN APMAKSA', fontSize: 8.5, bold: true, color: '#78716c', margin: [0, 0, 0, 4] },
            { text: payload.deliveryLabel, bold: true, fontSize: 10 },
            { text: `Adrese: ${payload.address}`, fontSize: 9.5, color: '#44403c', margin: [0, 2, 0, 0] },
            { text: `Apmaksa: ${payload.paymentMethodLabel}`, fontSize: 9.5, color: '#44403c', margin: [0, 2, 0, 0] },
          ],
        },
      ],
      columnGap: 20,
      margin: [0, 0, 0, 18],
    },
  ];

  if (payload.notes) {
    content.push({
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: `Piezīmes: ${payload.notes}`,
              fontSize: 9,
              color: '#44403c',
              fillColor: '#fafaf9',
              margin: [10, 8, 10, 8],
            },
          ],
        ],
      },
      layout: {
        hLineColor: () => '#e7e5e4',
        vLineColor: () => '#e7e5e4',
      },
      margin: [0, 0, 0, 16],
    });
  }

  content.push(
    {
      table: {
        headerRows: 1,
        widths: ['*', 45, 70, 75],
        body: itemRows,
      },
      layout: {
        fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f5f5f4' : null),
        hLineColor: (i: number) => (i === 1 ? '#1c1917' : '#e7e5e4'),
        vLineWidth: () => 0,
        paddingTop: () => 8,
        paddingBottom: () => 8,
        paddingLeft: () => 6,
        paddingRight: () => 6,
      },
      margin: [0, 0, 0, 16],
    },
    {
      columns: [
        { width: '*', text: '' },
        {
          width: 240,
          table: {
            widths: ['*', 'auto'],
            body: summaryRows,
          },
          layout: {
            hLineWidth: (i: number) => (i === summaryRows.length - 1 ? 1 : 0),
            vLineWidth: () => 0,
            hLineColor: () => '#1c1917',
            paddingTop: () => 4,
            paddingBottom: () => 4,
          },
        },
      ],
      margin: [0, 0, 0, 26],
    },
    {
      text: 'Paldies par uzticību VentVelo! Jautājumu gadījumā sazinieties ar meistaru Raivi pa tālruni +371 27 304 027 vai e-pastā ventspilsvelo@gmail.com.',
      fontSize: 9,
      color: '#78716c',
      margin: [0, 12, 0, 0],
    }
  );

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 50],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      color: '#1c1917',
    },
    content,
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 9,
        color: '#44403c',
      },
    },
  };
}

export async function generateInvoicePdfBlob(payload: InvoiceDispatchPayload): Promise<Blob> {
  ensurePdfFonts();
  const docDef = buildPdfDocDefinition(payload);
  return pdfMake.createPdf(docDef).getBlob();
}

export async function downloadInvoicePdf(payload: InvoiceDispatchPayload): Promise<void> {
  ensurePdfFonts();
  const docDef = buildPdfDocDefinition(payload);
  await pdfMake.createPdf(docDef).download(`VentVelo-Rekins-${payload.orderNumber}.pdf`);
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
    _template: 'box',
    _captcha: 'false',
    'Rēķina numurs': `#${payload.orderNumber}`,
    Datums: payload.createdAt,
    Klients: payload.customerName,
    'Klienta e-pasts': trimmedCustomerEmail || 'Nav norādīts',
    'Klienta tālrunis': payload.customerPhone || 'Nav norādīts',
    'Preces un pakalpojumi': itemsText,
    Starpsumma: payload.subtotalFormatted,
    ...(payload.discountFormatted ? { Atlaide: `-${payload.discountFormatted}` } : {}),
    Piegāde: `${payload.deliveryLabel} (${payload.shippingFormatted})`,
    'Piegādes adrese': payload.address,
    'Apmaksas veids': payload.paymentMethodLabel,
    'Kopā apmaksai (ar PVN)': payload.totalFormatted,
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

  let pdfBlob: Blob | null = null;
  try {
    pdfBlob = await generateInvoicePdfBlob(payload);
  } catch {
    pdfBlob = null;
  }

  try {
    let response: Response;
    if (pdfBlob) {
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('attachment', pdfBlob, `VentVelo-Rekins-${payload.orderNumber}.pdf`);

      response = await fetch(FORMSUBMIT_AJAX_URL, {
        method: 'POST',
        mode: 'cors',
        referrerPolicy: 'origin-when-cross-origin',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        response = await fetch(FORMSUBMIT_AJAX_URL, {
          method: 'POST',
          mode: 'cors',
          referrerPolicy: 'origin-when-cross-origin',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(fields),
        });
      }
    } else {
      response = await fetch(FORMSUBMIT_AJAX_URL, {
        method: 'POST',
        mode: 'cors',
        referrerPolicy: 'origin-when-cross-origin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(fields),
      });
    }

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
