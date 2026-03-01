"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Monitor, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingForm } from "@/components/bookings/BookingForm";
import { CustomRequestDialogButton } from "./_components/CustomRequestDialogButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as logger from "@/lib/logger";

const desktopRoomImages = {
  dlt1: "https://www.figma.com/api/mcp/asset/aca01f93-7c0a-420d-9e68-f78d3e6c04aa",
  dlt2: "https://www.figma.com/api/mcp/asset/62d1a64b-56ae-4b51-83d9-0c7215e56cd0",
  lt1: "https://www.figma.com/api/mcp/asset/4fd9c031-e027-4f93-aec9-746ad0771269",
  lt2: "https://www.figma.com/api/mcp/asset/5f97ea06-a997-4c90-bda1-ba23404a6b1e",
  a401: "https://www.figma.com/api/mcp/asset/8cd98558-07eb-4699-9293-3e96a7769f2d",
  a402: "https://www.figma.com/api/mcp/asset/95ff8002-2637-415d-a69e-f3cc04dc7598",
  c401: "https://www.figma.com/api/mcp/asset/819b5220-8687-4fe2-a072-8a40f15250bf",
  c402: "https://www.figma.com/api/mcp/asset/6eb322b0-95ee-4bdb-999e-c4e348915755",
};

type ApiRoomStatus = "vacant" | "occupied" | "ending";
type DesktopRoomStatus = "available" | "booked";
type DesktopAction = "book" | "disabled";

type DesktopRoom = {
  id: string;
  name: string;
  block: string;
  seats: string;
  feature: string;
  status: DesktopRoomStatus;
  action: DesktopAction;
  pick?: string;
  image: string;
};

type ApiRoom = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  amenities: string[];
  status: ApiRoomStatus;
};

const resourceTabs = ["All Resources", "D-Block", "A-Block", "C-Block"];

const roomMatchesTab = (room: DesktopRoom, tab: string) => {
  if (tab === "All Resources") return true;

  const roomName = room.name.trim().toLowerCase();
  if (tab === "D-Block") return roomName.startsWith("d");
  if (tab === "A-Block") return roomName.startsWith("a");
  if (tab === "C-Block") return roomName.startsWith("c");

  return true;
};

const getRoomImage = (roomName: string) => {
  const key = roomName.trim().toLowerCase() as keyof typeof desktopRoomImages;
  return desktopRoomImages[key] ?? desktopRoomImages.dlt1;
};

const getRoomFeature = (amenities: string[]) => {
  if (amenities.length === 0) return "General Purpose";
  return amenities.join(", ");
};

const mapApiRoomToDesktopRoom = (room: ApiRoom): DesktopRoom => {
  const isAvailable = room.status === "vacant";
  return {
    id: room.id,
    name: room.name,
    block: room.location,
    seats: `${room.capacity} Seats`,
    feature: getRoomFeature(room.amenities),
    status: isAvailable ? "available" : "booked",
    action: isAvailable ? "book" : "disabled",
    image: getRoomImage(room.name),
  };
};

const statusPill = (status: DesktopRoomStatus) => {
  if (status === "available") {
    return (
      <Badge className="rounded-full bg-accent-green/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-white">
        Available
      </Badge>
    );
  }
  return (
    <Badge className="rounded-full bg-accent-red/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-white">
      Booked
    </Badge>
  );
};

