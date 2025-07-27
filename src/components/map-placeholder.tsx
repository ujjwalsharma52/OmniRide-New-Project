import Image from "next/image";
import { CarFront, Bike, Truck } from "lucide-react";
import { Card } from "./ui/card";

const VehicleIcon = ({ icon: Icon, top, left, rotation = 0 }: { icon: React.ElementType, top: string, left: string, rotation?: number }) => (
    <Card className="absolute p-2 rounded-full shadow-lg bg-card" style={{ top, left, transform: `rotate(${rotation}deg)` }}>
        <Icon className="h-5 w-5 text-primary" />
    </Card>
);

export default function MapPlaceholder() {
  return (
    <div className="relative w-full h-full bg-muted overflow-hidden">
      <Image
        src="https://placehold.co/1200x800.png"
        alt="City map"
        layout="fill"
        objectFit="cover"
        className="opacity-50"
        data-ai-hint="map city"
      />
      <div className="absolute inset-0">
        {/* Mock vehicle icons */}
        <VehicleIcon icon={CarFront} top="20%" left="30%" rotation={45} />
        <VehicleIcon icon={Bike} top="50%" left="55%" rotation={-20}/>
        <VehicleIcon icon={Truck} top="70%" left="25%" rotation={180}/>
        <VehicleIcon icon={CarFront} top="35%" left="70%" rotation={-90}/>
      </div>
    </div>
  );
}
