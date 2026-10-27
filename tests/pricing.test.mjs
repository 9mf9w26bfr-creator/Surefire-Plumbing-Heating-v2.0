import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateEstimate, SERVICE_BASE_PRICE } from '../src/config/pricing.ts';

describe('Pricing & Estimation Engine', () => {
  test('includes £40 standard call-out fee', () => {
    const res = generateEstimate({
      serviceType: 'plumbing',
      postcode: 'L1 1AA',
      description: 'Dripping tap',
      imageCount: 0,
    });

    assert.equal(res.breakdown.callOutFee, 40);
    assert.ok(res.priceMin >= 70); // 40 + base.min (30)
    assert.ok(res.priceMax <= 150);
  });

  test('applies remote surcharge for Cheshire / Manchester', () => {
    const resCH = generateEstimate({
      serviceType: 'plumbing',
      postcode: 'CH1 1AA',
      description: 'Tap repair',
      imageCount: 0,
    });

    assert.equal(resCH.breakdown.remoteSurcharge, 10);

    const resM = generateEstimate({
      serviceType: 'plumbing',
      postcode: 'M1 1AA',
      description: 'Tap repair',
      imageCount: 0,
    });

    assert.equal(resM.breakdown.remoteSurcharge, 15);
  });

  test('boosts confidence when photos are provided', () => {
    const noPhotos = generateEstimate({
      serviceType: 'boiler-heating',
      postcode: 'L3 4FP',
      description: 'Boiler making strange noise',
      imageCount: 0,
    });

    const withPhotos = generateEstimate({
      serviceType: 'boiler-heating',
      postcode: 'L3 4FP',
      description: 'Boiler making strange noise',
      imageCount: 3,
    });

    assert.ok(withPhotos.confidence > noPhotos.confidence);
    assert.ok(withPhotos.disclaimer.includes('Final price confirmed on-site'));
  });

  test('applies complexity multiplier on emergency keywords', () => {
    const standard = generateEstimate({
      serviceType: 'plumbing',
      postcode: 'L1 1AA',
      description: 'Routine pipe check',
      imageCount: 0,
    });

    const emergency = generateEstimate({
      serviceType: 'plumbing',
      postcode: 'L1 1AA',
      description: 'Burst pipe urgent leaking flooding',
      imageCount: 0,
    });

    assert.ok(emergency.priceMax > standard.priceMax);
  });
});
