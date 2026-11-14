import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { AlertTriangle, Info, Lightbulb, type LucideIcon } from "lucide-react";
import { type ComponentProps, useId } from "react";

import type {
  BlockquoteBlock,
  CalloutBlock,
  CalloutVariant,
  HeadingBlock,
  InlineNode,
  ListBlock,
  ListItem,
  ProseBlock,
} from "@/shared/curriculum-data";
import { Checkbox } from "@/shared/ui/shadcn/checkbox";

const HEADING_LEVEL_TWO = 2;
const HEADING_LEVEL_THREE = 3;
const HEADING_LEVEL_FOUR = 4;

const HEADING_TAGS = {
  [HEADING_LEVEL_FOUR]: {
    className: "mt-4 scroll-mt-20 text-base font-semibold tracking-tight",
    tag: "h4",
  },
  [HEADING_LEVEL_THREE]: {
    className: "mt-6 scroll-mt-20 text-lg font-semibold tracking-tight",
    tag: "h3",
  },
  [HEADING_LEVEL_TWO]: {
    className: "mt-8 scroll-mt-20 text-xl font-semibold tracking-tight first:mt-0",
    tag: "h2",
  },
} as const;

const CALLOUT_VARIANTS: Record<CalloutVariant, { containerClassName: string; icon: LucideIcon }> = {
  note: {
    containerClassName: "border-border bg-muted/50 text-foreground",
    icon: Info,
  },
  tip: {
    containerClassName: "border-primary/30 bg-primary/5 text-foreground",
    icon: Lightbulb,
  },
  warning: {
    containerClassName: "border-destructive/40 bg-destructive/10 text-foreground",
    icon: AlertTriangle,
  },
};

interface CurriculumContentBlocksProps extends ComponentProps<"div"> {
  blocks: readonly ProseBlock[];
}

interface InlineNodesProps {
  nodes: readonly InlineNode[];
}

function CurriculumContentBlocks({ blocks, className, ...props }: CurriculumContentBlocksProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {blocks.map((block, index) => (
        <ProseBlockView block={block} key={`${block.type}-${String(index)}`} />
      ))}
    </div>
  );
}

function ProseBlockView({ block }: { block: ProseBlock }) {
  if (block.type === "heading") {
    return <HeadingBlockView block={block} />;
  }

  if (block.type === "paragraph") {
    return (
      <p className="leading-7 text-foreground">
        <InlineNodes nodes={block.content} />
      </p>
    );
  }

  if (block.type === "list") {
    return <ListBlockView block={block} />;
  }

  if (block.type === "blockquote") {
    return <BlockquoteBlockView block={block} />;
  }

  return <CalloutBlockView block={block} />;
}

function HeadingBlockView({ block }: { block: HeadingBlock }) {
  const { className, tag: Tag } = HEADING_TAGS[block.level];

  return (
    <Tag className={className} id={block.id}>
      {block.text}
    </Tag>
  );
}

function ListBlockView({ block }: { block: ListBlock }) {
  const isChecklist = block.items.some((item) => item.checked !== undefined);
  const items = block.items.map((item, index) => (
    <ListItemView item={item} key={`${isChecklist ? "check" : "item"}-${String(index)}`} />
  ));

  if (block.ordered) {
    const isLowerRoman = block.style === "lower-roman";
    return (
      <ol
        className={cn("space-y-1.5 pl-6", !isLowerRoman && "list-decimal")}
        style={isLowerRoman ? { listStyleType: "lower-roman" } : undefined}
        type={isLowerRoman ? "i" : undefined}
      >
        {items}
      </ol>
    );
  }

  return (
    <ul className={cn("space-y-1.5", isChecklist ? "list-none pl-0" : "list-disc pl-6")}>
      {items}
    </ul>
  );
}

function ListItemView({ item }: { item: ListItem }) {
  const labelId = useId();
  const nestedLists = item.children ?? [];

  if (item.checked === undefined) {
    return (
      <li className="leading-7">
        <InlineNodes nodes={item.content} />
        {nestedLists.length > 0 ? (
          <CurriculumContentBlocks blocks={nestedLists} className="mt-1.5" />
        ) : null}
      </li>
    );
  }

  return (
    <li className="space-y-1.5">
      <div className="flex items-start gap-2.5 leading-7">
        <Checkbox
          aria-labelledby={labelId}
          checked={item.checked}
          className="mt-1.5"
          disabled
          readOnly
        />
        <span id={labelId}>
          <InlineNodes nodes={item.content} />
        </span>
      </div>
      {nestedLists.length > 0 ? (
        <CurriculumContentBlocks blocks={nestedLists} className="pl-6" />
      ) : null}
    </li>
  );
}

function BlockquoteBlockView({ block }: { block: BlockquoteBlock }) {
  return (
    <blockquote className="border-l-2 border-border pl-4 text-muted-foreground">
      <CurriculumContentBlocks blocks={block.blocks} className="space-y-2" />
    </blockquote>
  );
}

function CalloutBlockView({ block }: { block: CalloutBlock }) {
  const variant = CALLOUT_VARIANTS[block.variant];
  const Icon = variant.icon;
  const titleNodes = block.title;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-sm",
        variant.containerClassName,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        {titleNodes !== undefined && titleNodes.length > 0 ? (
          <p className="font-semibold">
            <InlineNodes nodes={titleNodes} />
          </p>
        ) : null}
        <CurriculumContentBlocks blocks={block.blocks} className="space-y-2" />
      </div>
    </div>
  );
}

function InlineNodes({ nodes }: InlineNodesProps) {
  return (
    <>
      {nodes.map((node, index) => (
        <InlineNodeView key={`${node.type}-${String(index)}`} node={node} />
      ))}
    </>
  );
}

function InlineNodeView({ node }: { node: InlineNode }) {
  if (node.type === "text") {
    return node.text;
  }

  if (node.type === "strong") {
    return (
      <strong>
        <InlineNodes nodes={node.children} />
      </strong>
    );
  }

  if (node.type === "em") {
    return (
      <em>
        <InlineNodes nodes={node.children} />
      </em>
    );
  }

  if (node.type === "code") {
    return <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">{node.text}</code>;
  }

  return <InlineLink node={node} />;
}

function InlineLink({ node }: { node: Extract<InlineNode, { type: "link" }> }) {
  const linkClassName = "font-medium text-primary underline underline-offset-4 hover:opacity-80";

  if (node.external) {
    return (
      <a className={linkClassName} href={node.href} rel="noopener noreferrer" target="_blank">
        <InlineNodes nodes={node.children} />
      </a>
    );
  }

  const linkProps: ComponentProps<typeof Link> = {
    className: linkClassName,
    href: node.href,
  };

  return (
    <Link {...linkProps}>
      <InlineNodes nodes={node.children} />
    </Link>
  );
}

export { CurriculumContentBlocks, InlineNodes };
