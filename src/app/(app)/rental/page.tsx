
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, PlusCircle, Tractor, Phone, MapPin, IndianRupee, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';
import { getStoredRentals, addRental, type Rental } from '@/lib/firebase/rentals';
import type { UserProfile } from '@/lib/firebase/users';

const AddEquipmentDialog = ({ onRentalAdded, t }: { onRentalAdded: () => void, t: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [priceType, setPriceType] = useState<'day' | 'hour'>('day');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [contact, setContact] = useState('');
    const [address, setAddress] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const profile = localStorage.getItem('userProfile');
        if (profile) {
            const parsed = JSON.parse(profile);
            setUserProfile(parsed);
            setContact(parsed.phone);
            setAddress(parsed.city && parsed.state ? `${parsed.city}, ${parsed.state}` : '');
        }
    }, []);

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

    const resetForm = () => {
        setName('');
        setCategory('');
        setPrice('');
        setDescription('');
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async () => {
        if (!name || !category || !price || !contact || !imageFile || !imagePreview || !userProfile) {
            toast({ variant: 'destructive', title: t.rental.addDialog.incompleteTitle, description: t.rental.addDialog.incompleteDesc });
            return;
        }

        setIsAdding(true);
        try {
            await addRental({
                name,
                category,
                price: parseFloat(price),
                priceType,
                description,
                imageUrl: imagePreview,
                contact,
                location: address,
                ownerId: userProfile.farmerId,
                ownerName: userProfile.name,
                ownerAvatar: userProfile.avatar,
            });
            onRentalAdded();
            toast({ title: t.rental.addDialog.successTitle, description: t.rental.addDialog.successDesc(name) });
            setIsOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error adding rental:", error);
            toast({ variant: 'destructive', title: t.rental.addDialog.errorTitle, description: t.rental.addDialog.errorDesc });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
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
                <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t.rental.addDialog.nameLabel}</Label>
                        <Input id="name" placeholder={t.rental.addDialog.namePlaceholder} value={name} onChange={e => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="category">{t.rental.addDialog.categoryLabel}</Label>
                        <Select onValueChange={setCategory} value={category}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder={t.rental.addDialog.categoryPlaceholder} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tractor">Tractor</SelectItem>
                                <SelectItem value="Harvester">Harvester</SelectItem>
                                <SelectItem value="Plough">Plough</SelectItem>
                                <SelectItem value="Seeder">Seeder</SelectItem>
                                <SelectItem value="Sprayer">Sprayer</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="price">{t.rental.addDialog.priceLabel}</Label>
                        <div className="flex gap-2">
                            <Input id="price" type="number" placeholder="e.g., 1500" value={price} onChange={e => setPrice(e.target.value)} />
                             <Select onValueChange={(v) => setPriceType(v as any)} value={priceType}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">/ {t.rental.day}</SelectItem>
                                    <SelectItem value="hour">/ {t.rental.hour}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">{t.rental.addDialog.descriptionLabel}</Label>
                        <Textarea id="description" placeholder={t.rental.addDialog.descriptionPlaceholder} value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>{t.rental.addDialog.imageLabel}</Label>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                {imagePreview ? (
                                    <div className="relative w-full h-full">
                                        <Image src={imagePreview} alt="Preview" fill className="object-contain rounded-lg p-2" />
                                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={(e) => {e.preventDefault(); setImagePreview(null); setImageFile(null)}}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ImageIcon className="w-8 h-8 mb-4 text-gray-500" />
                                        <p className="mb-2 text-sm text-gray-500">{t.rental.addDialog.imagePlaceholder}</p>
                                    </div>
                                )}
                                <Input id="dropzone-file" type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                            </label>
                        </div> 
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="contact">{t.rental.addDialog.contactLabel}</Label>
                        <Input id="contact" placeholder="e.g., +91 9876543210" value={contact} onChange={e => setContact(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">{t.rental.addDialog.addressLabel}</Label>
                        <Input id="address" placeholder={t.rental.addDialog.addressPlaceholder} value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isAdding}>
                        {isAdding && <Spinner className="mr-2 h-4 w-4" />}
                        {t.rental.addDialog.submit}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function RentalPage() {
    const { t } = useTranslation();
    const [allRentals, setAllRentals] = useState<Rental[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterLocation, setFilterLocation] = useState('all');

    useEffect(() => {
        const profile = localStorage.getItem('userProfile');
        if (profile) {
            setUserProfile(JSON.parse(profile));
            const parsed = JSON.parse(profile);
            if (parsed.city) {
                setFilterLocation(parsed.city);
            }
        }
        fetchRentals();
    }, []);

    const fetchRentals = () => {
        setIsLoading(true);
        const rentals = getStoredRentals();
        setAllRentals(rentals);
        setIsLoading(false);
    };

    const myRentals = useMemo(() => {
        if (!userProfile) return [];
        return allRentals.filter(r => r.ownerId === userProfile.farmerId);
    }, [allRentals, userProfile]);

    const filteredRentals = useMemo(() => {
        return allRentals.filter(rental => {
            const searchMatch = !searchQuery || rental.name.toLowerCase().includes(searchQuery.toLowerCase());
            const categoryMatch = filterCategory === 'all' || rental.category === filterCategory;
            const locationMatch = filterLocation === 'all' || rental.location.toLowerCase().includes(filterLocation.toLowerCase());
            return searchMatch && categoryMatch && locationMatch;
        });
    }, [allRentals, searchQuery, filterCategory, filterLocation]);
    
    const allCategories = useMemo(() => ['all', ...Array.from(new Set(allRentals.map(r => r.category)))], [allRentals]);
    const allLocations = useMemo(() => ['all', ...Array.from(new Set(allRentals.map(r => r.location)))], [allRentals]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">{t.sidebar.rental}</h1>
                <p className="text-muted-foreground">{t.rental.description}</p>
            </div>

            <Tabs defaultValue="browse" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="browse">{t.rental.tabs.browse}</TabsTrigger>
                    <TabsTrigger value="myEquipment">{t.rental.tabs.myEquipment}</TabsTrigger>
                </TabsList>
                <TabsContent value="browse" className="pt-4 space-y-4">
                     <Card>
                        <CardContent className="p-4 flex flex-col md:flex-row gap-2">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder={t.rental.searchPlaceholder} className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Select onValueChange={setFilterCategory} value={filterCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t.rental.filterCategory} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allCategories.map(cat => <SelectItem key={cat} value={cat}>{cat === 'all' ? t.rental.allCategories : cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select onValueChange={setFilterLocation} value={filterLocation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t.rental.filterLocation} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allLocations.map(loc => <SelectItem key={loc} value={loc}>{loc === 'all' ? t.community.allLocations : loc}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {isLoading ? (
                        <div className="text-center py-16"><Spinner /></div>
                    ) : filteredRentals.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredRentals.map(rental => (
                                <Card key={rental.id} className="flex flex-col overflow-hidden">
                                    <div className="aspect-video relative">
                                        <Image src={rental.imageUrl} alt={rental.name} fill className="object-cover" />
                                    </div>
                                    <CardHeader>
                                        <CardTitle>{rental.name}</CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                                            <span className="flex items-center gap-1.5"><Tractor className="h-4 w-4" /> {rental.category}</span>
                                            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {rental.location}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-sm text-muted-foreground line-clamp-2">{rental.description}</p>
                                    </CardContent>
                                    <CardFooter className="flex-col items-stretch gap-3 bg-muted/50 p-4">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-lg flex items-center">
                                                <IndianRupee className="h-5 w-5 mr-1"/>
                                                {rental.price}
                                                <span className="text-xs font-normal text-muted-foreground ml-1">/ {rental.priceType === 'day' ? t.rental.day : t.rental.hour}</span>
                                            </p>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`tel:${rental.contact}`}><Phone className="mr-2 h-4 w-4" />{t.rental.callOwner}</a>
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground">{t.rental.noEquipmentFound}</p>
                        </div>
                    )}
                </TabsContent>
                 <TabsContent value="myEquipment" className="pt-4 space-y-4">
                    <div className="text-right">
                        <AddEquipmentDialog onRentalAdded={fetchRentals} t={t} />
                    </div>

                    {isLoading ? (
                        <div className="text-center py-16"><Spinner /></div>
                    ) : myRentals.length > 0 ? (
                         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {myRentals.map(rental => (
                                <Card key={rental.id} className="flex flex-col overflow-hidden">
                                     <div className="aspect-video relative">
                                        <Image src={rental.imageUrl} alt={rental.name} fill className="object-cover" />
                                    </div>
                                    <CardHeader>
                                        <CardTitle>{rental.name}</CardTitle>
                                         <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                                            <span className="flex items-center gap-1.5"><Tractor className="h-4 w-4" /> {rental.category}</span>
                                        </div>
                                    </CardHeader>
                                     <CardFooter className="bg-muted/50 p-4">
                                        <p className="font-bold text-lg flex items-center w-full">
                                            <IndianRupee className="h-5 w-5 mr-1"/>
                                            {rental.price}
                                            <span className="text-xs font-normal text-muted-foreground ml-1">/ {rental.priceType === 'day' ? t.rental.day : t.rental.hour}</span>
                                        </p>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground font-semibold">{t.rental.noMyEquipment}</p>
                            <p className="text-muted-foreground text-sm">{t.rental.noMyEquipmentDesc}</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

