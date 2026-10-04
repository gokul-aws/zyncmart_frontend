// The admin UI must only offer order changes the backend accepts
// (zyncmart_backend/src/services/orderStatus.js is authoritative).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adminStatusOptions, canAdminCancel, cancellationRefunds } from '../lib/orderTransitions.ts';

const order = (status, method = 'razorpay', paymentStatus = 'paid') => ({ status, payment: { method, status: paymentStatus } });

test('an unpaid online order cannot be progressed by an admin', () => {
  assert.deepEqual(adminStatusOptions(order('placed', 'razorpay', 'pending')), ['placed']);
});

test('a paid online order moves forward only', () => {
  assert.deepEqual(adminStatusOptions(order('confirmed')), ['confirmed', 'processing', 'shipped', 'delivered']);
  assert.deepEqual(adminStatusOptions(order('shipped')), ['shipped', 'delivered']);
  assert.deepEqual(adminStatusOptions(order('delivered')), ['delivered', 'returned']);
});

test('a COD order can be confirmed and fulfilled before payment', () => {
  assert.deepEqual(adminStatusOptions(order('placed', 'cod', 'pending')), ['placed', 'confirmed', 'processing', 'shipped', 'delivered']);
});

test('cancelled, expired and returned orders offer no changes', () => {
  assert.deepEqual(adminStatusOptions(order('cancelled', 'razorpay', 'failed')), ['cancelled']);
  assert.deepEqual(adminStatusOptions(order('cancelled', 'razorpay', 'refund_pending')), ['cancelled']);
  assert.deepEqual(adminStatusOptions(order('returned')), ['returned']);
});

test('the status selector never offers payment-related or backward states', () => {
  for (const status of ['placed', 'confirmed', 'processing', 'shipped', 'delivered']) {
    const options = adminStatusOptions(order(status));
    assert.ok(!options.includes('cancelled'), `${status} offers cancelled in the selector`);
    if (status !== 'placed') assert.ok(!options.includes('placed'), `${status} offers placed`);
  }
});

test('cancellation is offered only before shipping, and says when it refunds', () => {
  for (const status of ['placed', 'confirmed', 'processing']) assert.equal(canAdminCancel(order(status)), true);
  for (const status of ['shipped', 'delivered', 'cancelled', 'returned']) assert.equal(canAdminCancel(order(status)), false);
  assert.equal(cancellationRefunds(order('confirmed', 'razorpay', 'paid')), true);
  assert.equal(cancellationRefunds(order('placed', 'razorpay', 'pending')), false);
  assert.equal(cancellationRefunds(order('confirmed', 'cod', 'pending')), false);
});
