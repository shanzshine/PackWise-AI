import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
  sections,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  sections: { title: string; description: string }[];
}) {
  return (
    <div className="space-y-8">
      <PageHeader title={title} description={description} actions={<Badge variant="outline" className="border-border/70 font-normal">Preview</Badge>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((s) => (
          <Card key={s.title} className="border-border/70 shadow-none">
            <CardContent className="p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-4 text-sm font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-dashed border-border bg-[color:var(--primary-soft)]/40 shadow-none">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-medium">This module is part of the live PackWise AI prototype.</p>
            <p className="text-xs text-muted-foreground">Full functionality is available in the production release.</p>
          </div>
          <Badge variant="secondary" className="bg-card text-foreground">Coming soon</Badge>
        </CardContent>
      </Card>
    </div>
  );
}