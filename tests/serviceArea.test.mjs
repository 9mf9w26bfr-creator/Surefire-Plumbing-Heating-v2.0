import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getCoverageDetail, CoverageResult } from '../src/utils/serviceAreaEngine.ts';
import { isValidUKPostcode, formatUKPostcode } from '../src/utils/validatePostcode.ts';
import { generateBookingReference } from '../src/utils/referenceGenerator.ts';

describe('Service Area & Geographic Coverage Engine', () => {
  test('covers Liverpool postcodes', () => {
    const l1 = getCoverageDetail('L1 1AA');
    assert.equal(l1.result, CoverageResult.FULLY_COVERED);
    assert.equal(l1.isCovered, true);
    assert.equal(l1.region, 'Liverpool');

    const l8 = getCoverageDetail('L8 5RB');
    assert.equal(l8.result, CoverageResult.FULLY_COVERED);
  });

  test('covers Merseyside and Cheshire postcodes', () => {
    const ch = getCoverageDetail('CH1 2AA');
    assert.equal(ch.result, CoverageResult.FULLY_COVERED);
    assert.equal(ch.region, 'Cheshire');

    const birkenhead = getCoverageDetail('CH41 1AA');
    assert.equal(birkenhead.result, CoverageResult.FULLY_COVERED);
    assert.equal(birkenhead.region, 'Merseyside');
  });

  test('covers Warrington, Widnes and Runcorn postcodes', () => {
    const wa1 = getCoverageDetail('WA1 1AA');
    assert.equal(wa1.result, CoverageResult.FULLY_COVERED);
    assert.equal(wa1.region, 'Warrington');

    const runcorn = getCoverageDetail('WA7 1AA');
    assert.equal(runcorn.result, CoverageResult.FULLY_COVERED);
    assert.equal(runcorn.region, 'Runcorn');
  });

  test('enforces Greater Manchester approved postcodes only', () => {
    const m1 = getCoverageDetail('M1 1AA');
    assert.equal(m1.result, CoverageResult.FULLY_COVERED);
    assert.equal(m1.isCovered, true);

    const m99 = getCoverageDetail('M99 9AA');
    assert.equal(m99.result, CoverageResult.NOT_COVERED);
    assert.equal(m99.isCovered, false);
  });

  test('rejects out of area locations (London, Birmingham, Leeds)', () => {
    const london = getCoverageDetail('SW1A 1AA');
    assert.equal(london.result, CoverageResult.NOT_COVERED);
    assert.equal(london.isCovered, false);

    const birmingham = getCoverageDetail('B1 1AA');
    assert.equal(birmingham.result, CoverageResult.NOT_COVERED);
  });
});

describe('Postcode & Reference Utilities', () => {
  test('validates UK postcodes', () => {
    assert.equal(isValidUKPostcode('L1 1AA'), true);
    assert.equal(isValidUKPostcode('WA12BB'), true);
    assert.equal(isValidUKPostcode('INVALID123'), false);
    assert.equal(isValidUKPostcode(''), false);
  });

  test('formats UK postcodes with space', () => {
    assert.equal(formatUKPostcode('l11aa'), 'L1 1AA');
    assert.equal(formatUKPostcode('wa14bb'), 'WA1 4BB');
  });

  test('generates reference in PH-NW-XXXXXX-XXXX format', () => {
    const ref = generateBookingReference();
    assert.match(ref, /^PH-NW-[0-9A-Z]{6}-[0-9A-Z]{4}$/);
  });
});
