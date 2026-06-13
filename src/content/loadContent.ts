import rawContent from './graph-content.json';
import { graphContentSchema, type GraphContentOutput } from './schema';

const emptyContent: GraphContentOutput = {
  version: '0.0.0',
  nodes: [],
  edges: []
};

const result = graphContentSchema.safeParse(rawContent);

if (!result.success) {
  console.error('graph-content.json failed schema validation:');
  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join('.')}: ${issue.message}`);
  }
}

export const contentLoadError = result.success ? null : result.error;
export const graphContent = result.success ? result.data : emptyContent;
