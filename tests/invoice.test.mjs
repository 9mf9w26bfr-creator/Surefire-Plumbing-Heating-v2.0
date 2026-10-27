import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDefaultInvoice,
  generateInvoiceNumber,
} from '../src/utils/invoiceEngine.ts';

test('Invoice & Billing Details Engine', async (t) => {
  await t.test('generates valid invoice with £40 standard call-out fee', () => {
    const booking = {
      id: 'book-12345',
      referenceNumber: 'PH-NW-102938-2026',
      service: 'General Repairs',
      date: '2026-10-30',
      time: '08:00 - 12:00',
      name: 'Sarah Shepherd',
      phone: '07700 900123',
      address: '14 Church Street',
      postcode: 'WA1 2TH',
      notes: 'Shower bath needs battens and fitting',
      priceEstLo: 70,
      priceEstHi: 110,
    };

    const invoice = buildDefaultInvoice(booking);

    assert.equal(invoice.callOutFee, 40);
    assert.match(invoice.invoiceNumber, /^INV-2026-/);
    assert.equal(invoice.customer.name, 'Sarah Shepherd');
    assert.equal(invoice.customer.postcode, 'WA1 2TH');
    assert.equal(invoice.remoteSurcharge, 5); // WA postcode surcharge is £5

    // Verify line items include standard call-out
    const callOutItem = invoice.items.find((i) => i.id === 'item-callout');
    assert.ok(callOutItem);
    assert.equal(callOutItem.unitPrice, 40);

    // Verify subtotal matches sum of items
    const sum = invoice.items.reduce((s, i) => s + i.total, 0);
    assert.equal(invoice.subtotal, sum);
    assert.equal(invoice.totalDue, sum + invoice.vatAmount);
    assert.equal(invoice.paymentStatus, 'UNPAID');
  });

  await t.test('handles Cheshire remote surcharge (£10)', () => {
    const booking = {
      id: 'book-ch1',
      referenceNumber: 'PH-NW-334455-2026',
      service: 'Boiler Service',
      date: '2026-11-02',
      time: '12:00 - 18:00',
      name: 'John Chester',
      phone: '07700 900456',
      address: 'High Street',
      postcode: 'CH1 2AA',
      priceEstLo: 80,
      priceEstHi: 140,
    };

    const invoice = buildDefaultInvoice(booking);
    assert.equal(invoice.remoteSurcharge, 10);
    const surchargeItem = invoice.items.find((i) => i.id === 'item-surcharge');
    assert.ok(surchargeItem);
    assert.equal(surchargeItem.total, 10);
  });
});
