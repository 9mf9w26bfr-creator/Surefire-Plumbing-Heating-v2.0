import test from 'node:test';
import assert from 'node:assert/strict';
import {
  triagePost,
  resolveArea,
  detectSafetyFlag,
  generateReply,
} from '../src/services/socialMonitoringEngine.ts';

test('Social Monitoring Engine — Facebook Post Triage', async (t) => {
  await t.test('correctly triages user screenshot case: Sarah Shepherd WA1 bath adjustment in Warrington', () => {
    const postText =
      'Can anyone recommend someone to re fit/ adjust and fix a bath please? We had it fitted in "good faith" but have been made aware as it\'s a shower bath it needs wooden frame / battens to be attached to the wall/ bath before sides and shower screen can go up and it be used ! We are in wa1 and need it doing asap please by some one who is experienced. Many thanks';

    const result = triagePost({
      groupName: 'Warrington Professional Handyman Services',
      postText,
    });

    assert.equal(result.areaStatus, 'IN_AREA');
    assert.equal(result.locationText, 'WA1');
    assert.equal(result.urgency, 'HIGH');
    assert.equal(result.safetyFlag, null);
    assert.ok(result.leadScore >= 75);
    assert.ok(result.replyDraft);
    assert.match(result.replyDraft, /Surefire Plumbing & Heating/);
    assert.match(result.replyDraft, /covering WA1/);
    assert.match(result.replyDraft, /bath/i);
  });

  await t.test('correctly extracts Warrington leaking tap case and generates British English reply', () => {
    const postText =
      'Can anyone recommend a reliable plumber in Warrington? My kitchen tap is leaking.';

    const result = triagePost({
      groupName: 'Warrington Community Group',
      postText,
    });

    assert.equal(result.areaStatus, 'IN_AREA');
    assert.equal(result.locationText, 'Warrington');
    assert.equal(result.safetyFlag, null);
    assert.ok(result.replyDraft);
    assert.match(result.replyDraft, /leaking tap repair/i);
    assert.match(result.replyDraft, /Warrington/);
  });

  await t.test('strictly intercepts smell gas or carbon monoxide risks', () => {
    const postText = 'I can smell gas near my boiler and the alarm is beeping';
    const flag = detectSafetyFlag(postText);
    assert.equal(flag, 'GAS_OR_CO_RISK');

    const result = triagePost({
      groupName: 'Liverpool Community',
      postText,
    });

    assert.equal(result.status, 'SAFETY_REVIEW_REQUIRED');
    assert.equal(result.replyDraft, null);
    assert.equal(result.safetyFlag, 'GAS_OR_CO_RISK');
  });

  await t.test('marks London / Birmingham posts as OUTSIDE_AREA', () => {
    const area = resolveArea('London');
    assert.equal(area.areaStatus, 'OUTSIDE_AREA');

    const result = triagePost({
      groupName: 'London Trades',
      postText: 'Need a plumber in Central London ASAP',
      locationText: 'London',
    });

    assert.equal(result.areaStatus, 'OUTSIDE_AREA');
    assert.equal(result.status, 'OUTSIDE_SERVICE_AREA');
    assert.equal(result.replyDraft, null);
  });
});
