#!/usr/bin/env node

/**
 * UI Component Usage Check
 * 
 * Scans all .tsx files in src/ (excluding src/components/ui/) for native HTML
 * elements. If a native element is used, it should either be replaced by a
 * reusable UI component, or marked with a 'ui-native-ok' / 'ui-native-fallback'
 * comment if it's required as a fallback to match the UI/Figma design.
 * 
 * Run: node scripts/check-component-usage.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const SRC_DIR = join(import.meta.dirname, "..", "src");

// Directories to SKIP (these are the component definitions themselves)
const SKIP_DIRS = [
  "src/components/ui",
];

// Patterns to detect native elements that should use UI components instead.
// Each rule has a regex, a human-readable description, and the replacement component.
const RULES = [
  {
    // Match <button but NOT <Button (capital B)
    pattern: /<button[\s>]/g,
    name: "native <button>",
    replacement: "<Button> from @/components/ui/button",
  },
  {
    // Match <input but NOT <Input (capital I), and NOT inside a className string
    pattern: /<input[\s>]/g,
    name: "native <input>",
    replacement: "<Input>, <Checkbox>, or <RadioGroupItem> from @/components/ui/*",
  },
  {
    // Match <textarea but NOT <Textarea
    pattern: /<textarea[\s>]/g,
    name: "native <textarea>",
    replacement: "<Textarea> from @/components/ui/textarea",
  },
  {
    // Match <select but NOT <Select
    pattern: /<select[\s>]/g,
    name: "native <select>",
    replacement: "<Select> from @/components/ui/select",
  },
  {
    // Match <label but NOT <Label
    pattern: /<label[\s>]/g,
    name: "native <label>",
    replacement: "<Label> from @/components/ui/label",
  },
  {
    // Match <dialog but NOT <Dialog
    pattern: /<dialog[\s>]/g,
    name: "native <dialog>",
    replacement: "<Dialog> from @/components/ui/dialog",
  },
  {
    // Match standalone <hr with optional self-close
    pattern: /<hr[\s/>]/g,
    name: "native <hr>",
    replacement: "<Separator> from @/components/ui/separator",
  },
];

/** Recursively get all .tsx files in a directory */
function getTsxFiles(dir, results = []) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const rel = relative(SRC_DIR, fullPath);

    // Skip the ui components directory
    if (SKIP_DIRS.some((skip) => rel.startsWith(skip.replace("src/", "")))) {
      continue;
    }

    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      getTsxFiles(fullPath, results);
    } else if (entry.endsWith(".tsx")) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Check a single file for violations */
function checkFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const violations = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const lineNum = lineIdx + 1;

    // Skip lines that are comments
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
      continue;
    }

    // Skip if line or previous line contains an ignore flag (e.g., ui-native-ok or ui-native-fallback)
    if (line.includes("ui-native-ok") || line.includes("ui-native-fallback")) {
      continue;
    }
    if (lineIdx > 0 && (lines[lineIdx - 1].includes("ui-native-ok") || lines[lineIdx - 1].includes("ui-native-fallback"))) {
      continue;
    }

    for (const rule of RULES) {
      // Reset regex lastIndex
      rule.pattern.lastIndex = 0;
      let match;
      while ((match = rule.pattern.exec(line)) !== null) {
        // Check this isn't inside a string literal (rough heuristic)
        const before = line.substring(0, match.index);
        const singleQuotes = (before.match(/'/g) || []).length;
        const doubleQuotes = (before.match(/"/g) || []).length;
        const backticks = (before.match(/`/g) || []).length;
        // If odd number of quotes, we're likely inside a string — skip
        if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0 || backticks % 2 !== 0) {
          continue;
        }

        violations.push({
          line: lineNum,
          column: match.index + 1,
          rule: rule.name,
          replacement: rule.replacement,
          context: line.trim(),
        });
      }
    }
  }

  return violations;
}

// --- Main ---
console.log("🔍 UI Component Usage Check");
console.log("===========================");
console.log(`Scanning: ${SRC_DIR}`);
console.log(`Skipping: ${SKIP_DIRS.join(", ")}\n`);

const files = getTsxFiles(SRC_DIR);
let totalViolations = 0;
let filesWithViolations = 0;

for (const file of files) {
  const rel = relative(join(SRC_DIR, ".."), file);
  const violations = checkFile(file);

  if (violations.length > 0) {
    filesWithViolations++;
    totalViolations += violations.length;

    console.log(`\n❌ ${rel}`);
    for (const v of violations) {
      console.log(`   L${v.line}:${v.column}  ${v.rule}`);
      console.log(`   → Use: ${v.replacement}`);
      console.log(`   │ ${v.context}`);
    }
  }
}

console.log("\n========================");
console.log(`Files scanned: ${files.length}`);
console.log(`Files with violations: ${filesWithViolations}`);
console.log(`Total violations: ${totalViolations}`);

if (totalViolations > 0) {
  console.log("\n⚠️  FAILED — Fix the violations above by replacing native elements with UI components.");
  console.log("   (If a native element is required to match the UI/Figma design, append '// ui-native-ok' or '// ui-native-fallback' to bypass this check.)");
  process.exit(1);
} else {
  console.log("\n✅ PASSED — No native element violations found.");
  process.exit(0);
}
