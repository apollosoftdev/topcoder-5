/**
 * Swagger/OpenAPI configuration for Member Profile Processor API
 */

import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// Load OpenAPI specification from YAML file at project root
const openapiDir = path.join(process.cwd(), 'openapi');
const openapiPath = path.join(openapiDir, 'openapi.yml');

if (!fs.existsSync(openapiPath)) {
  throw new Error(`Could not find openapi.yml file at ${openapiPath}`);
}

const openapiContent = fs.readFileSync(openapiPath, 'utf8');
const spec = yaml.load(openapiContent) as Record<string, unknown>;

/**
 * Resolve $ref references to external schema files
 */
function resolveRefs(obj: unknown, baseDir: string): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveRefs(item, baseDir));
  }

  const record = obj as Record<string, unknown>;

  // Check if this object has a $ref to an external file
  if ('$ref' in record && typeof record['$ref'] === 'string') {
    const ref = record['$ref'];
    // Only resolve local file references (starting with ./)
    if (ref.startsWith('./')) {
      const refPath = path.join(baseDir, ref);
      if (fs.existsSync(refPath)) {
        const refContent = fs.readFileSync(refPath, 'utf8');
        return yaml.load(refContent);
      }
    }
  }

  // Recursively resolve refs in nested objects
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    result[key] = resolveRefs(value, baseDir);
  }
  return result;
}

// Resolve all external $ref references
export const specs = resolveRefs(spec, openapiDir) as Record<string, unknown>;

export { swaggerUi };
