#!/usr/bin/env node
/* global __dirname */
// Applies the fixes in patches/ to installed dependencies (postinstall, so
// local installs, CI and EAS builds all get them). One patch per package
// version: patches/<package>+<version>.patch, a plain `git diff` against the
// package root with a short note above it saying why and when to drop it.
//
// Fails loudly instead of skipping: a patch whose package is installed at
// another version stops the install, unless that version is at or past the
// release that carries the fix upstream (then it only logs). After applying,
// marker lines the fix adds must be present.
//
//   node scripts/apply-patches.js
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const PATCHES = [
  {
    // Android SIGSEGV in MountingCoordinator::pullTransaction on a cold
    // launch (ledger TP-FE-20261110-0351), fixed upstream in 4.28.0.
    pkg: "react-native-screens",
    version: "4.26.2",
    fixedIn: "4.28.0",
    file: "react-native-screens+4.26.2.patch",
    markers: [
      [
        "android/src/main/cpp/NativeProxy.cpp",
        "removalListener()->setListener(",
      ],
      [
        "cpp/RNSScreenRemovalListener.cpp",
        "RNSScreenRemovalListener::setListener(",
      ],
    ],
  },
];

function compare(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  }
  return 0;
}

function gitApply(args, patch, cwd) {
  try {
    execFileSync("git", ["apply", ...args, patch], {
      cwd,
      stdio: "pipe",
      // Stop git from finding this project's repository above node_modules:
      // inside a repository, `git apply` resolves the diff's paths from the
      // repository root and can skip files with a zero exit code.
      env: {
        ...process.env,
        GIT_CEILING_DIRECTORIES: path.join(ROOT, "node_modules"),
      },
    });
    return true;
  } catch {
    return false;
  }
}

let failed = false;
for (const p of PATCHES) {
  const dir = path.join(ROOT, "node_modules", p.pkg);
  const manifest = path.join(dir, "package.json");
  if (!fs.existsSync(manifest)) {
    console.log(`[patches] ${p.pkg} is not installed, skipped`);
    continue;
  }
  const installed = JSON.parse(fs.readFileSync(manifest, "utf8")).version;
  if (installed !== p.version) {
    if (compare(installed, p.fixedIn) >= 0) {
      console.log(
        `[patches] ${p.pkg}@${installed} carries the fix (${p.fixedIn}+); remove patches/${p.file}`,
      );
      continue;
    }
    console.error(
      `[patches] ${p.pkg}@${installed} is installed but patches/${p.file} is for ${p.version}: update the patch`,
    );
    failed = true;
    continue;
  }
  const patch = path.join(ROOT, "patches", p.file);
  const hasMarkers = () =>
    p.markers.every(([file, text]) =>
      fs.readFileSync(path.join(dir, file), "utf8").includes(text),
    );
  // Run inside the package with git's repository discovery off, so the
  // diff's paths resolve against the package and nothing is skipped because
  // node_modules sits inside this project's repository.
  const cwd = dir;
  if (hasMarkers() && gitApply(["--reverse", "--check"], patch, cwd)) {
    console.log(`[patches] ${p.pkg}@${p.version} already patched`);
    continue;
  }
  if (!gitApply(["--check"], patch, cwd) || !gitApply([], patch, cwd)) {
    console.error(
      `[patches] ${p.file} does not apply to ${p.pkg}@${p.version}`,
    );
    failed = true;
    continue;
  }
  if (!hasMarkers()) {
    console.error(`[patches] ${p.file} applied but its changes are missing`);
    failed = true;
    continue;
  }
  console.log(`[patches] ${p.pkg}@${p.version} patched (${p.file})`);
}
if (failed) process.exit(1);
