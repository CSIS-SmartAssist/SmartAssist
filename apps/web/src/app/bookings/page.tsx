"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { Calendar, Clock3, Filter, Monitor, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomRequestDialogButton } from "./_components/CustomRequestDialogButton";
import { cn } from "@/lib/utils";

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

const roomFeatureByName: Record<string, string> = {
  dlt1: "Projector, AC",
  dlt2: "Smart Board",
  lt1: "Full Audio",
  lt2: "Full Audio",
  a401: "Whiteboard",
  a402: "Whiteboard",
  c401: "Gigabit Net",
  c402: "Gigabit Net",
};

const defaultRoomImage = "https://www.figma.com/api/mcp/asset/aca01f93-7c0a-420d-9e68-f78d3e6c04aa";

type DesktopRoomStatus = "vacant" | "occupied" | "ending";
type DesktopAction = "book" | "waitlist" | "disabled";

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

const resourceTabs = ["All Resources", "D-Block", "A-Block", "C-Block"];

const demoRooms: DesktopRoom[] = [
  {
    id: "dlt1",
    name: "DLT1",
    block: "D-Block",
    seats: "60 Seats",
    feature: "Projector, AC",
    status: "vacant",
    action: "book",
    pick: "CS211 Pick",
    image: desktopRoomImages.dlt1,
  },
  {
    id: "dlt2",
    name: "DLT2",
    block: "D-Block",
    seats: "60 Seats",
    feature: "Smart Board",
    status: "occupied",
    action: "disabled",
    image: desktopRoomImages.dlt2,
  },
  {
    id: "lt1",
    name: "LT1",
    block: "D-Block",
    seats: "120 Seats",
    feature: "Full Audio",
    status: "ending",
    action: "waitlist",
    image: desktopRoomImages.lt1,
  },
  {
    id: "lt2",
    name: "LT2",
    block: "D-Block",
    seats: "120 Seats",
    feature: "Full Audio",
    status: "vacant",
    action: "book",
    image: desktopRoomImages.lt2,
  },
  {
    id: "a401",
    name: "A401",
    block: "A-Block",
    seats: "40 Seats",
    feature: "Whiteboard",
    status: "vacant",
    action: "book",
    image: desktopRoomImages.a401,
  },
  {
    id: "a402",
    name: "A402",
    block: "A-Block",
    seats: "40 Seats",
    feature: "Whiteboard",
    status: "occupied",
    action: "disabled",
    image: desktopRoomImages.a402,
  },
  {
    id: "c401",
    name: "C401",
    block: "C-Block",
    seats: "45 Lab Units",
    feature: "Gigabit Net",
    status: "vacant",
    action: "book",
    image: desktopRoomImages.c401,
  },
  {
    id: "c402",
    name: "C402",
    block: "C-Block",
    seats: "45 Lab Units",
    feature: "Gigabit Net",
    status: "ending",
    action: "waitlist",
    image: desktopRoomImages.c402,
  },
];

const statusPill = (status: DesktopRoomStatus) => {
  if (status === "vacant") {
    return (
      <Badge className="rounded-full bg-accent-green/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-white">
        Vacant
      </Badge>
    );
  }
  if (status === "ending") {
    return (
      <Badge className="rounded-full bg-accent-orange/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-white">
        Ending Soon
      </Badge>
    );
  }
  return (
    <Badge className="rounded-full bg-accent-red/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-white">
      Occupied
    </Badge>
  );
};

const DesktopBookingCard = ({ room }: { room: DesktopRoom }) => (
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
        <h3 className="text-[28px] font-bold leading-none tracking-[-0.5px] text-foreground">
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
        room.action === "waitlist" &&
          "border border-primary/25 bg-primary/10 text-primary hover:bg-primary/15",
        room.action === "disabled" &&
          "bg-background-secondary text-foreground-muted hover:bg-background-secondary",
      )}
      disabled={room.action === "disabled"}
    >
      {room.action === "book" ? "Book Now" : room.action === "waitlist" ? "Waitlist" : "Unavailable"}
    </Button>
  </Card>
);

const BookingsPage = () => {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.trim().split(" ")[0] ?? "Student";

  const desktopRooms = useMemo<DesktopRoom[]>(() => {
    return demoRooms;
  }, []);

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
          <Button variant="outline" className="h-9 flex-1 sm:flex-none">
            <Clock3 className="size-4" />
            My History
          </Button>
          <CustomRequestDialogButton />
        </div>
      </div>

      <Card className="gap-4 rounded-2xl border-border/70 bg-card/90 p-4 shadow-md md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {resourceTabs.map((tab, index) => (
            <Button
              key={tab}
              variant={index === 0 ? "default" : "ghost"}
              className={cn(
                "h-9 rounded-full px-4 text-sm",
                index !== 0 && "text-foreground-secondary",
              )}
            >
              {tab}
            </Button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-9 rounded-full">
              <Filter className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-9 rounded-full">
              <Calendar className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {desktopRooms.length === 0 ? (
            <Card className="col-span-full rounded-2xl border-border/70 bg-card p-6 text-center text-sm text-foreground-secondary">
              No rooms found.
            </Card>
          ) : (
            desktopRooms.map((room) => <DesktopBookingCard key={room.id} room={room} />)
          )}
        </div>
      </Card>

      <div className="fixed bottom-6 right-6 z-20 md:hidden">
        <CustomRequestDialogButton compact />
      </div>
    </div>
  );
};

export default BookingsPage;
