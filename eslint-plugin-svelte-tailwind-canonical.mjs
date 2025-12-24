import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSyncFn, runAsWorker } from "synckit";
import { __unstable__loadDesignSystem } from "@tailwindcss/node";

const designSystemCache = new Map();

async function canonicalizeInWorker(cssContent, basePath, candidates, options = {}) {
  const cacheKey = basePath;
  let designSystem = designSystemCache.get(cacheKey);
  if (!designSystem) {
    designSystem = await __unstable__loadDesignSystem(cssContent, { base: basePath });
    designSystemCache.set(cacheKey, designSystem);
  }
  return designSystem.canonicalizeCandidates(candidates, options);
}

runAsWorker(canonicalizeInWorker);

function splitClasses(className) {
  return className.trim().split(/\s+/).filter(Boolean);
}

function joinClasses(classes) {
  return classes.join(" ");
}

function extractStaticClassValue(node) {
  if (!node.value || node.value.length !== 1) {
    return null;
  }
  const valueNode = node.value[0];
  if (
    (valueNode.type === "SvelteLiteral" || valueNode.type === "Literal") &&
    typeof valueNode.value === "string"
  ) {
    return valueNode.value;
  }
  return null;
}

const workerPath = fileURLToPath(import.meta.url);
const canonicalizeSync = createSyncFn(workerPath);

function canonicalizeClasses(cssPath, candidates, rootFontSize = 16) {
  if (!fs.existsSync(cssPath)) {
    return null;
  }
  const cssContent = fs.readFileSync(cssPath, "utf-8");
  const basePath = path.dirname(cssPath);
  return canonicalizeSync(cssContent, basePath, candidates, { rem: rootFontSize });
}

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce canonical Tailwind CSS class names in Svelte class attributes",
    },
    fixable: "code",
    messages: {
      nonCanonical: "Class '{{original}}' should be '{{canonical}}'",
      cssNotFound: "Could not load Tailwind CSS file: {{path}}",
    },
    schema: [
      {
        type: "object",
        properties: {
          cssPath: {
            type: "string",
          },
          rootFontSize: {
            type: "number",
          },
        },
        required: ["cssPath"],
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0];
    if (!options || !options.cssPath) {
      context.report({
        node: context.getSourceCode().ast,
        messageId: "cssNotFound",
        data: {
          path: "not specified",
        },
      });
      return {};
    }
    let cssPath;
    if (path.isAbsolute(options.cssPath)) {
      cssPath = path.normalize(options.cssPath);
    } else {
      cssPath = path.normalize(path.resolve(process.cwd(), options.cssPath));
    }
    const rootFontSize = options.rootFontSize ?? 16;
    if (!fs.existsSync(cssPath)) {
      context.report({
        node: context.getSourceCode().ast,
        messageId: "cssNotFound",
        data: {
          path: cssPath,
        },
      });
      return {};
    }
    return {
      SvelteAttribute(node) {
        if (!node.key || node.key.name !== "class") {
          return;
        }
        const staticValue = extractStaticClassValue(node);
        if (staticValue === null) {
          return;
        }
        const classes = splitClasses(staticValue);
        if (classes.length === 0) {
          return;
        }
        const sourceCode = context.getSourceCode();
        const sourceText = sourceCode.text;
        const errors = [];
        let canonicalized;
        try {
          canonicalized = canonicalizeClasses(cssPath, classes, rootFontSize);
        } catch {
          return;
        }
        if (canonicalized === null) {
          context.report({
            node,
            messageId: "cssNotFound",
            data: {
              path: cssPath,
            },
          });
          return;
        }
        classes.forEach((className, index) => {
          const canonical = canonicalized[index];
          if (canonical && canonical !== className) {
            errors.push({
              original: className,
              canonical,
              index,
            });
          }
        });
        if (errors.length === 0 || !Array.isArray(node.range)) {
          return;
        }
        const fullRangeStart = node.range[0];
        const fullRangeEnd = node.range[1];
        const fullText = sourceText.slice(fullRangeStart, fullRangeEnd);
        const doubleQuoteIndex = fullText.indexOf('"');
        const singleQuoteIndex = fullText.indexOf("'");
        let quoteIndex = -1;
        let quoteChar = '"';
        if (doubleQuoteIndex === -1 && singleQuoteIndex === -1) {
          return;
        } else if (doubleQuoteIndex === -1) {
          quoteIndex = singleQuoteIndex;
          quoteChar = "'";
        } else if (singleQuoteIndex === -1 || doubleQuoteIndex < singleQuoteIndex) {
          quoteIndex = doubleQuoteIndex;
          quoteChar = '"';
        } else {
          quoteIndex = singleQuoteIndex;
          quoteChar = "'";
        }
        const lastQuoteIndex = fullText.lastIndexOf(quoteChar);
        if (lastQuoteIndex <= quoteIndex) {
          return;
        }
        const fixedClasses = [...classes];
        errors.forEach((error) => {
          fixedClasses[error.index] = error.canonical;
        });
        const fixedValue = joinClasses(fixedClasses);
        const before = fullText.slice(0, quoteIndex + 1);
        const after = fullText.slice(lastQuoteIndex);
        const fixedAttrText = before + fixedValue + after;
        errors.forEach((error, errorIndex) => {
          context.report({
            node,
            messageId: "nonCanonical",
            data: {
              original: error.original,
              canonical: error.canonical,
            },
            fix:
              errorIndex === 0
                ? (fixer) => fixer.replaceTextRange([fullRangeStart, fullRangeEnd], fixedAttrText)
                : undefined,
          });
        });
      },
    };
  },
};

export default rule;
