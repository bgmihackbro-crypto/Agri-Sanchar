
"use client";

import { useState, useEffect, useRef } from "react";
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
import { Edit, Save, Check, Upload, Hash, CalendarIcon } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";


export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [profile, setProfile] = useState({
    farmerId: "",
    name: "Farmer",
    phone: "",
    avatar: "https://picsum.photos/seed/farm-icon/100/100",
    farmSize: "",
    city: "",
    state: "",
    annualIncome: "",
    gender: "",
    age: "",
    dob: "",
  });

  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(prev => ({...prev, ...parsedProfile}));
      if (parsedProfile.state) {
        setAvailableCities(indianCities[parsedProfile.state] || []);
      }
       // If profile is incomplete, enter edit mode by default
      if (!parsedProfile.state || !parsedProfile.city) {
        setIsEditing(true);
      }
    } else {
        // If no profile at all, send to login, as they shouldn't be here.
        router.push('/login');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: value }));
  };

  const handleStateChange = (value: string) => {
    setProfile((prev) => ({ ...prev, state: value, city: "" })); // Reset city when state changes
    setAvailableCities(indianCities[value] || []);
  };

  const handleCityChange = (value: string) => {
    setProfile((prev) => ({ ...prev, city: value }));
  };
  
  const handleGenderChange = (value: string) => {
    setProfile((prev) => ({ ...prev, gender: value }));
  };
  
  const handleDobChange = (date: Date | undefined) => {
      if (date) {
        setProfile((prev) => ({ ...prev, dob: date.toISOString() }));
      }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setProfile((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!profile.state || !profile.city || !profile.name) {
       toast({
        variant: "destructive",
        title: "Incomplete Information",
        description: "Please fill out your Name, State, and City before saving.",
      });
      return;
    }

    setIsEditing(false);
    localStorage.setItem("userProfile", JSON.stringify(profile));
    toast({
      title: "Profile Updated",
      description: "Your details have been saved successfully.",
      action: <Check className="h-5 w-5 text-green-500" />,
    });
    // Force a re-render in other components using the avatar
    window.dispatchEvent(new Event("storage"));
    // Redirect to dashboard after saving, ensuring the profile is now complete.
    router.push('/dashboard');
  };

  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={profile.avatar}
                    alt="@farmer"
                    data-ai-hint="farm icon"
                  />
                  <AvatarFallback>{profile.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div
                    className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                )}
                 <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                    accept="image/*"
                  />
              </div>
              <div>
                <CardTitle className="text-2xl font-headline">
                  {isEditing ? "Edit Profile" : profile.name}
                </CardTitle>
                <CardDescription>
                  {isEditing ? "Please complete your details to continue." : "Manage your personal and farm details."}
                </CardDescription>
              </div>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <Label htmlFor="farmerId">Farmer ID</Label>
               <div className="flex items-center gap-2">
                 <span className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                 </span>
                <Input
                  id="farmerId"
                  value={profile.farmerId}
                  readOnly
                  className="text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 border-0 shadow-none bg-muted font-mono"
                />
              </div>
            </div>
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
              <Label htmlFor="dob">Date of Birth</Label>
               {isEditing ? (
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !profile.dob && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {profile.dob ? format(new Date(profile.dob), "dd-MM-yyyy") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={profile.dob ? new Date(profile.dob) : undefined}
                        onSelect={handleDobChange}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1930}
                        toYear={new Date().getFullYear()}
                      />
                      <div className="p-2 border-t">
                          <Button onClick={() => setIsCalendarOpen(false)} className="w-full">OK</Button>
                      </div>
                    </PopoverContent>
                  </Popover>
               ) : (
                 <Input
                  id="dob"
                  value={profile.dob ? format(new Date(profile.dob), "dd-MM-yyyy") : ""}
                  readOnly={true}
                  placeholder="Not set"
                />
               )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                readOnly={!isEditing}
                onChange={handleInputChange}
                placeholder="e.g., 42"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              {isEditing ? (
                <Select onValueChange={handleGenderChange} value={profile.gender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="gender"
                  value={profile.gender}
                  readOnly={true}
                  placeholder="Not set"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
               <div className="flex items-center gap-2">
                <span className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  id="phone"
                  value={profile.phone.replace('+91','')}
                  readOnly
                  className="text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 border-0 shadow-none bg-muted"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmSize">Farm Size (in Acres)</Label>
              <Input
                id="farmSize"
                value={profile.farmSize}
                readOnly={!isEditing}
                onChange={handleInputChange}
                placeholder="e.g., 10"
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
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
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
                <Select
                  onValueChange={handleCityChange}
                  value={profile.city}
                  disabled={!profile.state}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="annualIncome">Annual Income (₹)</Label>
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
                />
              </div>
            </div>
          </div>
        </CardContent>
        {isEditing && (
          <CardFooter>
            <Button
              onClick={handleSave}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
