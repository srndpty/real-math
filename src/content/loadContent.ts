import rawContent from './graph-content.json';
import { graphContentSchema } from './schema';

export const graphContent = graphContentSchema.parse(rawContent);
