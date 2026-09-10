import type { ReactElement } from "react";
import { createElement } from "react";

import type {
  TraitEntry,
  TraitInput,
  TraitOutput,
  TraitProps,
} from "./core.ts";
import { executeTraits, resolveTraits } from "./core.ts";

type IntrinsicTag = keyof React.JSX.IntrinsicElements;
type IntrinsicProps<Tag extends IntrinsicTag> =
  React.JSX.IntrinsicElements[Tag];
type NonEmptyTraitEntries = readonly [TraitEntry, ...TraitEntry[]];
type TraitEntries = readonly [] | NonEmptyTraitEntries;
type StringKey<Value> = Extract<keyof Value, string>;
type EntryTrait<Entry> = Entry extends TraitEntry
  ? Entry[StringKey<Entry>]
  : never;

type NamespacedTraitProps<Namespace extends string, Props> = {
  [
    Key in keyof Props as Key extends string ? `${Namespace}:${Key}` : never
  ]: Props[Key];
};

type PropsForEntry<Entry> = Entry extends TraitEntry
  ? {
      [Namespace in StringKey<Entry>]: NamespacedTraitProps<
        Namespace,
        TraitProps<Entry[Namespace]>
      >;
    }[StringKey<Entry>]
  : never;

type UnionToIntersection<Union> = (
  Union extends unknown ? (value: Union) => void : never
) extends (value: infer Intersection) => void
  ? Intersection
  : never;

type PipelineTraitProps<Entries extends TraitEntries> =
  Entries extends readonly []
    ? object
    : UnionToIntersection<PropsForEntry<Entries[number]>>;

type IsUnion<Value, Whole = Value> = Value extends unknown
  ? [Whole] extends [Value]
    ? false
    : true
  : never;

type ValidateEntry<Entry> = [keyof Entry] extends [never]
  ? never
  : [keyof Entry] extends [string]
    ? string extends keyof Entry
      ? never
      : true extends IsUnion<keyof Entry>
        ? never
        : unknown
    : never;

type ValidateEntries<Entries extends readonly unknown[]> =
  Entries extends readonly [infer First, ...infer Rest]
    ? ValidateEntry<First> & ValidateEntries<Rest>
    : unknown;

type ValidateUniqueNamespaces<
  Entries extends readonly unknown[],
  Seen extends PropertyKey = never,
> = Entries extends readonly [infer First, ...infer Rest]
  ? Extract<keyof First, Seen> extends never
    ? ValidateUniqueNamespaces<Rest, Seen | keyof First>
    : never
  : unknown;

type StrictPropSubset<From, To> = From extends object
  ? Exclude<keyof From, keyof To | `data-${string}`> extends never
    ? [From] extends [To]
      ? true
      : false
    : false
  : false;

type ValidateChain<
  Entries extends TraitEntries,
  FinalProps,
> = Entries extends readonly [infer Current, infer Next, ...infer Rest]
  ? [TraitOutput<EntryTrait<Current>>] extends [TraitInput<EntryTrait<Next>>]
    ? ValidateChain<
        readonly [Extract<Next, TraitEntry>, ...Extract<Rest, TraitEntry[]>],
        FinalProps
      >
    : never
  : Entries extends readonly [infer Last]
    ? StrictPropSubset<TraitOutput<EntryTrait<Last>>, FinalProps> extends true
      ? unknown
      : never
    : unknown;

type InitialInput<Entries extends TraitEntries> = Entries extends readonly [
  infer First,
  ...unknown[],
]
  ? TraitInput<EntryTrait<First>>
  : unknown;

type TraitElementProps<
  Tag extends IntrinsicTag,
  Entries extends TraitEntries,
> = {
  of: Entries &
    ValidateEntries<Entries> &
    ValidateUniqueNamespaces<Entries> &
    ValidateChain<Entries, IntrinsicProps<Tag>>;
} & PipelineTraitProps<Entries> &
  Omit<
    IntrinsicProps<Tag> & InitialInput<Entries>,
    "of" | keyof PipelineTraitProps<Entries>
  >;

type TraitElement<Tag extends IntrinsicTag> = <
  const Entries extends TraitEntries,
>(
  props: TraitElementProps<Tag, Entries>,
) => ReactElement;

type TraitIntrinsics = {
  [Tag in IntrinsicTag]: TraitElement<Tag>;
};

type RuntimeProps = {
  of: readonly TraitEntry[];
  [key: string]: unknown;
};

const componentCache = new Map<IntrinsicTag, TraitElement<IntrinsicTag>>();

function createTraitElement(tag: IntrinsicTag): TraitElement<IntrinsicTag> {
  function TraitComponent(props: RuntimeProps): ReactElement {
    const resolvedTraits = resolveTraits(props.of);
    const traitPropsByNamespace = new Map<
      string,
      Readonly<Record<string, unknown>>
    >();

    for (const [namespace] of resolvedTraits) {
      traitPropsByNamespace.set(namespace, {});
    }

    const initialProps: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(props)) {
      if (key === "of") continue;

      const separatorIndex = key.indexOf(":");

      if (separatorIndex === -1) {
        initialProps[key] = value;
        continue;
      }

      const namespace = key.slice(0, separatorIndex);
      const traitPropName = key.slice(separatorIndex + 1);
      const traitProps = traitPropsByNamespace.get(namespace);

      if (!traitProps) {
        throw new TypeError(
          `Namespaced prop "${key}" has no matching trait in the pipeline.`,
        );
      }

      if (!traitPropName) {
        throw new TypeError(`Namespaced prop "${key}" has no property name.`);
      }

      (traitProps as Record<string, unknown>)[traitPropName] = value;
    }

    const finalProps = executeTraits(
      initialProps,
      resolvedTraits,
      traitPropsByNamespace,
    );

    if (
      typeof finalProps !== "object" ||
      finalProps === null ||
      Array.isArray(finalProps)
    ) {
      throw new TypeError(
        `The final trait value for "${tag}" must be an object of element props.`,
      );
    }

    return createElement(tag, finalProps);
  }

  TraitComponent.displayName = `traits.${tag}`;
  return TraitComponent as TraitElement<IntrinsicTag>;
}

/**
 * Intrinsic React elements that execute an ordered trait pipeline.
 *
 * @public
 */
export const traits = new Proxy({} as TraitIntrinsics, {
  get(_target, property) {
    if (typeof property !== "string") {
      return undefined;
    }

    const tag = property as IntrinsicTag;

    const cached = componentCache.get(tag);
    if (cached) {
      return cached;
    }

    const component = createTraitElement(tag);
    componentCache.set(tag, component);
    return component;
  },
});
