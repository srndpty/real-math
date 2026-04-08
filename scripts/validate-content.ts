import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { graphContentSchema } from '../src/content/schema';

const path = resolve(process.cwd(), 'src/content/graph-content.json');
const raw = readFileSync(path, 'utf-8');
const parsedJson: unknown = JSON.parse(raw);
const result = graphContentSchema.safeParse(parsedJson);

if (!result.success) {
  console.error('Content validation failed.');
  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join('.')} : ${issue.message}`);
  }
  process.exit(1);
}

console.log(
  `Content validation passed. nodes=${result.data.nodes.length}, edges=${result.data.edges.length}`
);
