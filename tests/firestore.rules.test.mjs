import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

let testEnvironment;

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: "demo-moniqluxe",
    firestore: {
      rules: await readFile(new URL("../firestore.rules", import.meta.url), "utf8"),
    },
  });
});

after(async () => {
  await testEnvironment?.cleanup();
});

test("clients cannot create or update products and orders", async () => {
  const clientDb = testEnvironment.authenticatedContext("customer-a").firestore();

  await assertFails(
    setDoc(doc(clientDb, "products", "client-product"), {
      title: "Client-created product",
      price: 1,
    }),
  );
  await assertFails(
    setDoc(doc(clientDb, "orders", "client-order"), {
      uid: "customer-a",
      subtotal: 1,
    }),
  );

  await testEnvironment.withSecurityRulesDisabled(async ({ firestore }) => {
    await setDoc(doc(firestore(), "products", "existing-product"), {
      title: "Existing product",
      price: 100,
    });
    await setDoc(doc(firestore(), "orders", "existing-order"), {
      uid: "customer-a",
      subtotal: 100,
    });
  });

  await assertFails(
    updateDoc(doc(clientDb, "products", "existing-product"), { price: 1 }),
  );
  await assertFails(
    updateDoc(doc(clientDb, "orders", "existing-order"), { subtotal: 1 }),
  );
});

test("a customer cannot read another customer's order", async () => {
  await testEnvironment.withSecurityRulesDisabled(async ({ firestore }) => {
    await setDoc(doc(firestore(), "orders", "customer-b-order"), {
      uid: "customer-b",
      subtotal: 500,
    });
    await setDoc(doc(firestore(), "orders", "customer-a-order"), {
      uid: "customer-a",
      subtotal: 300,
    });
  });

  const customerA = testEnvironment.authenticatedContext("customer-a").firestore();
  await assertFails(getDoc(doc(customerA, "orders", "customer-b-order")));
  await assertSucceeds(getDoc(doc(customerA, "orders", "customer-a-order")));
});

test("user profiles cannot set role or admin flags", async () => {
  const customer = testEnvironment.authenticatedContext("customer-a").firestore();
  const profile = doc(customer, "users", "customer-a");

  await assertSucceeds(setDoc(profile, { displayName: "Customer A" }));
  await assertFails(updateDoc(profile, { role: "admin" }));
  await assertFails(updateDoc(profile, { admin: true }));
  await assertFails(updateDoc(profile, { isAdmin: true }));
});
