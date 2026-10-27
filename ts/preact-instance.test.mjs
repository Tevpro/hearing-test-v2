import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const modules = ["js/app.js", "js/ui.js", "js/store.js"];
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("all rendered components use the pinned Preact compat import", () => {
  for (const path of modules) {
    assert.match(read(path), /^import React from "https:\/\/esm\.sh\/preact@10\.11\.3\/compat";/m, path);
  }
});

test("every HTM-using module binds to the pinned Preact createElement", () => {
  for (const path of ["js/app.js", "js/ui.js"]) {
    const source = read(path);
    assert.match(source, /^import htm from "https:\/\/esm\.sh\/htm@3\.1\.1";/m, path);
    assert.match(source, /^const html = htm\.bind\(React\.createElement\);/m, path);
    assert.doesNotMatch(source, /htm@[^"\n]+\/preact/, path);
  }
});
