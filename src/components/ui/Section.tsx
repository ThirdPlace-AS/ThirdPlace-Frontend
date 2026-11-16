// Grouping primitives (DESIGN_SYSTEM.md "Spacing", 0429): a heading sits
// closer to its own block than to the block above, so it reads as that
// block's heading. Use these instead of loose headings in a page's gap.
//
//   <Section title>   a page section: title, then its block 12 below
//   <Field label>     a form field: label, then its control 8 below
import type { ReactNode } from "react";
import { View } from "react-native";

import { cn } from "@/lib/utils";

import { Text } from "./Text";

export function Section({
  title,
  subtitle,
  trailing,
  rows,
  className,
  children,
}: {
  title: string;
  /** A muted line under the title (a text pair, 4 below it). */
  subtitle?: string;
  /** Right of the title (a "Se alle" link, a count). */
  trailing?: ReactNode;
  /**
   * The block is rows that carry their own `py-3`: no extra gap, so the
   * first row's text still sits 12 below the title.
   */
  rows?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const heading = (
    <View className="gap-1">
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="caption" tone="muted">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
  return (
    <View className={cn(rows ? "gap-0" : "gap-3", className)}>
      {trailing ? (
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1">{heading}</View>
          {trailing}
        </View>
      ) : (
        heading
      )}
      {children}
    </View>
  );
}

export function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <View className={cn("gap-2", className)}>
      <Text variant="label" weight="semibold">
        {label}
      </Text>
      {children}
    </View>
  );
}
