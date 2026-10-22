import assert from "node:assert/strict";
import test from "node:test";
import { validateContactMethodInput } from "./validate-contact-method-input";

const validContactFields = {
  type: "threads",
  label: "Thread",
  value: "@aryan.exe",
  url: "https://www.threads.com/@aryan.systems/",
  position: 2,
  active: true,
};

test("accepts supported built-in contact icons and the supplied Threads profile", () => {
  const result = validateContactMethodInput({
    ...validContactFields,
    iconMode: "built_in",
    iconName: "threads",
    iconMediaId: null,
  });

  assert.equal(result.iconMode, "built_in");
  assert.equal(result.iconName, "threads");
  assert.equal(result.iconMediaId, null);
  assert.equal(result.url, validContactFields.url);
});

test("accepts the existing other contact type with its built-in icon", () => {
  const result = validateContactMethodInput({
    type: "other",
    label: "Portfolio",
    value: "Portfolio profile",
    url: "https://portfolio.dev/profile",
    position: 3,
    active: true,
    iconMode: "built_in",
    iconName: "other",
    iconMediaId: null,
  });

  assert.equal(result.type, "other");
  assert.equal(result.iconName, "other");
});

test("preserves the uploaded icon path and requires a media ID", () => {
  const result = validateContactMethodInput({
    ...validContactFields,
    iconMode: "uploaded",
    iconName: null,
    iconMediaId: "b6d0f34e-c6ec-4db2-9b77-8cd5e50fc784",
  });

  assert.equal(result.iconMode, "uploaded");
  assert.equal(result.iconName, null);
  assert.equal(result.iconMediaId, "b6d0f34e-c6ec-4db2-9b77-8cd5e50fc784");
  assert.throws(() => validateContactMethodInput({
    ...validContactFields,
    iconMode: "uploaded",
    iconName: null,
    iconMediaId: null,
  }), { message: "VALIDATION_ERROR" });
});

test("rejects unsupported built-in icons and unrelated Threads domains", () => {
  assert.throws(() => validateContactMethodInput({
    ...validContactFields,
    iconMode: "built_in",
    iconName: "unknown",
    iconMediaId: null,
  }), { message: "VALIDATION_ERROR" });

  assert.throws(() => validateContactMethodInput({
    ...validContactFields,
    url: "https://threads.example/@aryan.systems/",
    iconMode: "built_in",
    iconName: "threads",
    iconMediaId: null,
  }), { message: "INVALID_CONTACT_URL" });
});
