import { type ASTVisitor, GraphQLError, Kind, type ValidationContext } from 'graphql';

/**
 * Creates a GraphQL validation rule that rejects queries exceeding
 * the specified nesting depth.
 *
 * This is a lightweight alternative to `graphql-depth-limit` with zero
 * external dependencies — it uses the standard `graphql` validation API.
 *
 * Introspection fields (__schema, __type) are excluded from the depth count
 * so that schema tooling continues to work regardless of the limit.
 *
 * @param maxDepth - Maximum allowed selection-set nesting depth.
 */
export function createDepthLimitRule(maxDepth: number) {
  return (context: ValidationContext): ASTVisitor => {
    return {
      Document: {
        enter(node) {
          for (const definition of node.definitions) {
            if (
              definition.kind === Kind.OPERATION_DEFINITION ||
              definition.kind === Kind.FRAGMENT_DEFINITION
            ) {
              const depth = measureDepth(definition.selectionSet, context, 0);
              if (depth > maxDepth) {
                context.reportError(
                  new GraphQLError(
                    `Query depth of ${depth} exceeds the maximum allowed depth of ${maxDepth}.`,
                    { nodes: [definition] },
                  ),
                );
              }
            }
          }
        },
      },
    };
  };
}

/**
 * Recursively measures the deepest nesting level of a selection set.
 * Fragment spreads are resolved via the validation context.
 */
function measureDepth(
  selectionSet:
    | {
        readonly selections: ReadonlyArray<{
          readonly kind: string;
          readonly name?: { readonly value: string };
          readonly selectionSet?: unknown;
        }>;
      }
    | undefined,
  context: ValidationContext,
  currentDepth: number,
): number {
  if (!selectionSet) {
    return currentDepth;
  }

  let maxFound = currentDepth;

  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      // Skip introspection meta-fields
      if (selection.name?.value.startsWith('__')) {
        continue;
      }

      const childDepth = measureDepth(
        selection.selectionSet as typeof selectionSet | undefined,
        context,
        currentDepth + 1,
      );
      if (childDepth > maxFound) {
        maxFound = childDepth;
      }
    } else if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const fragmentName = selection.name?.value;
      if (fragmentName) {
        const fragment = context.getFragment(fragmentName);
        if (fragment) {
          const childDepth = measureDepth(
            fragment.selectionSet as typeof selectionSet,
            context,
            currentDepth,
          );
          if (childDepth > maxFound) {
            maxFound = childDepth;
          }
        }
      }
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      const childDepth = measureDepth(
        (selection as { selectionSet?: typeof selectionSet }).selectionSet,
        context,
        currentDepth,
      );
      if (childDepth > maxFound) {
        maxFound = childDepth;
      }
    }
  }

  return maxFound;
}
