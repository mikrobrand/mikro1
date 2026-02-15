#!/usr/bin/env node

/**
 * Variant Integrity Audit Script
 *
 * Checks:
 * 1. All ProductVariant IDs referenced in CartItem/OrderItem exist
 * 2. No duplicate (productId, color, sizeLabel)
 * 3. All stock >= 0
 * 4. No orphaned CartItems
 * 5. No orphaned OrderItems
 */

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env files
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../.env.local'), override: true });

// Initialize Prisma with pg adapter (same as lib/prisma.ts)
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL is missing');
}

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

let hasErrors = false;

async function main() {
  console.log('🔍 Starting Variant Integrity Audit...\n');

  // Check 1: Orphaned CartItems
  console.log('1️⃣  Checking for orphaned CartItems...');
  const cartItems = await prisma.cartItem.findMany({
    select: { id: true, variantId: true },
  });

  const cartVariantIds = [...new Set(cartItems.map(item => item.variantId))];
  const cartVariants = await prisma.productVariant.findMany({
    where: { id: { in: cartVariantIds } },
    select: { id: true },
  });

  const cartVariantIdSet = new Set(cartVariants.map(v => v.id));
  const orphanedCartItems = cartItems.filter(item => !cartVariantIdSet.has(item.variantId));

  if (orphanedCartItems.length > 0) {
    console.error(`   ❌ FAIL: Found ${orphanedCartItems.length} orphaned CartItems`);
    console.error(`   CartItem IDs: ${orphanedCartItems.map(i => i.id).join(', ')}`);
    hasErrors = true;
  } else {
    console.log('   ✅ PASS: No orphaned CartItems');
  }

  // Check 2: Orphaned OrderItems
  console.log('\n2️⃣  Checking for orphaned OrderItems...');
  const orderItems = await prisma.orderItem.findMany({
    where: {
      variantId: { not: null },
    },
    select: { id: true, variantId: true },
  });

  const orderVariantIds = [...new Set(orderItems.map(item => item.variantId).filter(Boolean))];
  const orderVariants = await prisma.productVariant.findMany({
    where: { id: { in: orderVariantIds } },
    select: { id: true },
  });

  const orderVariantIdSet = new Set(orderVariants.map(v => v.id));
  const orphanedOrderItems = orderItems.filter(item => item.variantId && !orderVariantIdSet.has(item.variantId));

  if (orphanedOrderItems.length > 0) {
    console.error(`   ❌ FAIL: Found ${orphanedOrderItems.length} orphaned OrderItems`);
    console.error(`   OrderItem IDs: ${orphanedOrderItems.map(i => i.id).join(', ')}`);
    hasErrors = true;
  } else {
    console.log('   ✅ PASS: No orphaned OrderItems');
  }

  // Check 3: Duplicate variants
  console.log('\n3️⃣  Checking for duplicate variants (productId, color, sizeLabel)...');
  const allVariants = await prisma.productVariant.findMany({
    select: {
      id: true,
      productId: true,
      color: true,
      sizeLabel: true,
    },
  });

  const variantMap = new Map();
  const duplicates = [];

  for (const variant of allVariants) {
    const key = `${variant.productId}|${variant.color}|${variant.sizeLabel}`;
    if (variantMap.has(key)) {
      duplicates.push({
        key,
        ids: [variantMap.get(key), variant.id],
      });
    } else {
      variantMap.set(key, variant.id);
    }
  }

  if (duplicates.length > 0) {
    console.error(`   ❌ FAIL: Found ${duplicates.length} duplicate variant combinations`);
    duplicates.forEach(dup => {
      console.error(`   Combo: ${dup.key} → IDs: ${dup.ids.join(', ')}`);
    });
    hasErrors = true;
  } else {
    console.log('   ✅ PASS: No duplicate variants');
  }

  // Check 4: Negative stock
  console.log('\n4️⃣  Checking for negative stock...');
  const negativeStockVariants = await prisma.productVariant.findMany({
    where: { stock: { lt: 0 } },
    select: {
      id: true,
      productId: true,
      color: true,
      sizeLabel: true,
      stock: true,
    },
  });

  if (negativeStockVariants.length > 0) {
    console.error(`   ❌ FAIL: Found ${negativeStockVariants.length} variants with negative stock`);
    negativeStockVariants.forEach(v => {
      console.error(`   Variant ${v.id}: ${v.color} ${v.sizeLabel} → stock: ${v.stock}`);
    });
    hasErrors = true;
  } else {
    console.log('   ✅ PASS: All variants have stock >= 0');
  }

  // Check 5: Variant uniqueness constraint
  console.log('\n5️⃣  Verifying @@unique([productId, color, sizeLabel]) constraint...');
  const variantCombos = new Map();
  let constraintViolations = 0;

  for (const variant of allVariants) {
    const key = `${variant.productId}:${variant.color.toUpperCase()}:${variant.sizeLabel.toUpperCase()}`;
    if (variantCombos.has(key)) {
      console.error(`   ❌ Duplicate: ${key}`);
      console.error(`      IDs: ${variantCombos.get(key)} and ${variant.id}`);
      constraintViolations++;
    } else {
      variantCombos.set(key, variant.id);
    }
  }

  if (constraintViolations > 0) {
    console.error(`   ❌ FAIL: Found ${constraintViolations} unique constraint violations`);
    hasErrors = true;
  } else {
    console.log('   ✅ PASS: Unique constraint satisfied');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  if (hasErrors) {
    console.error('❌ AUDIT FAILED: Integrity violations detected');
    process.exit(1);
  } else {
    console.log('✅ AUDIT PASSED: All integrity checks passed');
    process.exit(0);
  }
}

main()
  .catch((error) => {
    console.error('💥 Audit script error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
