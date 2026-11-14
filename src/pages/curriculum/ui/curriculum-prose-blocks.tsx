import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import { Fragment, type ComponentProps, type ReactElement, type ReactNode } from "react";

import type {
  CalloutBlock,
  CalloutVariant,
  HeadingBlock,
  InlineNode,
  ListBlock,
  ListItem,
  ProseBlock,
} from "@/shared/curriculum-data";

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

const CALLOUT_CONFIG: Record<
  CalloutVariant,
  { className: string; icon: typeof Info; label: string }
> = {
  note: {
    className: "border-border bg-muted/40",
    icon: Info,
    label: "Note",
  },
  tip: {
    className: "border-primary/40 bg-accent/50",
    icon: Lightbulb,
    label: "Tip",
  },
  warning: {
    className: "border-destructive/40 bg-destructive/10",
    icon: AlertTriangle,
    label: "Warning",
  },
};

interface CurriculumProseBlocksProps extends ComponentProps<"div"> {
  blocks: readonly ProseBlock[];
}

function CurriculumProseBlocks({ blocks, className, ...props }: CurriculumProseBlocksProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {blocks.map((block, index) => {
        const blockKey = `block-${String(index)}`;
        return <ProseBlockView block={block} blockKey={blockKey} key={blockKey} />;
      })}
    </div>
  );
}

function ProseBlockView({ block, blockKey }: { block: ProseBlock; blockKey: string }) {
  if (block.type === "heading") {
    return <HeadingBlockView block={block} />;
  }

  if (block.type === "paragraph") {
    return (
      <p className="leading-7 text-foreground/90">{renderInlineNodes(block.content, blockKey)}</p>
    );
  }

  if (block.type === "list") {
    return <ListBlockView block={block} blockKey={blockKey} />;
  }

  if (block.type === "blockquote") {
    return (
      <blockquote className="my-4 border-l-4 border-border pl-4 text-muted-foreground italic">
        <CurriculumProseBlocks blocks={block.blocks} />
      </blockquote>
    );
  }

  return <CalloutBlockView block={block} blockKey={blockKey} />;
}

function HeadingBlockView({ block }: { block: HeadingBlock }) {
  const { className, tag: Tag } = HEADING_TAGS[block.level];
  return (
    <Tag className={className} id={block.id}>
      {block.text}
    </Tag>
  );
}

function ListBlockView({ block, blockKey }: { block: ListBlock; blockKey: string }) {
  const items = block.items.map((item, index) => {
    const itemKey = `${blockKey}-item-${String(index)}`;
    return <ListItemView item={item} itemKey={itemKey} key={itemKey} />;
  });

  if (block.ordered) {
    const isLowerRoman = block.style === "lower-roman";

    return (
      <ol
        className="my-4 list-decimal space-y-2 pl-6"
        style={isLowerRoman ? { listStyleType: "lower-roman" } : undefined}
        type={isLowerRoman ? "i" : undefined}
      >
        {items}
      </ol>
    );
  }

  return <ul className="my-4 list-disc space-y-2 pl-6">{items}</ul>;
}

function ListItemView({ item, itemKey }: { item: ListItem; itemKey: string }) {
  const isChecklist = item.checked !== undefined;

  return (
    <li className={isChecklist ? "-ml-4 list-none" : undefined}>
      {isChecklist ? (
        <label className="inline-flex items-start gap-2">
          <input
            checked={item.checked}
            className="mt-1.5 size-4 shrink-0 accent-primary"
            disabled
            readOnly
            type="checkbox"
          />
          <span>{renderInlineNodes(item.content, itemKey)}</span>
        </label>
      ) : (
        renderInlineNodes(item.content, itemKey)
      )}
      {item.children?.map((childList, index) => {
        const childKey = `${itemKey}-child-${String(index)}`;
        return <ListBlockView block={childList} blockKey={childKey} key={childKey} />;
      })}
    </li>
  );
}

function CalloutBlockView({ block, blockKey }: { block: CalloutBlock; blockKey: string }) {
  const config = CALLOUT_CONFIG[block.variant];
  const Icon = config.icon;

  return (
    <aside className={cn("my-4 rounded-xl border p-4", config.className)}>
      <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        <span>
          {block.title ? renderInlineNodes(block.title, `${blockKey}-title`) : config.label}
        </span>
      </p>
      <CurriculumProseBlocks blocks={block.blocks} />
    </aside>
  );
}

function renderInlineNodes(nodes: readonly InlineNode[], prefix: string): ReactElement[] {
  return nodes.map((node, index) => renderInlineNode(node, `${prefix}-inline-${String(index)}`));
}

function renderInlineNode(node: InlineNode, nodeKey: string): ReactElement {
  if (node.type === "text") {
    return <Fragment key={nodeKey}>{node.text}</Fragment>;
  }

  if (node.type === "strong") {
    return (
      <strong className="font-semibold text-foreground" key={nodeKey}>
        {renderInlineNodes(node.children, nodeKey)}
      </strong>
    );
  }

  if (node.type === "em") {
    return <em key={nodeKey}>{renderInlineNodes(node.children, nodeKey)}</em>;
  }

  if (node.type === "code") {
    return (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" key={nodeKey}>
        {node.text}
      </code>
    );
  }

  if (node.external) {
    return (
      <a
        className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
        href={node.href}
        key={nodeKey}
        rel="noopener noreferrer"
        target="_blank"
      >
        {renderInlineNodes(node.children, nodeKey)}
      </a>
    );
  }

  return (
    <InternalCurriculumLink href={node.href} key={nodeKey}>
      {renderInlineNodes(node.children, nodeKey)}
    </InternalCurriculumLink>
  );
}

function InternalCurriculumLink({ children, href }: { children: ReactNode; href: string }) {
  const linkProps: ComponentProps<typeof Link> = {
    children,
    className: "font-medium text-primary underline underline-offset-4 hover:opacity-80",
    href,
  };

  return <Link {...linkProps} />;
}

export { CurriculumProseBlocks };
