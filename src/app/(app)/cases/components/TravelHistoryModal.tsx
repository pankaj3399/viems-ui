"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { toast } from "sonner";

export interface TravelHistoryRecordData {
  id?: number;
  direction: "Entering" | "Leaving" | "IN" | "OUT";
  travelDate?: string;
  country?: string;
  visaType?: string;
  airline?: string;
  flightNumber?: string;
  airport?: string;
  method?: string;
  status?: string;
  notes?: string;
  caseId?: number;
}

interface TravelHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  migrantId: string | number;
  record?: TravelHistoryRecordData | null;
  onSuccess: () => void;
}

export function TravelHistoryModal({
  open,
  onOpenChange,
  migrantId,
  record,
  onSuccess,
}: TravelHistoryModalProps) {
  const isEditing = Boolean(record?.id);

  const [direction, setDirection] = React.useState<"Entering" | "Leaving">("Entering");
  const [travelDate, setTravelDate] = React.useState("");
  const [port, setPort] = React.useState("");
  const [routeFlight, setRouteFlight] = React.useState("");
  const [method, setMethod] = React.useState("Air");
  const [country, setCountry] = React.useState("UK");
  const [status, setStatus] = React.useState("Confirmed");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      if (record) {
        const rawDir = record.direction?.toUpperCase();
        setDirection(rawDir === "OUT" || rawDir === "LEAVING" ? "Leaving" : "Entering");
        
        let dateStr = "";
        if (record.travelDate) {
          const raw = record.travelDate.trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            dateStr = raw;
          } else {
            const d = new Date(raw);
            if (!isNaN(d.getTime())) {
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, "0");
              const day = String(d.getDate()).padStart(2, "0");
              dateStr = `${y}-${m}-${day}`;
            } else {
              dateStr = record.travelDate;
            }
          }
        }
        setTravelDate(dateStr);
        setPort(record.airport || "");
        setRouteFlight(record.flightNumber || "");
        setMethod(record.method || "Air");
        setCountry(record.country || "UK");
        setStatus(record.status || "Confirmed");
        setNotes(record.notes || "");
      } else {
        setDirection("Entering");
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        setTravelDate(`${y}-${m}-${day}`);
        setPort("");
        setRouteFlight("");
        setMethod("Air");
        setCountry("UK");
        setStatus("Confirmed");
        setNotes("");
      }
    }
  }, [open, record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!migrantId) {
      toast.error("Migrant ID is missing");
      return;
    }

    if (!travelDate) {
      toast.error("Please specify a travel date");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        direction,
        travelDate,
        airport: port.trim() || undefined,
        flightNumber: routeFlight.trim() || undefined,
        airline: method.trim() || undefined,
        country: country.trim() || "UK",
        status,
        notes: notes.trim() || undefined,
      };

      if (isEditing && record?.id) {
        await apiClient.patch(
          ENDPOINTS.migrants.travelHistoryRecord(migrantId, record.id),
          payload
        );
        toast.success("Travel history record updated successfully");
      } else {
        await apiClient.post(
          ENDPOINTS.migrants.travelHistory(migrantId),
          payload
        );
        toast.success("Travel history record added successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Failed to save travel history:", err);
      const message =
        err instanceof Error ? err.message : "Failed to save travel record";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[480px] max-w-[95vw] p-0 gap-0 flex flex-col overflow-hidden rounded-[20px] bg-white border border-[#F5F5F5] shadow-card-large font-sans"
      >
        {/* Header */}
        <div className="w-full px-6 py-4 flex items-center justify-between border-b border-[#EBEBEB] bg-white">
          <DialogTitle className="text-[16px] font-medium leading-[24px] text-[#171717]">
            {isEditing ? "Edit Travel Record" : "Add Travel Record"}
          </DialogTitle>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-6 flex flex-col gap-4">
            {/* Direction */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[13px] font-medium text-[#171717]">
                Movement Direction
              </Label>
              <Select
                value={direction}
                onValueChange={(val) => setDirection(((val as "Entering" | "Leaving") || "Entering"))}
              >
                <SelectTrigger className="h-[40px] rounded-[10px] border-[#EBEBEB] text-[14px]">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-[12px] border-[#EBEBEB] shadow-regular-medium">
                  <SelectItem value="Entering">IN (Entering UK)</SelectItem>
                  <SelectItem value="Leaving">OUT (Leaving UK)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Travel Date */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[13px] font-medium text-[#171717]">
                Date of Travel
              </Label>
              <Input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                required
                className="h-[40px] rounded-[10px] border-[#EBEBEB] text-[14px]"
              />
            </div>

            {/* Port */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[13px] font-medium text-[#171717]">
                Port / Airport
              </Label>
              <Input
                type="text"
                placeholder="e.g. London Heathrow (T5)"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="h-[40px] rounded-[10px] border-[#EBEBEB] text-[14px]"
              />
            </div>

            {/* Route / Flight */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[13px] font-medium text-[#171717]">
                Route / Flight Number
              </Label>
              <Input
                type="text"
                placeholder="e.g. BA268 Los Angeles (LAX)"
                value={routeFlight}
                onChange={(e) => setRouteFlight(e.target.value)}
                className="h-[40px] rounded-[10px] border-[#EBEBEB] text-[14px]"
              />
            </div>

            {/* Method / Transport */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[13px] font-medium text-[#171717]">
                Method of Travel
              </Label>
              <Select value={method} onValueChange={(val) => setMethod(val || "Air")}>
                <SelectTrigger className="h-[40px] rounded-[10px] border-[#EBEBEB] text-[14px]">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-[12px] border-[#EBEBEB] shadow-regular-medium">
                  <SelectItem value="Air">Air</SelectItem>
                  <SelectItem value="Rail (Eurostar)">Rail (Eurostar)</SelectItem>
                  <SelectItem value="Sea / Ferry">Sea / Ferry</SelectItem>
                  <SelectItem value="Land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[13px] font-medium text-[#171717]">
                Status
              </Label>
              <Select value={status} onValueChange={(val) => setStatus(val || "Confirmed")}>
                <SelectTrigger className="h-[40px] rounded-[10px] border-[#EBEBEB] text-[14px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-[12px] border-[#EBEBEB] shadow-regular-medium">
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t border-[#EBEBEB] bg-[#FAFAFA] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="h-[36px] px-4 rounded-[8px] text-[14px] border-[#EBEBEB]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-[36px] px-5 rounded-[8px] text-[14px] bg-[#171717] hover:bg-[#262626] text-white"
            >
              {submitting
                ? "Saving..."
                : isEditing
                ? "Update Record"
                : "Add Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