const DesktopBookingCard = ({
  room,
  onPrimaryAction,
}: {
  room: DesktopRoom;
  onPrimaryAction: (room: DesktopRoom) => void;
}) => (
  <Card className="[content-visibility:auto] [contain-intrinsic-size:360px] gap-4 rounded-3xl border-white/70 bg-white p-3 shadow-md">
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/70">
      <img
        src={room.image}
        alt={room.name}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
      <div className="absolute left-3 top-3 flex items-center gap-2">
        {statusPill(room.status)}
        {room.pick ? (
          <Badge className="rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-white">
            {room.pick}
          </Badge>
        ) : null}
      </div>
    </div>

    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-[28px] font-bold leading-none tracking-[-0.5px] text-primary">
          {room.name}
        </h3>
        <span className="text-xs font-medium text-foreground-muted">{room.block}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-foreground-secondary">
        <Users className="size-3.5" />
        <span>{room.seats}</span>
        <span className="text-foreground-muted">•</span>
        <Monitor className="size-3.5" />
        <span>{room.feature}</span>
      </div>
    </div>

    <Button
      className={cn(
        "h-10 w-full rounded-full text-sm font-bold",
        room.action === "book" &&
          "bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:bg-primary/90",
        room.action === "disabled" &&
          "bg-background-secondary text-foreground-muted hover:bg-background-secondary",
      )}
      disabled={room.action === "disabled"}
      onClick={() => onPrimaryAction(room)}
    >
      {room.action === "book" ? "Book Now" : "Booked"}
    </Button>
  </Card>
);

const BookingsPage = () => {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.trim().split(" ")[0] ?? "Student";
  const [activeResourceTab, setActiveResourceTab] = useState("All Resources");
  const [desktopRooms, setDesktopRooms] = useState<DesktopRoom[]>([]);
  const [isQuickRequestOpen, setIsQuickRequestOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<DesktopRoom | null>(null);

  const refreshRooms = async () => {
    try {
      const response = await fetch("/api/rooms", { method: "GET" });
      const payload = (await response.json()) as ApiRoom[] | { error?: string };

      if (!response.ok || !Array.isArray(payload)) {
        throw new Error((payload as { error?: string }).error ?? "Failed to load rooms");
      }

      setDesktopRooms(payload.map(mapApiRoomToDesktopRoom));
    } catch (error) {
      logger.error("BookingsPage.refreshRooms", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  useEffect(() => {
    void refreshRooms();
  }, []);

  const filteredRooms = useMemo(
    () => desktopRooms.filter((room) => roomMatchesTab(room, activeResourceTab)),
    [desktopRooms, activeResourceTab],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 md:mb-8 md:gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Resource Booking</h1>
          <p className="mt-1 text-sm text-foreground-secondary md:text-base">
            Hi {firstName}, book a session for CS211 or CS241.
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <CustomRequestDialogButton />
        </div>
      </div>

      <Card className="gap-4 rounded-2xl border-border/70 bg-card/90 p-4 shadow-md md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {resourceTabs.map((tab) => (
            <Button
              key={tab}
              variant={activeResourceTab === tab ? "default" : "ghost"}
              className={cn(
                "h-9 rounded-full px-4 text-sm",
                activeResourceTab !== tab && "text-foreground-secondary",
              )}
              onClick={() => setActiveResourceTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.length === 0 ? (
            <Card className="col-span-full rounded-2xl border-border/70 bg-card p-6 text-center text-sm text-foreground-secondary">
              No rooms found.
            </Card>
          ) : (
            filteredRooms.map((room) => (
              <DesktopBookingCard
                key={room.id}
                room={room}
                onPrimaryAction={(roomForAction) => {
                  if (roomForAction.action === "disabled") return;
                  setSelectedRoom(roomForAction);
                  setIsQuickRequestOpen(true);
                }}
              />
            ))
          )}
        </div>
      </Card>

      <Dialog
        open={isQuickRequestOpen}
        onOpenChange={(open) => {
          setIsQuickRequestOpen(open);
          if (!open) setSelectedRoom(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedRoom ? `Book ${selectedRoom.name}` : "Book Room"}</DialogTitle>
            <DialogDescription>
              Submit room, start time, end time, and reason.
            </DialogDescription>
          </DialogHeader>
          <BookingForm
            initialRoomId={selectedRoom?.id}
            onSuccess={() => {
              setIsQuickRequestOpen(false);
              setSelectedRoom(null);
              void refreshRooms();
            }}
          />
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-6 right-6 z-20 md:hidden">
        <CustomRequestDialogButton compact />
      </div>
    </div>
  );
};

export default BookingsPage;
