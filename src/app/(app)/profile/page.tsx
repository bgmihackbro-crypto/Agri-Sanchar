"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Save, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { indianStates } from "@/lib/indian-states";
import { indianCities } from "@/lib/indian-cities";


export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    name: "Farmer",
    phone: "",
    avatar: "https://picsum.photos/seed/farmer/100/100",
    farmSize: "",
    city: "",
    state: "",
    annualIncome: "",
  });
  
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      if (parsedProfile.state) {
        setAvailableCities(indianCities[parsedProfile.state] || []);
      }
    }
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleStateChange = (value: string) => {
    setProfile((prev) => ({...prev, state: value, city: ""})); // Reset city when state changes
    setAvailableCities(indianCities[value] || []);
  }

  const handleCityChange = (value: string) => {
    setProfile((prev) => ({...prev, city: value}));
  }

  const handleSave = () => {
    setIsEditing(false);
    localStorage.setItem("userProfile", JSON.stringify(profile));
    toast({
        title: "Profile Updated",
        description: "Your details have been saved successfully.",
        action: <Check className="h-5 w-5 text-green-500" />,
    })
  }

  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={profile.avatar}
                  alt="@farmer"
                  data-ai-hint="farmer portrait"
                />
                <AvatarFallback>{profile.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-headline">
                  {isEditing ? "Edit Profile" : profile.name}
                </CardTitle>
                <CardDescription>
                  Manage your personal and farm details.
                </CardDescription>
              </div>
            </div>
            {!isEditing && <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                readOnly={!isEditing}
                onChange={handleInputChange}
                placeholder="e.g., Ram Singh"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                readOnly
                className="text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 border-0 shadow-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmSize">Farm Size (in Acres)</Label>
              <Input
                id="farmSize"
                value={profile.farmSize}
                readOnly={!isEditing}
                onChange={handleInputChange}
                placeholder="e.g., 10 Acres"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="state">State</Label>
               {isEditing ? (
                <Select onValueChange={handleStateChange} value={profile.state}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
               ) : (
                <Input
                  id="state"
                  value={profile.state}
                  readOnly={true}
                  placeholder="e.g., Punjab"
                />
               )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              {isEditing ? (
                  <Select onValueChange={handleCityChange} value={profile.city} disabled={!profile.state}>
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              ) : (
                <Input
                  id="city"
                  value={profile.city}
                  readOnly={!isEditing}
                  onChange={handleInputChange}
                  placeholder="e.g., Ludhiana"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualIncome">Annual Income</Label>
              <div className="flex items-center gap-2">
                <span className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="annualIncome"
                  value={profile.annualIncome}
                  readOnly={!isEditing}
                  onChange={handleInputChange}
                  placeholder="e.g., 5,00,000"
                  className="rounded-l-none"
                />
              </div>
            </div>
          </div>
        </CardContent>
        {isEditing && (
          <CardFooter>
            <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
