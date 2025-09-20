
"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import Image from "next/image";
import { Search, PlusCircle, Tractor, Tag, Phone, MapPin, IndianRupee, Clock, Calendar, Upload, X, Star } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { createRental, getRentals, type Rental, type NewRentalData } from "@/lib/firebase/rentals";
import { indianCities } from "@/lib/indian-cities";

const allCitiesList = Object.values(indianCities).flat().sort();
const equipmentCategories = ["Tractor", "Harvester", "Tiller", "Planter", "Sprayer", "Baler", "Other"];

type UserProfile = {
  farmerId: string;
  name: string;
  avatar: string;
  city: string;
  phone: string;
};

const AddEquipmentDialog = ({ userProfile, onEquipmentAdded }: { userProfile: UserProfile, onEquipmentAdded: () => void }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [priceUnit, setPriceUnit] = useState<"per_hour" | "per_day">("per_day");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setName("");
        setCategory("");
        setPrice("");
        setPriceUnit("per_day");
        setDescription("");
        setImageFile(null);
        setImagePreview(null);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({ variant: 'destructive', title: t.rental.addDialog.fileTooLarge, description: t.rental.addDialog.fileTooLargeDesc });
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!name || !category || !price || !imageFile) {
            toast({ variant: 'destructive', title: t.rental.addDialog.incompleteTitle, description: t.rental.addDialog.incompleteDesc });
            return;
        }
        setIsSaving(true);
        
        try {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onloadend = () => {
                const newRental: NewRentalData = {
                    name,
                    category,
                    price: parseFloat(price),
                    priceUnit,
                    description,
                    imageUrl: reader.result as string,
                    ownerId: userProfile.farmerId,
                    ownerName: userProfile.name,
                    ownerAvatar: userProfile.avatar,
                    location: userProfile.city,
                    contact: userProfile.phone,
                };
                createRental(newRental);
                toast({ title: t.rental.addDialog.successTitle, description: t.rental.addDialog.successDesc(name) });
                onEquipmentAdded();
                setIsOpen(false);
                resetForm();
            }
        } catch (error) {
             toast({ variant: 'destructive', title: t.rental.addDialog.errorTitle, description: t.rental.addDialog.errorDesc });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t.rental.addDialog.button}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{t.rental.addDialog.title}</DialogTitle>
                    <DialogDescription>{t.rental.addDialog.description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t.rental.addDialog.nameLabel}</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.rental.addDialog.namePlaceholder} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">{t.rental.addDialog.categoryLabel}</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t.rental.addDialog.categoryPlaceholder} />
                                </SelectTrigger>
                                <SelectContent>
                                    {equipmentCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">{t.rental.addDialog.priceLabel}</Label>
                            <div className="flex gap-2">
                                <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 1000" />
                                <Select value={priceUnit} onValueChange={(v) => setPriceUnit(v as any)}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="per_day">{t.rental.perDay}</SelectItem>
                                        <SelectItem value="per_hour">{t.rental.perHour}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">{t.rental.addDialog.descriptionLabel}</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.rental.addDialog.descriptionPlaceholder} />
                    </div>
                    <div className="space-y-2">
                        <Label>{t.rental.addDialog.imageLabel}</Label>
                        {imagePreview ? (
                            <div className="relative">
                                <Image src={imagePreview} alt="Preview" width={400} height={200} className="w-full h-auto rounded-md object-cover"/>
                                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setImagePreview(null)}><X className="h-4 w-4"/></Button>
                            </div>
                        ) : (
                             <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary" onClick={() => fileInputRef.current?.click()}>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                                <div className="text-center">
                                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">{t.rental.addDialog.imagePlaceholder}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>{t.community.group.cancel}</Button>
                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Spinner className="mr-2 h-4 w-4"/>}
                        {t.rental.addDialog.submit}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const RentalCard = ({ rental, t }: { rental: Rental, t: any }) => {
    return (
        <Card className="flex flex-col overflow-hidden">
            <CardHeader className="p-0">
                <div className="relative aspect-video">
                    <Image src={rental.imageUrl} alt={rental.name} fill className="object-cover" />
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="flex items-center gap-1.5"><Tractor className="h-3 w-3"/>{rental.category}</Badge>
                    <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold">4.5</span>
                    </div>
                </div>
                <h3 className="text-lg font-bold font-headline mt-2">{rental.name}</h3>
                <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <MapPin className="h-4 w-4" /> {rental.location}
                </div>
                 <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {rental.description}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex-col items-start gap-3">
                <div className="text-2xl font-bold flex items-center gap-1.5">
                    <IndianRupee className="h-6 w-6"/> {rental.price}
                    <span className="text-sm font-normal text-muted-foreground">/ {rental.priceUnit === 'per_day' ? t.rental.day : t.rental.hour}</span>
                </div>
                <div className="w-full flex items-center gap-2">
                     <Button className="w-full" asChild>
                        <a href={`tel:${rental.contact}`}>
                            <Phone className="mr-2 h-4 w-4"/> {t.rental.callOwner}
                        </a>
                     </Button>
                      <Button variant="outline" className="w-full">
                        {t.rental.bookNow}
                      </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

export default function RentalEquipmentPage() {
    const { t } = useTranslation();
    const [allRentals, setAllRentals] = useState<Rental[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const [filterCategory, setFilterCategory] = useState('all');
    const [filterCity, setFilterCity] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchRentals = () => {
        setIsLoading(true);
        try {
            setAllRentals(getRentals());
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const profile = localStorage.getItem('userProfile');
        if (profile) {
            const parsed = JSON.parse(profile) as UserProfile;
            setUserProfile(parsed);
            setFilterCity(parsed.city); // Default filter to user's city
        }
        fetchRentals();
    }, []);

    const myRentals = allRentals.filter(r => r.ownerId === userProfile?.farmerId);

    const filteredRentals = allRentals.filter(rental => {
        const categoryMatch = filterCategory === 'all' || rental.category === filterCategory;
        const cityMatch = filterCity === 'all' || rental.location === filterCity;
        const searchMatch = !searchQuery || rental.name.toLowerCase().includes(searchQuery.toLowerCase());
        return categoryMatch && cityMatch && searchMatch;
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t.sidebar.rental}</h1>
        <p className="text-muted-foreground">
          {t.rental.description}
        </p>
      </div>

       <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="browse">{t.rental.tabs.browse}</TabsTrigger>
                <TabsTrigger value="my-equipment">{t.rental.tabs.myEquipment}</TabsTrigger>
            </TabsList>
            <TabsContent value="browse" className="pt-4">
                 <Card>
                    <CardContent className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t.rental.searchPlaceholder}
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select onValueChange={setFilterCategory} value={filterCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder={t.rental.filterCategory} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t.rental.allCategories}</SelectItem>
                                {equipmentCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={setFilterCity} value={filterCity}>
                            <SelectTrigger>
                                <SelectValue placeholder={t.rental.filterLocation} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t.community.allLocations}</SelectItem>
                                {allCitiesList.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    </CardContent>
                </Card>

                {isLoading ? (
                    <div className="text-center py-16"><Spinner className="h-8 w-8"/></div>
                ) : filteredRentals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {filteredRentals.map(rental => <RentalCard key={rental.id} rental={rental} t={t} />)}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Tractor className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">{t.rental.noEquipmentFound}</p>
                    </div>
                )}
            </TabsContent>
            <TabsContent value="my-equipment" className="pt-4">
                <div className="flex justify-end mb-4">
                   {userProfile && <AddEquipmentDialog userProfile={userProfile} onEquipmentAdded={fetchRentals} />}
                </div>

                 {isLoading ? (
                    <div className="text-center py-16"><Spinner className="h-8 w-8"/></div>
                ) : myRentals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myRentals.map(rental => <RentalCard key={rental.id} rental={rental} t={t} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <Tractor className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">{t.rental.noMyEquipment}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{t.rental.noMyEquipmentDesc}</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    </div>
  );
}

    