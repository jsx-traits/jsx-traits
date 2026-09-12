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
type IntrinsicPropKeys<Tag extends IntrinsicTag = IntrinsicTag> =
  Tag extends IntrinsicTag ? keyof IntrinsicProps<Tag> : never;
type TraitEntries = readonly [] | readonly [TraitEntry, ...TraitEntry[]];
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

type StrictPropSubset<From, To> = From extends object
  ? "key" extends keyof From
    ? false
    : Exclude<keyof From, keyof To | `data-${string}`> extends never
      ? [From] extends [To]
        ? true
        : false
      : false
  : false;

type RequiredKeys<Value> = Value extends object
  ? {
      [Key in keyof Value]-?: object extends Pick<Value, Key> ? never : Key;
    }[keyof Value]
  : never;

type InvalidInitialInputKeys<From, To> = Extract<
  Exclude<keyof From, keyof To | `data-${string}`>,
  IntrinsicPropKeys | RequiredKeys<From>
>;

type ValidInitialInput<From, To> = From extends object
  ? "key" extends keyof From
    ? false
    : InvalidInitialInputKeys<From, To> extends never
      ? [Pick<From, Extract<keyof From, keyof To>>] extends [
          Pick<To, Extract<keyof From, keyof To>>,
        ]
        ? true
        : false
      : false
  : false;

declare const traitValidationError: unique symbol;

type TraitValidationError<Message extends string> = {
  readonly [traitValidationError]: Message;
};

type FinalEntryValidation<
  Tag extends IntrinsicTag,
  Entry,
  Rest extends readonly unknown[],
> = Rest extends readonly []
  ? StrictPropSubset<
      TraitOutput<EntryTrait<Entry>>,
      IntrinsicProps<Tag>
    > extends true
    ? unknown
    : "key" extends keyof TraitOutput<EntryTrait<Entry>>
      ? TraitValidationError<`Trait "${StringKey<Entry>}" cannot return React's reserved "key" prop`>
      : TraitValidationError<`Trait "${StringKey<Entry>}" does not return valid <${Extract<Tag, string>}> props`>
  : unknown;

type EntryBoundaryValidation<
  Tag extends IntrinsicTag,
  Entry,
  Rest extends readonly unknown[],
  PreviousOutput,
  IsFirst extends boolean,
> = IsFirst extends true
  ? ValidInitialInput<
      TraitInput<EntryTrait<Entry>>,
      IntrinsicProps<Tag>
    > extends true
    ? FinalEntryValidation<Tag, Entry, Rest>
    : "key" extends keyof TraitInput<EntryTrait<Entry>>
      ? TraitValidationError<`Trait "${StringKey<Entry>}" cannot accept React's reserved "key" prop as initial input`>
      : TraitValidationError<`Trait "${StringKey<Entry>}" cannot accept initial <${Extract<Tag, string>}> props`>
  : [PreviousOutput] extends [TraitInput<EntryTrait<Entry>>]
    ? FinalEntryValidation<Tag, Entry, Rest>
    : TraitValidationError<`Trait "${StringKey<Entry>}" cannot accept the previous trait's output`>;

type PipelineEntryValidation<
  Tag extends IntrinsicTag,
  Entry,
  Rest extends readonly unknown[],
  Seen extends PropertyKey,
  PreviousOutput,
  IsFirst extends boolean,
> = [ValidateEntry<Entry>] extends [never]
  ? TraitValidationError<"A pipeline entry must contain exactly one trait">
  : Extract<keyof Entry, Seen> extends never
    ? EntryBoundaryValidation<Tag, Entry, Rest, PreviousOutput, IsFirst>
    : TraitValidationError<`Trait namespace "${Extract<StringKey<Entry>, Seen>}" is duplicated`>;

type ValidatePipeline<
  Tag extends IntrinsicTag,
  Entries extends readonly unknown[],
  Seen extends PropertyKey = never,
  PreviousOutput = unknown,
  IsFirst extends boolean = true,
> = Entries extends readonly [infer Entry, ...infer Rest]
  ? readonly [
      Entry &
        PipelineEntryValidation<
          Tag,
          Entry,
          Rest,
          Seen,
          PreviousOutput,
          IsFirst
        >,
      ...ValidatePipeline<
        Tag,
        Rest,
        Seen | keyof Entry,
        TraitOutput<EntryTrait<Entry>>,
        false
      >,
    ]
  : readonly [];

type InitialInput<Entries extends TraitEntries> = Entries extends readonly [
  infer First,
  ...unknown[],
]
  ? TraitInput<EntryTrait<First>>
  : unknown;

type InitialPropKeys<Tag extends IntrinsicTag> =
  Exclude<keyof IntrinsicProps<Tag>, "key"> | `data-${string}`;

type InitialTraitProps<Tag extends IntrinsicTag, Entries extends TraitEntries> =
  InitialInput<Entries> extends infer Input extends object
    ? Pick<Input, Extract<keyof Input, InitialPropKeys<Tag>>>
    : object;

type TraitElementProps<
  Tag extends IntrinsicTag,
  Entries extends TraitEntries,
> = {
  of: Entries & NoInfer<ValidatePipeline<Tag, Entries>>;
} & PipelineTraitProps<Entries> &
  Omit<
    IntrinsicProps<Tag> & InitialTraitProps<Tag, Entries>,
    "key" | "of" | keyof PipelineTraitProps<Entries>
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
