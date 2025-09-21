
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
import { Edit, Save, Check, Upload, Hash, CalendarIcon, Languages, Briefcase } from "lucide-react";
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
import { useTranslation } from "@/hooks/use-translation";
import { auth } from "@/lib/firebase";
import { updateUserProfile, type UserProfile } from "@/lib/firebase/users";


export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { t } = useTranslation();

  const [profile, setProfile] = useState<UserProfile>({
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
    language: "English",
    userType: "farmer",
    specialization: "",
    organization: "",
  });

  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    const preselectedLang = localStorage.getItem("selectedLanguage");

    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      
      // If a language was just selected on the previous screen, set it.
      if (preselectedLang && !parsedProfile.language) {
          parsedProfile.language = preselectedLang;
      }

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
  
   const handleLanguageChange = (value: 'English' | 'Hindi') => {
    setProfile((prev) => ({ ...prev, language: value }));
  };

  const handleUserTypeChange = (value: 'farmer' | 'expert' | 'ngo') => {
    setProfile((prev) => ({ ...prev, userType: value }));
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

  const handleSave = async () => {
    if (!profile.farmerId) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "Your user ID is missing. Please log in again." });
      router.push('/login');
      return;
    }

    if (!profile.state || !profile.city || !profile.name) {
       toast({
        variant: "destructive",
        title: t.profile.toast.incomplete,
        description: t.profile.toast.incompleteDesc,
      });
      return;
    }

    setIsEditing(false);
    
    try {
      // Use the farmerId to find the mock user ID
      const mockUserId = `sim-${profile.phone.replace('+91', '')}`;
      await updateUserProfile(mockUserId, profile);
      localStorage.setItem("userProfile", JSON.stringify(profile));
      
      // We can now remove the temporary language selection
      localStorage.removeItem('selectedLanguage');

      toast({
        title: t.profile.toast.updated,
        description: t.profile.toast.updatedDesc,
        action: <Check className="h-5 w-5 text-green-500" />,
      });
      // Force a re-render in other components using the avatar
      window.dispatchEvent(new Event("storage"));
      // Redirect to dashboard after saving, ensuring the profile is now complete.
      router.push('/dashboard');
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ variant: "destructive", title: "Save Failed", description: "Could not save your profile to the database." });
      setIsEditing(true); // Re-enter editing mode on failure
    }
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
                  {isEditing ? t.profile.editTitle : t.profile.viewTitle(profile.name)}
                </CardTitle>
                <CardDescription>
                  {isEditing ? t.profile.descriptionIncomplete : t.profile.description}
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
              <Label htmlFor="farmerId">{t.profile.farmerId}</Label>
               <div className="flex items-center gap-2">
                <Input
                  id="farmerId"
                  value={profile.farmerId}
                  readOnly
                  className="bg-muted text-muted-foreground font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t.profile.name}</Label>
              <Input
                id="name"
                value={profile.name}
                readOnly={!isEditing}
                onChange={handleInputChange}
                placeholder={t.profile.namePlaceholder}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="userType">I am a...</Label>
              {isEditing ? (
                 <Select onValueChange={(v) => handleUserTypeChange(v as any)} value={profile.userType}>
                  <SelectTrigger id="userType" className="capitalize">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="ngo">NGO</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input id="userType" value={profile.userType} readOnly={true} className="capitalize" />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">{t.profile.dob}</Label>
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
                        {profile.dob ? format(new Date(profile.dob), "dd-MM-yyyy") : <span>{t.profile.pickDate}</span>}
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
                  placeholder={t.profile.notSet}
                />
               )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">{t.profile.age}</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                readOnly={!isEditing}
                onChange={handleInputChange}
                placeholder={t.profile.agePlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">{t.profile.gender}</Label>
              {isEditing ? (
                <Select onValueChange={handleGenderChange} value={profile.gender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder={t.profile.genderPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t.profile.male}</SelectItem>
                    <SelectItem value="female">{t.profile.female}</SelectItem>
                    <SelectItem value="other">{t.profile.other}</SelectItem>
                    <SelectItem value="prefer-not-to-say">{t.profile.preferNotToSay}</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="gender"
                  value={profile.gender}
                  readOnly={true}
                  placeholder={t.profile.notSet}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t.profile.phone}</Label>
               <div className="flex items-center gap-2">
                <span className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  id="phone"
                  value={profile.phone.replace('+91','')}
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="language">{t.profile.language}</Label>
              {isEditing ? (
                 <Select onValueChange={(v) => handleLanguageChange(v as 'English' | 'Hindi')} value={profile.language}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder={t.profile.languagePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">{t.profile.english}</SelectItem>
                    <SelectItem value="Hindi">{t.profile.hindi}</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input id="language" value={profile.language === 'Hindi' ? t.profile.hindi : t.profile.english} readOnly={true} />
              )}
            </div>

            {profile.userType === 'farmer' ? (
                <>
                    <div className="space-y-2">
                    <Label htmlFor="farmSize">{t.profile.farmSize}</Label>
                    <Input
                        id="farmSize"
                        value={profile.farmSize}
                        readOnly={!isEditing}
                        onChange={handleInputChange}
                        placeholder={t.profile.farmSizePlaceholder}
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="annualIncome">{t.profile.income}</Label>
                    <div className="flex items-center gap-2">
                        <span className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                        ₹
                        </span>
                        <Input
                        id="annualIncome"
                        value={profile.annualIncome}
                        readOnly={!isEditing}
                        onChange={handleInputChange}
                        placeholder={t.profile.incomePlaceholder}
                        />
                    </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                            id="specialization"
                            value={profile.specialization}
                            readOnly={!isEditing}
                            onChange={handleInputChange}
                            placeholder={profile.userType === 'expert' ? "e.g., Agronomy" : "e.g., Water Conservation"}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <Input
                            id="organization"
                            value={profile.organization}
                            readOnly={!isEditing}
                            onChange={handleInputChange}
                            placeholder={profile.userType === 'expert' ? "e.g., Punjab Agricultural University" : "e.g., My NGO Name"}
                        />
                    </div>
                </>
            )}


            <div className="space-y-2">
              <Label htmlFor="state">{t.profile.state}</Label>
              {isEditing ? (
                <Select onValueChange={handleStateChange} value={profile.state}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder={t.profile.statePlaceholder} />
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
                  placeholder={t.profile.stateExample}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t.profile.city}</Label>
              {isEditing ? (
                <Select
                  onValueChange={handleCityChange}
                  value={profile.city}
                  disabled={!profile.state}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder={t.profile.cityPlaceholder} />
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
                  placeholder={t.profile.cityExample}
                />
              )}
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
              {t.profile.save}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

