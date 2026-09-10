type AnyTrait = (input: any, props: any) => any;

type TraitInput<Value extends AnyTrait> = Parameters<Value>[0];
type TraitProps<Value extends AnyTrait> = Parameters<Value>[1];
type TraitOutput<Value extends AnyTrait> = ReturnType<Value>;

type TraitEntry = Readonly<Record<string, AnyTrait>>;
type ResolvedTrait = readonly [namespace: string, trait: AnyTrait];

function resolveTraits(
  entries: readonly TraitEntry[],
): readonly ResolvedTrait[] {
  if (!Array.isArray(entries)) {
    throw new TypeError("The trait pipeline must be an array.");
  }

  const namespaces = new Set<string>();

  return entries.map((entry, index) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      throw new TypeError(
        `Trait entry at index ${index} must be a single-property object.`,
      );
    }

    const keys = Object.keys(entry);
    const namespace = keys[0];
    if (typeof namespace !== "string" || keys.length > 1) {
      throw new TypeError(
        `Trait entry at index ${index} must contain exactly one trait.`,
      );
    }

    const trait = entry[namespace];

    if (typeof trait !== "function") {
      throw new TypeError(
        `Trait entry "${namespace}" at index ${index} must be a function.`,
      );
    }

    if (namespaces.has(namespace)) {
      throw new TypeError(`Duplicate trait namespace "${namespace}".`);
    }

    namespaces.add(namespace);
    return [namespace, trait] as const;
  });
}

const executeTraits = (
  initialValue: unknown,
  resolvedTraits: readonly ResolvedTrait[],
  traitPropsByNamespace: ReadonlyMap<string, Readonly<Record<string, unknown>>>,
): unknown =>
  resolvedTraits.reduce(
    (value, [namespace, trait]) =>
      trait(value, traitPropsByNamespace.get(namespace) ?? {}),
    initialValue,
  );

export {
  executeTraits,
  resolveTraits,
  type AnyTrait,
  type TraitEntry,
  type TraitInput,
  type TraitOutput,
  type TraitProps,
};
