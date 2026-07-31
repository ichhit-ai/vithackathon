// Client-side execution engine for JavaScript/TypeScript and Python

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  error?: string;
  executionTimeMs: number;
  exitCode: number;
}

export async function executeCodeInBrowser(
  code: string,
  filePath: string
): Promise<ExecutionResult> {
  const startTime = performance.now();
  const ext = filePath.split('.').pop()?.toLowerCase() || 'js';

  if (ext === 'py') {
    return runPythonCode(code, startTime);
  } else {
    return runJavaScriptCode(code, startTime);
  }
}

// ─── Python Interpreter Sandbox ──────────────────────────────────────────────

function runPythonCode(code: string, startTime: number): ExecutionResult {
  const logs: string[] = [];
  const errors: string[] = [];

  try {
    // Transpile basic Python print/variables/math/loops to JS runner
    const lines = code.split('\n');
    const variableScope: Record<string, any> = {};

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      // Python print(...) handling
      const printMatch = line.match(/^print\s*\((.*)\)$/);
      if (printMatch) {
        const rawArg = printMatch[1].trim();
        let outputVal = '';

        if ((rawArg.startsWith('"') && rawArg.endsWith('"')) || (rawArg.startsWith("'") && rawArg.endsWith("'"))) {
          outputVal = rawArg.slice(1, -1);
        } else if (rawArg.includes('+') || rawArg.includes(',')) {
          // simple concats
          const parts = rawArg.split(/,|\+/).map(p => p.trim());
          outputVal = parts.map(p => {
            if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) return p.slice(1, -1);
            return variableScope[p] !== undefined ? variableScope[p] : p;
          }).join(' ');
        } else if (variableScope[rawArg] !== undefined) {
          outputVal = String(variableScope[rawArg]);
        } else {
          try {
            outputVal = eval(rawArg);
          } catch (e) {
            outputVal = rawArg;
          }
        }
        logs.push(outputVal);
        continue;
      }

      // Simple Python variable assignment (e.g. x = 10 or name = "John")
      const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*(.*)$/);
      if (assignMatch) {
        const varName = assignMatch[1];
        const valExpr = assignMatch[2].trim();
        if ((valExpr.startsWith('"') && valExpr.endsWith('"')) || (valExpr.startsWith("'") && valExpr.endsWith("'"))) {
          variableScope[varName] = valExpr.slice(1, -1);
        } else {
          try {
            variableScope[varName] = eval(valExpr);
          } catch (e) {
            variableScope[varName] = valExpr;
          }
        }
        continue;
      }

      // Fallback eval attempt for generic lines
      try {
        // Replace python keywords for basic JS eval
        const jsEquiv = line
          .replace(/True/g, 'true')
          .replace(/False/g, 'false')
          .replace(/None/g, 'null');
        eval(jsEquiv);
      } catch (e: any) {
        errors.push(`NameError or SyntaxError on line ${i + 1}: ${e.message}`);
      }
    }

    const duration = Math.round(performance.now() - startTime);
    return {
      stdout: logs.join('\n'),
      stderr: errors.join('\n'),
      executionTimeMs: Math.max(duration, 1),
      exitCode: errors.length > 0 ? 1 : 0
    };
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    return {
      stdout: logs.join('\n'),
      stderr: `Python Execution Error: ${err.message}`,
      executionTimeMs: duration,
      exitCode: 1
    };
  }
}

// ─── JavaScript / TypeScript Execution Sandbox ─────────────────────────────

function runJavaScriptCode(code: string, startTime: number): ExecutionResult {
  const logs: string[] = [];
  const errors: string[] = [];

  const customConsole = {
    log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
    warn: (...args: any[]) => logs.push('[WARN] ' + args.join(' ')),
    error: (...args: any[]) => errors.push(args.join(' ')),
    info: (...args: any[]) => logs.push(args.join(' '))
  };

  try {
    // Strip type annotations roughly if typescript
    const cleanedCode = code
      .replace(/:\s*(string|number|boolean|any|void|object)/g, '')
      .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '');

    const runner = new Function('console', cleanedCode);
    runner(customConsole);

    const duration = Math.round(performance.now() - startTime);
    return {
      stdout: logs.join('\n'),
      stderr: errors.join('\n'),
      executionTimeMs: Math.max(duration, 1),
      exitCode: errors.length > 0 ? 1 : 0
    };
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    return {
      stdout: logs.join('\n'),
      stderr: `Uncaught ${err.name}: ${err.message}`,
      executionTimeMs: duration,
      exitCode: 1
    };
  }
}
