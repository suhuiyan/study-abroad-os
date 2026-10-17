import assert from "node:assert/strict";
import test from "node:test";
import { catalog } from "./catalog";
import { buildSourceRegistry } from "./source-registry";
import { officialLinksForProgram } from "./official-links";
import { fetchSource, SourceFetchError } from "./source-fetch";

test("source registry includes evidence and scholarships without duplicate URLs", () => {
  const links = officialLinksForProgram(catalog[1]);
  assert.ok(
    links.some(
      (link) => link.url === catalog[1].facts!.tuition.evidence[0].url,
    ),
  );
  const registry = buildSourceRegistry([catalog[0], catalog[0], catalog[1]]);
  assert.equal(
    new Set(registry.map((source) => source.url)).size,
    registry.length,
  );
  assert.ok(
    registry.every(
      (source) =>
        new Set(source.universityIds).size === source.universityIds.length,
    ),
  );
});
test("source fetching rejects local and non-official targets before networking", async () => {
  for (const url of [
    "http://127.0.0.1",
    "https://example.com",
    "https://test.edu.cn.evil.com",
  ])
    await assert.rejects(fetchSource(url), SourceFetchError);
});
