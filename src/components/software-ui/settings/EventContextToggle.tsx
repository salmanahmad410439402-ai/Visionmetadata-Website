import React, { useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface EventContextToggleProps {
  eventEnabled: boolean;
  setEventEnabled: (enabled: boolean) => void;
  eventName: string;
  setEventName: (name: string) => void;
}

export const EventContextToggle: React.FC<EventContextToggleProps> = ({
  eventEnabled,
  setEventEnabled,
  eventName,
  setEventName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = (enabled: boolean) => {
    setEventEnabled(enabled);
    if (enabled && !eventName && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    toast.info(enabled ? "Event context enabled" : "Event context disabled");
  };

  const handleEventNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventName(e.target.value);
  };

  return (
    <section className="space-y-4 pt-4 border-t border-border">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Event / Series Context
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Tell the AI which event your content is for. Uses Dual-Strategy: event-targeted title + mixed event & general keywords.
          </p>
        </div>
        <Switch checked={eventEnabled} onCheckedChange={handleToggle} />
      </div>

      {eventEnabled && (
        <div className="space-y-3 p-3 bg-muted/30 rounded-md border border-muted">
          <div>
            <Label htmlFor="event-name" className="text-sm font-medium">
              Event Name *
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              e.g. "World Environment Day", "Christmas 2026", "Black Friday"
            </p>
            <Input
              ref={inputRef}
              id="event-name"
              value={eventName}
              onChange={handleEventNameChange}
              placeholder="Enter event name..."
              className="text-sm"
            />
          </div>

          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-600 dark:text-blue-400">
            <strong>Dual-Strategy Generation:</strong>
            <ul className="mt-1 space-y-0.5 list-disc list-inside">
              <li>Keywords 1-10: Focus on event-specific terms for immediate findability</li>
              <li>Keywords 11+: Mix of event-related and evergreen keywords for year-round searchability</li>
              <li>Title: Will naturally reference the event</li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};
