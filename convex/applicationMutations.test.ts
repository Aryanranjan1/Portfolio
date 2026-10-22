/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert/strict";
import test from "node:test";
import { run } from "./applicationMutations";

type Row = Record<string, any> & { _id: string };

function fakeContext(seed: Record<string, Row[]> = {}) {
  const tables: Record<string, Row[]> = Object.fromEntries(
    Object.entries(seed).map(([table, rows]) => [table, [...rows]]),
  );
  let nextId = 0;

  const db = {
    query(table: string) {
      const rows = () => tables[table] ?? (tables[table] = []);
      return {
        withIndex(_name: string, range?: (query: any) => unknown) {
          const filters: Record<string, unknown> = {};
          const query = {
            eq(field: string, value: unknown) {
              filters[field] = value;
              return query;
            },
            lt(field: string, value: unknown) {
              filters[field + ":lt"] = value;
              return query;
            },
          };
          range?.(query);
          const matches = () => rows().filter((row) =>
            Object.entries(filters).every(([field, value]) =>
              field.endsWith(":lt")
                ? row[field.slice(0, -3)] < (value as number)
                : row[field] === value,
            ),
          );
          return {
            unique: async () => {
              const found = matches();
              if (found.length > 1) throw new Error("Expected unique result");
              return found[0] ?? null;
            },
            take: async (count: number) => matches().slice(0, count),
            first: async () => matches()[0] ?? null,
            collect: async () => matches(),
          };
        },
        collect: async () => rows(),
      };
    },
    async insert(table: string, value: Record<string, unknown>) {
      const row = { ...value, _id: "test-" + ++nextId } as Row;
      (tables[table] ??= []).push(row);
      return row._id;
    },
    async delete(id: string) {
      for (const rows of Object.values(tables)) {
        const index = rows.findIndex((row) => row._id === id);
        if (index >= 0) {
          rows.splice(index, 1);
          return;
        }
      }
    },
    async patch(id: string, patch: Record<string, unknown>) {
      const row = Object.values(tables).flat().find((item) => item._id === id);
      if (!row) throw new Error("Record not found");
      Object.assign(row, patch);
    },
  };

  return { db, tables };
}

async function withSecret<T>(fn: () => Promise<T>) {
  const previous = process.env.CONVEX_SERVER_SECRET;
  process.env.CONVEX_SERVER_SECRET = "isolated-test-secret";
  try {
    return await fn();
  } finally {
    if (previous === undefined) delete process.env.CONVEX_SERVER_SECRET;
    else process.env.CONVEX_SERVER_SECRET = previous;
  }
}

function invokeRegisteredMutation(
  ctx: ReturnType<typeof fakeContext>,
  args: { secret: string; operation: string; input: Record<string, unknown> },
) {
  const registered = run as unknown as {
    _handler: (context: unknown, value: unknown) => Promise<unknown>;
  };
  return registered._handler(ctx, args) as Promise<Record<string, unknown>>;
}

test("registered dispatcher route permanently deletes the requested contact submission", async () => {
  await withSecret(async () => {
    const id = "01a106be-c5e1-72ee-9acc-7521181bdb7a";
    const ctx = fakeContext({
      contactSubmission: [{ _id: "submission-db-id", legacyId: id, message: "private test content" }],
    });

    const result = await invokeRegisteredMutation(ctx, {
      secret: "isolated-test-secret",
      operation: "deleteContactSubmission",
      input: { id },
    });

    assert.deepEqual(result, { id });
    assert.deepEqual(ctx.tables.contactSubmission, []);
  });
});

test("registered deletion route reports missing records without changing the table", async () => {
  await withSecret(async () => {
    const ctx = fakeContext({ contactSubmission: [] });
    await assert.rejects(
      invokeRegisteredMutation(ctx, {
        secret: "isolated-test-secret",
        operation: "deleteContactSubmission",
        input: { id: "already-deleted" },
      }),
      /NOT_FOUND/,
    );
    assert.deepEqual(ctx.tables.contactSubmission, []);
  });
});

test("registered dispatcher route creates a contact method of type other with the built-in icon", async () => {
  await withSecret(async () => {
    const ctx = fakeContext();
    const id = "7f58f310-0b12-4a98-9f66-cf66ab9c12e1";
    const data = {
      type: "other",
      label: "Other",
      value: "profile",
      url: "https://portfolio.example.net/profile",
      position: 0,
      active: false,
      iconMode: "built_in",
      iconName: "other",
      iconMediaId: null,
    };

    const result = await invokeRegisteredMutation(ctx, {
      secret: "isolated-test-secret",
      operation: "simpleCreate",
      input: { table: "contactMethod", legacyId: id, data },
    });

    assert.equal(result.id, id);
    assert.deepEqual(ctx.tables.contactMethod, [{ ...data, legacyId: id, _id: "test-1" }]);
  });
});

test("contact-method dispatcher preserves the uploaded-icon path and rejects invalid variants", async () => {
  await withSecret(async () => {
    const mediaId = "aeb35b01-1f5c-4d2c-bd69-294305812f42";
    const ctx = fakeContext({
      media: [{ _id: "media-db-id", legacyId: mediaId, deletionPending: false, mimeType: "image/png" }],
    });
    const data = {
      type: "threads",
      label: "Threads",
      value: "@profile",
      url: "https://www.threads.com/@profile/",
      position: 0,
      active: true,
      iconMode: "uploaded",
      iconName: null,
      iconMediaId: mediaId,
    };

    const result = await invokeRegisteredMutation(ctx, {
      secret: "isolated-test-secret",
      operation: "simpleCreate",
      input: { table: "contactMethod", legacyId: "contact-method-1", data },
    });
    assert.equal(result.id, "contact-method-1");
    assert.equal(ctx.tables.contactMethod[0].iconMediaId, mediaId);

    await assert.rejects(
      invokeRegisteredMutation(ctx, {
        secret: "isolated-test-secret",
        operation: "simpleCreate",
        input: {
          table: "contactMethod",
          legacyId: "contact-method-2",
          data: { ...data, position: 1, iconMode: "built_in", iconName: "not-supported", iconMediaId: null },
        },
      }),
      /VALIDATION_ERROR/,
    );
    await assert.rejects(
      invokeRegisteredMutation(ctx, {
        secret: "isolated-test-secret",
        operation: "simpleCreate",
        input: {
          table: "contactMethod",
          legacyId: "contact-method-3",
          data: { ...data, position: 2, type: "unregistered-provider", iconName: "other" },
        },
      }),
      /VALIDATION_ERROR/,
    );
  });
});

test("dispatcher authorization remains required for deletion and contact-method creation", async () => {
  const ctx = fakeContext();
  await assert.rejects(
    invokeRegisteredMutation(ctx, {
      secret: "wrong-secret",
      operation: "deleteContactSubmission",
      input: { id: "missing" },
    }),
    /UNAUTHORIZED/,
  );
  assert.deepEqual(ctx.tables, {});
});
