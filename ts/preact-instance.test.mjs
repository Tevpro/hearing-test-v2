import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const modules = ["js/app.js", "js/ui.js", "js/store.js"];
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("all modules use the same pinned native Preact module, not compat", () => {
  for (const path of modules) {
    const source = read(path);
    assert.match(source, /^import \* as React from "https:\/\/esm\.sh\/preact@10\.11\.3";/m, path);
    assert.doesNotMatch(source, /preact@[^"\n]+\/compat/, path);
  }
});

test("HTM uses native Preact h in app and UI", () => {
  for (const path of ["js/app.js", "js/ui.js"]) {
    const source = read(path);
    assert.match(source, /^import htm from "https:\/\/esm\.sh\/htm@3\.1\.1";/m, path);
    assert.match(source, /^const html = htm\.bind\(React\.h\);/m, path);
    assert.doesNotMatch(source, /htm@[^"\n]+\/preact/, path);
  }
});

test("shared store and UI use native hooks and context", () => {
  for (const path of ["js/store.js", "js/ui.js"]) {
    assert.match(read(path), /^import \* as Hooks from "https:\/\/esm\.sh\/preact@10\.11\.3\/hooks";/m, path);
    assert.doesNotMatch(read(path), /React\.use(?:State|Reducer|Context|Ref|Effect)\b/, path);
  }
  assert.match(read("js/store.js"), /React\.createContext\(/);
  assert.match(read("js/store.js"), /React\.h\(Context\.Provider,/);
  assert.match(read("js/app.js"), /React\.render\(html`/);
});
