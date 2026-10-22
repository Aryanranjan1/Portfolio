import assert from "node:assert/strict";
import test from "node:test";
import { getSafeErrorDiagnostics } from "./error-diagnostics";

test("server diagnostics retain error details while redacting submitted values", () => {
  const error = new Error("Could not save https://www.threads.com/@aryan.systems for Private Label (id b6d0f34e-c6ec-4db2-9b77-8cd5e50fc784)");
  const diagnostic = getSafeErrorDiagnostics(error, ["Private Label", "@aryan.systems"]);

  assert.match(diagnostic.errorMessage, /Could not save/);
  assert.doesNotMatch(JSON.stringify(diagnostic), /aryan\.systems|Private Label|b6d0f34e/);
  assert.ok(diagnostic.stackTrace?.includes("error-diagnostics.test.ts"));
});

test("server diagnostics handle thrown non-Error values", () => {
  assert.deepEqual(getSafeErrorDiagnostics("secret"), {
    errorName: "UnknownError",
    errorMessage: "Non-Error exception",
  });
});

test("server diagnostics retain a redacted wrapped cause", () => {
  const wrapped = new Error("CONFLICT", {
    cause: new Error("Conflict for https://private.example/path and id 01a106be-c5e1-72ee-9acc-7521181bdb7a"),
  });
  const diagnostic = getSafeErrorDiagnostics(wrapped);
  assert.equal(diagnostic.errorMessage, "CONFLICT");
  assert.match(diagnostic.cause?.errorMessage ?? "", /Conflict for/);
  assert.doesNotMatch(JSON.stringify(diagnostic), /private\.example|01a106be/);
});
