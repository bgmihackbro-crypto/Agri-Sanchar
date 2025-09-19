

"use client";

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageCircle, Send, Search, Share, Award, PlusCircle, Users, Crown, X, Image as ImageIcon, Video, Repeat, Building, Briefcase, Phone, MessageSquare } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createGroup, getGroups, type Group } from "@/lib/firebase/groups";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Timestamp } from "firebase/firestore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { sendMessage } from "@/lib/firebase/chat";
import { EXPERT_BOT_USER } from "@/lib/firebase/chat";
import { indianCities } from "@/lib/indian-cities";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const allCitiesList = Object.values(indianCities).flat();


const initialPostsData = [
  {
    id: 1,
    author: "Balwinder Singh",
    avatar: "https://picsum.photos/seed/wheat-field/40/40",
    avatarHint: "wheat field",
    location: "Amritsar",
    category: "Pests",
    categoryColor: "bg-red-500",
    time: "2 hours ago",
    title: "What is this on my wheat crop?",
    content:
      "My wheat crop is showing yellow spots on the leaves. What could be the issue? I've attached a photo.",
    image: "https://images.unsplash.com/photo-1529159942819-334f07de4fe5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHx3aGVhdHxlbnwwfHx8fDE3NTgyMjMyMTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "wheat disease",
    mediaType: 'image',
    likes: 12,
    comments: [
      { author: "AI Expert", content: "This looks like a nitrogen deficiency. Try applying a urea-based fertilizer.", isAi: true, isExpert: true, avatar: '' },
      { author: "Gurpreet Kaur", content: "I had a similar issue. It was rust disease. Check for orange pustules.", avatar: 'https://picsum.photos/seed/farm-avatar-2/40/40' },
    ],
  },
  {
    id: 2,
    author: "Rani Devi",
    avatar: "https://picsum.photos/seed/rice-field/40/40",
    avatarHint: "rice field",
    location: "Ludhiana",
    category: "Crops",
    categoryColor: "bg-green-500",
    time: "5 hours ago",
    title: "Healthy rice paddy this season!",
    content: "Sharing a picture of my healthy rice paddy this season! Good rainfall has helped a lot. How is everyone else's crop?",
    image: "https://images.unsplash.com/photo-1635562985686-4f8bb9c0d3bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxyaWNlfGVufDB8fHx8fDE3NTgyMjI4NTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "rice paddy",
    mediaType: 'image',
    likes: 28,
    comments: [
        { author: "Sukhdev Singh", content: "Looks great, Rani ji! My crop is also doing well.", avatar: 'https://picsum.photos/seed/farm-avatar-3/40/40' },
    ],
  },
   {
    id: 3,
    author: "Manpreet Kaur",
    avatar: "https://picsum.photos/seed/tractor-purchase/40/40",
    avatarHint: "tractor",
    location: "Patiala",
    category: "Equipment",
    categoryColor: "bg-blue-500",
    time: "1 day ago",
    title: "Advice on buying a new tractor?",
    content: "I'm planning to buy a new tractor for my 15-acre farm. Any recommendations on brands or models? My budget is around \u20B96 lakh.",
    image: null,
    mediaType: null,
    likes: 18,
    comments: [],
  },
  {
    id: 4,
    author: "Vikram Kumar",
    avatar: "https://picsum.photos/seed/vegetable-farm/40/40",
    avatarHint: "vegetable farm",
    location: "Jalandhar",
    category: "Market",
    categoryColor: "bg-orange-500",
    time: "2 days ago",
    title: "Great prices for tomatoes at Jalandhar mandi!",
    content: "Just sold my tomato harvest at the Jalandhar mandi for a very good price. Demand is high right now. If you have ready produce, now is a good time to sell.",
    image: "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx0b21hdG98ZW58MHx8fHwxNzU4MjIyODIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "tomatoes market",
    mediaType: 'image',
    likes: 45,
    comments: [],
  },
  {
    id: 5,
    author: "Jaswinder Singh",
    avatar: "https://picsum.photos/seed/solar-pump/40/40",
    avatarHint: "solar pump",
    location: "Moga",
    category: "Schemes",
    categoryColor: "bg-purple-500",
    time: "3 days ago",
    title: "Has anyone used the PM-KUSUM scheme for solar pumps?",
    content: "I am thinking of installing a solar water pump on my farm through the PM-KUSUM scheme. Has anyone gone through the process? Is the subsidy helpful?",
    image: "https://images.unsplash.com/photo-1708769659493-f28e3aaadb48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxzb2xhciUyMHdhdGVyJTIwcHVtcHxlbnwwfHx8fDE3NTgyMjMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "solar water pump",
    mediaType: 'image',
    likes: 31,
    comments: [],
  },
  {
    id: 6,
    author: "Harpreet Gill",
    avatar: "https://picsum.photos/seed/potato-crop/40/40",
    avatarHint: "potato crop",
    location: "Hoshiarpur",
    category: "Crops",
    categoryColor: "bg-green-500",
    time: "4 days ago",
    title: "New potato variety showing good results.",
    content: "Tried a new variety of potato this year, 'Kufri Uday'. The yield is much better than the old one. Sharing a photo of the harvest.",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwb3RhdG98ZW58MHx8fHwxNzU4MjIzMzYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "potato harvest",
    mediaType: 'image',
    likes: 52,
    comments: [],
  },
  {
    id: 7,
    author: "Amrita Kaur",
    avatar: "https://picsum.photos/seed/organic-farm/40/40",
    avatarHint: "organic farm",
    location: "Faridkot",
    category: "Fertilizers",
    categoryColor: "bg-yellow-500",
    time: "5 days ago",
    title: "How to make organic fertilizer at home?",
    content: "I want to move to organic farming. Can anyone share some simple methods to prepare jeevamrut or other organic fertilizers at home? Looking for low-cost methods.",
    image: null,
    mediaType: null,
    likes: 25,
    comments: [
        { author: "AI Expert", content: "You can create Jeevamrut using cow dung, cow urine, jaggery, gram flour, and water. Mix them in a drum and let it ferment for 2-7 days.", isAi: true, isExpert: true, avatar: '' }
    ],
  },
  {
    id: 8,
    author: "Sandeep Kumar",
    avatar: "https://picsum.photos/seed/drip-irrigation/40/40",
    avatarHint: "drip irrigation",
    location: "Bathinda",
    category: "Irrigation",
    categoryColor: "bg-cyan-500",
    time: "6 days ago",
    title: "Drip irrigation saved my cotton crop",
    content: "With the low rainfall this year, the drip irrigation system I installed was a lifesaver for my cotton crop. It used much less water and the yield was not affected. Highly recommend it.",
    image: "https://images.unsplash.com/photo-1712471010183-8c30c4511467?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxjb3R0b24lMjBjcm9wfGVufDB8fHx8MTc1ODIyMzQ0NXww&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "cotton crop",
    mediaType: 'image',
    likes: 68,
    comments: [],
  },
  {
    id: 9,
    author: "Anil Kumar",
    avatar: "https://picsum.photos/seed/cotton-pest/40/40",
    avatarHint: "cotton plant",
    location: "Nagpur",
    category: "Pests",
    categoryColor: "bg-red-500",
    time: "1 day ago",
    title: "Whitefly problem in my cotton crop",
    content: "My cotton plants are infested with whiteflies. They are causing the leaves to turn yellow and sticky. What is the best way to control them organically?",
    image: "https://images.unsplash.com/photo-1609211593856-20240d322bcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMnx8Y290dG9uJTIwcGxhbnQlMjB8ZW58MHx8fHwxNzU4MzA0NTAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "cotton pest",
    mediaType: 'image',
    likes: 22,
    comments: [],
  },
  {
    id: 10,
    author: "Sunita Devi",
    avatar: "https://picsum.photos/seed/marigold-farm/40/40",
    avatarHint: "marigold farm",
    location: "Bengaluru",
    category: "Crops",
    categoryColor: "bg-green-500",
    time: "2 days ago",
    title: "Thinking of switching to floriculture. Good idea?",
    content: "I have a 2-acre plot and I am considering growing marigolds instead of vegetables. Is the market good for flowers in Bengaluru? What are the risks?",
    image: "https://images.unsplash.com/photo-1543051932-6ef9fecfbc80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxN3x8ZmFybXxlbnwwfHx8fDE3NTgyOTkzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "marigold farm",
    mediaType: 'image',
    likes: 35,
    comments: [],
  },
  {
    id: 11,
    author: "Rajesh Sharma",
    avatar: "https://picsum.photos/seed/polyhouse/40/40",
    avatarHint: "polyhouse",
    location: "Pune",
    category: "Equipment",
    categoryColor: "bg-blue-500",
    time: "3 days ago",
    title: "Subsidy on polyhouse construction?",
    content: "Does anyone know if there is a government subsidy available for constructing a polyhouse in Maharashtra? I want to grow high-value vegetables.",
    image: "https://images.unsplash.com/photo-1752608277943-e2f36ab66c34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxM3x8cG9seWhvdXNlfGVufDB8fHx8MTc1ODMwNDUyMnww&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "polyhouse farming",
    mediaType: 'image',
    likes: 41,
    comments: [
        { author: "AI Expert", content: "Yes, the National Horticulture Mission (NHM) provides subsidies for polyhouses. You can contact your district's horticulture office for details.", isAi: true, isExpert: true, avatar: '' }
    ],
  },
  {
    id: 12,
    author: "Meena Kumari",
    avatar: "https://picsum.photos/seed/onion-market/40/40",
    avatarHint: "onion market",
    location: "Indore",
    category: "Market",
    categoryColor: "bg-orange-500",
    time: "4 days ago",
    title: "Onion prices are expected to rise",
    content: "I heard from a trader at the Indore mandi that onion prices might go up in the next few weeks due to low supply. Might be a good idea to hold your stock if you can.",
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxvbmlvbnxlbnwwfHx8fDE3NTgzMDQ1NjN8MA&ixlibrb-4.1.0&q=80&w=1080",
    imageHint: "onion market",
    mediaType: 'image',
    likes: 58,
    comments: [],
  },
  {
    id: 13,
    author: "Arjun Reddy",
    avatar: "https://picsum.photos/seed/kcc-card/40/40",
    avatarHint: "credit card",
    location: "Hyderabad",
    category: "Schemes",
    categoryColor: "bg-purple-500",
    time: "5 days ago",
    title: "How to apply for Kisan Credit Card (KCC)?",
    content: "I need some funds to buy seeds and fertilizers for the upcoming season. How can I apply for a Kisan Credit Card? Is the process online?",
    image: null,
    mediaType: null,
    likes: 19,
    comments: [],
  },
  {
    id: 14,
    author: "Priya Singh",
    avatar: "https://picsum.photos/seed/compost/40/40",
    avatarHint: "compost",
    location: "Jaipur",
    category: "Fertilizers",
    categoryColor: "bg-yellow-500",
    time: "6 days ago",
    title: "Is vermicompost better than cow dung manure?",
    content: "I have been using cow dung manure for a long time. I hear a lot about vermicompost now. Is it really better? What are the benefits and costs?",
    image: "https://images.unsplash.com/photo-1635574901622-8014a3ddead5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjb3clMjBkdW5nfGVufDB8fHx8MTc1ODMwNDYyMHww&ixlibrb-4.1.0&q=80&w=1080",
    imageHint: "vermicompost",
    mediaType: 'image',
    likes: 33,
    comments: [],
  },
  {
    id: 15,
    author: "Deepak Bose",
    avatar: "https://picsum.photos/seed/canal-water/40/40",
    avatarHint: "canal water",
    location: "Kolkata",
    category: "Irrigation",
    categoryColor: "bg-cyan-500",
    time: "1 week ago",
    title: "Canal water schedule for this month?",
    content: "Does anyone in the Howrah district have the canal water release schedule for this month? I need to plan my irrigation for my jute crop.",
    image: "https://images.unsplash.com/photo-1688987742688-d32fde871a25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjYW5hbCUyMHdhdGVyfGVufDB8fHx8MTc1ODMwNDY3Mnww&ixlibrb-4.1.0&q=80&w=1080",
    imageHint: "jute irrigation",
    mediaType: 'image',
    likes: 15,
    comments: [],
  },
  {
    id: 16,
    author: "Kavita Patel",
    avatar: "https://picsum.photos/seed/sugarcane/40/40",
    avatarHint: "sugarcane field",
    location: "Lucknow",
    category: "Pests",
    categoryColor: "bg-red-500",
    time: "1 week ago",
    title: "How to control stem borer in sugarcane?",
    content: "My sugarcane crop is under attack from stem borers. The shoots are drying up. Please suggest an effective and safe pesticide.",
    image: "https://images.unsplash.com/photo-1641754644192-24e09c2b444b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxOHx8c3VnYXIlMjBjYW5lYXxlbnwwfHx8fDE3NTgzMDQ5Nzl8MA&ixlibrb-4.1.0&q=80&w=1080",
    imageHint: "sugarcane pest",
    mediaType: 'image',
    likes: 29,
    comments: [],
  },
];

const expertData = [
  {
    id: EXPERT_BOT_USER.id,
    name: EXPERT_BOT_USER.name,
    avatar: "https://picsum.photos/seed/expert-1/80/80",
    specialization: "Agronomy & Soil Science",
    location: "Ludhiana",
    contact: "+91 98765 12345",
    type: "expert",
  },
  {
    id: 'ngo-1',
    name: "Digital Green",
    avatar: "https://picsum.photos/seed/ngo-1/80/80",
    specialization: "Community-led Agricultural Videos",
    location: "Patna",
    contact: "+91 91234 56789",
    type: "ngo",
  },
  {
    id: 'expert-2',
    name: "Dr. Rakesh Kumar",
    avatar: "https://picsum.photos/seed/expert-2/80/80",
    specialization: "Horticulture & Pest Management",
    location: "New Delhi",
    contact: "+91 99887 76655",
    type: "expert",
  },
  {
    id: 'ngo-2',
    name: "Agri-Tech Foundation",
    avatar: "https://picsum.photos/seed/ngo-2/80/80",
    specialization: "Promoting Sustainable Farming",
    location: "Pune",
    contact: "+91 98765 54321",
    type: "ngo",
  },
   {
    id: 'expert-3',
    name: "Dr. Meera Desai",
    avatar: "https://picsum.photos/seed/expert-3/80/80",
    specialization: "Organic Farming & Certification",
    location: "Bengaluru",
    contact: "+91 91122 33445",
    type: "expert",
  },
  {
    id: 'ngo-3',
    name: "Watershed Organisation Trust (WOTR)",
    avatar: "https://picsum.photos/seed/ngo-3/80/80",
    specialization: "Watershed Development & Climate Adaptation",
    location: "Pune",
    contact: "+91 95566 77889",
    type: "ngo",
  },
  {
    id: 'expert-4',
    name: "Dr. Vijay Singh",
    avatar: "https://picsum.photos/seed/expert-4/80/80",
    specialization: "Crops & Fertilizers",
    location: "Hisar",
    contact: "+91 94123 45678",
    type: "expert",
  },
  {
    id: 'ngo-4',
    name: "BAIF Development Research Foundation",
    avatar: "https://picsum.photos/seed/ngo-4/80/80",
    specialization: "Livestock Development & Water Management",
    location: "Pune",
    contact: "+91 98220 12345",
    type: "ngo",
  },
  {
    id: 'expert-5',
    name: "Dr. Aisha Khan",
    avatar: "https://picsum.photos/seed/expert-5/80/80",
    specialization: "Pests & Irrigation",
    location: "Hyderabad",
    contact: "+91 99887 76655",
    type: "expert",
  },
];


const initialGroupsData = [
  { id: 'group-1', name: 'Ludhiana Wheat Farmers', city: 'Ludhiana', description: 'A group for wheat farmers in Ludhiana to discuss best practices.', createdBy: 'Admin', members: ['user-1'] },
  { id: 'group-2', name: 'Jalandhar Potato Growers', city: 'Jalandhar', description: 'Connecting potato growers in the Jalandhar region.', createdBy: 'Admin', members: ['user-2'] },
  { id: 'group-3', name: 'Patiala Dairy Farmers', city: 'Patiala', description: 'Discussions on dairy farming, cattle health, and milk prices.', createdBy: 'Admin', members: ['user-3'] },
  { id: 'group-4', name: 'Organic Farming Pune', city: 'Pune', description: 'A community for organic farmers in and around Pune.', createdBy: 'Admin', members: ['user-4'] },
  { id: 'group-5', name: 'Bengaluru Horticulturists', city: 'Bengaluru', description: 'For farmers growing fruits, vegetables, and flowers in Bengaluru.', createdBy: 'Admin', members: ['user-5'] },
  { id: 'group-6', name: 'Hyderabad Cotton & Chilli', city: 'Hyderabad', description: 'Market trends and farming techniques for cotton and chilli.', createdBy: 'Admin', members: ['user-6'] },
];

type UserProfile = {
    farmerId: string;
    name: string;
    city: string;
    avatar: string;
    state: string;
};

type Comment = {
    author: string;
    content: string;
    isAi?: boolean;
    isExpert?: boolean;
    avatar: string;
};

type Post = (typeof initialPostsData)[0] & { originalAuthor?: string };


const ShareDialog = ({ post, groups, userProfile, onPostCreated }: { post: Post, groups: Group[], userProfile: UserProfile | null, onPostCreated: (post: Post) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const { toast } = useToast();

    const handleShareToGroup = async () => {
        if (!selectedGroup || !userProfile) {
            toast({ variant: 'destructive', title: 'Selection required', description: 'Please select a group to share.' });
            return;
        }
        setIsSharing(true);
        try {
            const postContent = `Shared Post by ${post.author}:\n\n*${post.title}*\n${post.content}`;
            
            await sendMessage({
                groupId: selectedGroup,
                author: {
                    id: userProfile.farmerId,
                    name: userProfile.name,
                    avatar: userProfile.avatar,
                },
                text: postContent,
                file: null, // File sharing in chat not implemented in this flow
                onProgress: () => {},
            });

            toast({ title: 'Post Shared!', description: `The post "${post.title}" has been shared.` });
            setIsOpen(false);

        } catch (error) {
            console.error("Error sharing post:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not share the post.' });
        } finally {
            setIsSharing(false);
        }
    };
    
    const handleSocialShare = (platform: 'whatsapp' | 'facebook') => {
        const text = `Check out this post from Agri-Sanchar:\n\n*${post.title}*\n${post.content}`;
        const encodedText = encodeURIComponent(text);
        
        let url = '';
        if (platform === 'whatsapp') {
            url = `https://wa.me/?text=${encodedText}`;
        } else if (platform === 'facebook') {
            const appUrl = "https://play.google.com/store/apps/details?id=com.firebase.studio"; 
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodedText}`;
        }
        
        window.open(url, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
    }
    
    const handleShareToFeed = () => {
        if (!userProfile) return;

        const repost: Post = {
            ...post, // Copy original post properties
            id: Date.now(), // New ID
            author: userProfile.name, // Repost is by the current user
            avatar: userProfile.avatar,
            location: userProfile.city,
            time: "Just now",
            likes: 0,
            comments: [],
            originalAuthor: post.author, // Add reference to original author
            title: post.title, // Keep original title for repost context
            content: post.content // Keep original content
        };

        onPostCreated(repost);
        toast({ title: "Post Shared!", description: "You have shared this post to your feed." });
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                    <Share className="h-4 w-4" /> Share
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <Card className="bg-muted/50">
                        <CardHeader className="p-4">
                            <p className="font-semibold">{post.title}</p>
                            <p className="text-xs text-muted-foreground">by {post.author}</p>
                        </CardHeader>
                    </Card>

                    <Button onClick={handleShareToFeed} className="w-full">
                        <Repeat className="mr-2 h-4 w-4" /> Share to Feed
                    </Button>

                    <div className="relative">
                        <Separator />
                        <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-popover px-2 text-xs text-muted-foreground">OR</span>
                    </div>

                     <div>
                        <Label>Share to a local group</Label>
                        <div className="flex gap-2 mt-2">
                             <Select onValueChange={setSelectedGroup} value={selectedGroup}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a group..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {groups.length > 0 ? groups.map(group => (
                                        <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                                    )) : <p className="p-4 text-sm text-muted-foreground">You are not in any groups.</p>}
                                </SelectContent>
                            </Select>
                             <Button onClick={handleShareToGroup} disabled={isSharing || !selectedGroup}>
                                {isSharing ? <Spinner className="mr-2 h-4 w-4" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <Separator />
                        <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-popover px-2 text-xs text-muted-foreground">OR</span>
                    </div>

                    <div>
                        <Label>Share on social media</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                             <Button variant="outline" className="bg-[#25D366] hover:bg-[#25D366]/90 text-white" onClick={() => handleSocialShare('whatsapp')}>
                                WhatsApp
                            </Button>
                            <Button variant="outline" className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white" onClick={() => handleSocialShare('facebook')}>
                                Facebook
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const PostCard = ({ post, onLike, onComment, userProfile, groups, onPostCreated, isGrid = false }: { post: Post, onLike: (id: number) => void; onComment: (id: number, comment: Comment) => void; userProfile: UserProfile | null; groups: Group[]; onPostCreated: (post: Post) => void; isGrid?: boolean; }) => {
    const [commentText, setCommentText] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    
    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !userProfile) return;
        onComment(post.id, {
            author: userProfile.name,
            content: commentText,
            avatar: userProfile.avatar,
        });
        setCommentText("");
    };
    
    const renderMedia = (p: Post) => {
      if (!p.image) return null;
      
      const mediaType = p.mediaType || 'image';

      return (
         <div className={cn("mt-2 rounded-lg overflow-hidden border", isGrid ? 'aspect-square' : '')}>
           {mediaType.startsWith('image') ? (
              <Image
                src={p.image}
                alt={p.title || 'Post image'}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                data-ai-hint={p.imageHint}
              />
           ) : (
             <video src={p.image} className="w-full h-auto" controls />
           )}
         </div>
      );
    }

    if (isGrid) {
        return (
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                     {renderMedia(post) ? renderMedia(post) : (
                         <div className="p-4 aspect-square">
                             <h4 className="font-semibold mb-1 line-clamp-2">{post.title}</h4>
                             <p className="text-xs text-muted-foreground line-clamp-4">{post.content}</p>
                         </div>
                     )}
                </CardContent>
            </Card>
        )
    }

    return (
    <Card className="animate-fade-in-up">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src={post.avatar} data-ai-hint={post.avatarHint} />
          <AvatarFallback>{post.author.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-sm">{post.author}</p>
              <p className="text-xs text-muted-foreground">
                {post.time} • {post.location}
              </p>
            </div>
             {post.originalAuthor ? (
                 <Badge variant="secondary" className="text-xs">
                    <Repeat className="h-3 w-3 mr-1.5"/>
                    Shared
                </Badge>
             ) : (
                <Badge className={`${post.categoryColor} text-white text-xs`}>{post.category}</Badge>
             )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-2 pt-0">
         {post.originalAuthor ? (
            <>
                <p className="text-sm text-muted-foreground mb-2">Shared from <span className="font-semibold text-foreground">{post.originalAuthor}</span></p>
                <Card className="p-3 bg-muted/50">
                    <h4 className="font-semibold mb-1 text-sm">{post.title}</h4>
                    <p className="text-xs text-muted-foreground">{post.content}</p>
                    {renderMedia(post)}
                </Card>
            </>
         ) : (
            <>
                <h4 className="font-semibold mb-1">{post.title}</h4>
                <p className={cn("text-sm text-muted-foreground", !isExpanded && "line-clamp-2")}>{post.content}</p>
                {post.content.length > 100 && (
                     <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-primary font-semibold mt-1">
                        {isExpanded ? "Read less" : "Read more"}
                    </button>
                )}
                {renderMedia(post)}
            </>
         )}
      </CardContent>
      <CardFooter className="flex items-center justify-between p-2">
         <div className="flex">
            <Button variant="ghost" size="sm" onClick={() => onLike(post.id)} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
                <ThumbsUp className="h-4 w-4" /> <span className="text-xs">{post.likes}</span>
            </Button>
            <CollapsibleTrigger asChild>
                 <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
                    <MessageCircle className="h-4 w-4" /> <span className="text-xs">{post.comments.length}</span>
                </Button>
            </CollapsibleTrigger>
            <ShareDialog post={post} groups={groups} userProfile={userProfile} onPostCreated={onPostCreated} />
         </div>
      </CardFooter>
        <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3 border-t pt-3">
                {post.comments.length > 0 && (
                <div className="space-y-3">
                    {post.comments.map((comment, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.isAi ? '' : comment.avatar} data-ai-hint="farm icon" />
                                <AvatarFallback>{comment.author.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <div className={`flex-1 p-2 rounded-md text-sm ${comment.isAi ? 'bg-primary/10' : 'bg-muted/70'}`}>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">{comment.author}</p>
                                    {comment.isExpert && <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200"><Award className="h-3 w-3 mr-1"/>Expert</Badge>}
                                </div>
                                <p className="text-foreground/80 text-xs">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
                )}
                {userProfile && (
                        <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={userProfile.avatar} />
                                <AvatarFallback>{userProfile.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <Input 
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="h-9 text-xs"
                            />
                            <Button type="submit" size="icon" className="h-9 w-9" disabled={!commentText.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    )}
            </div>
      </CollapsibleContent>
    </Card>
    );
};

const CreateGroupDialog = ({ onGroupCreated }: { onGroupCreated: () => void }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [city, setCity] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const profile = localStorage.getItem('userProfile');
        if (profile) {
            const parsed = JSON.parse(profile);
            setUserProfile(parsed);
            if (parsed.city) {
                setCity(parsed.city);
            }
        }
    }, []);

    const handleSubmit = () => {
        if (!name.trim() || !city || !userProfile?.farmerId) {
            toast({
                variant: "destructive",
                title: "Incomplete Information",
                description: "Group Name and City are required.",
            });
            return;
        }
        setIsCreating(true);

        try {
            const newGroupData = {
                name,
                description,
                city: city,
                ownerId: userProfile.farmerId,
                members: [userProfile.farmerId],
                createdBy: userProfile.name,
                avatarUrl: `https://picsum.photos/seed/${name.replace(/\s/g, '-')}/100/100`
            };
            const newGroup = createGroup(newGroupData);
            onGroupCreated();
            toast({
                title: "Group Created!",
                description: `The "${newGroup.name}" group is now active.`,
            });
            setIsOpen(false);
            setName('');
            setDescription('');
            setCity(userProfile?.city || '');
            router.push(`/community/${newGroup.id}`);
        } catch (error) {
            console.error("Error creating group:", error);
            toast({
                variant: 'destructive',
                title: "Failed to Create Group",
                description: "There was a problem creating the group. Please try again.",
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Group
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create a Local Group</DialogTitle>
                    <DialogDescription>
                        Start a new community group for farmers in your area.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Group Name
                        </Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g., Ludhiana Wheat Growers" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="city" className="text-right">
                            City
                        </Label>
                        <div className="col-span-3">
                            <Select onValueChange={setCity} value={city}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a city..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCitiesList.sort().map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="A short description of your group's purpose." />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={isCreating || !name.trim() || !city}>
                        {isCreating && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Create Group
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const NewPostDialog = ({ userProfile, onPostCreated }: { userProfile: UserProfile | null, onPostCreated: (post: Post) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setMediaFile(null);
        setMediaPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePostSubmit = () => {
        if (!title.trim() || !content.trim() || !userProfile) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a title and content for your post.' });
            return;
        }

        setIsPosting(true);
        // Simulate posting delay and file processing
        setTimeout(() => {
            const newPost: Post = {
                id: Date.now(),
                author: userProfile.name,
                avatar: userProfile.avatar,
                location: userProfile.city,
                category: "General", // Default category
                categoryColor: "bg-gray-500",
                time: "Just now",
                title,
                content,
                image: mediaPreview, // The URL.createObjectURL result
                mediaType: mediaFile?.type ?? null,
                imageHint: 'user post',
                likes: 0,
                comments: [],
            };

            onPostCreated(newPost);
            toast({ title: "Post Created!", description: "Your post is now live in the community feed." });
            
            setIsPosting(false);
            setIsOpen(false);
            resetForm();

        }, 1500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
                 <Button className="bg-primary hover:bg-primary/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Post
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Post</DialogTitle>
                    <DialogDescription>Share your thoughts, questions, or success with the community.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <Input placeholder="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isPosting}/>
                    <Textarea placeholder="What's on your mind?" value={content} onChange={(e) => setContent(e.target.value)} rows={5} disabled={isPosting} />

                    {mediaPreview && (
                        <div className="relative border rounded-lg overflow-hidden">
                             {mediaFile?.type.startsWith('image/') ? (
                                <Image src={mediaPreview} alt="Media preview" width={500} height={300} className="w-full h-auto object-cover"/>
                             ) : (
                                <video src={mediaPreview} controls className="w-full h-auto"/>
                             )}
                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full" onClick={() => { setMediaFile(null); setMediaPreview(null); }}>
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                    )}
                </div>
                <DialogFooter className="justify-between sm:justify-between">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isPosting}>
                        <ImageIcon className="mr-2 h-4 w-4"/>
                        Photo/Video
                    </Button>
                     <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*"/>
                    <Button onClick={handlePostSubmit} disabled={isPosting || !title.trim() || !content.trim()}>
                        {isPosting && <Spinner className="mr-2 h-4 w-4"/>}
                        {isPosting ? 'Posting...' : 'Post'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function CommunityPage() {
  const [posts, setPosts] = useState<(Post)[]>(initialPostsData);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const { toast } = useToast();
  const router = useRouter();


  const fetchGroups = () => {
        setIsLoadingGroups(true);
        try {
            const allGroups = getGroups();
            if (!localStorage.getItem('groups')) {
                // If local storage is empty, populate with initial data
                initialGroupsData.forEach(groupData => {
                    const newGroupData = {
                        ...groupData,
                        ownerId: 'admin-user',
                        avatarUrl: `https://picsum.photos/seed/${groupData.name.replace(/\s/g, '-')}/100/100`
                    };
                    createGroup(newGroupData);
                });
                setGroups(getGroups());
            } else {
                 setGroups(allGroups);
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setIsLoadingGroups(false);
        }
    };

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
        setUserProfile(JSON.parse(profile));
    }

    fetchGroups();

    // Listen for storage changes to update the group list in real-time
    window.addEventListener('storage', fetchGroups);
    return () => {
        window.removeEventListener('storage', fetchGroups);
    };

  }, []);
  
  const handleGroupCreated = () => {
      fetchGroups();
  }

  const handleNewPost = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };
  
  const handleLike = (postId: number) => {
        setPosts(prevPosts =>
            prevPosts.map(p => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
        );
    };

    const handleComment = (postId: number, newComment: Comment) => {
        setPosts(prevPosts =>
            prevPosts.map(p =>
                p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
            )
        );
    };

  const isProfileComplete = !!(userProfile?.state && userProfile.city);

  const userGroups = groups.filter(g => userProfile && g.members.includes(userProfile.farmerId));

  const myPosts = posts.filter(p => userProfile && p.author === userProfile.name);

  const filteredPosts = posts.filter(post => {
      const categoryMatch = filterCategory === 'all' || post.category === filterCategory;
      const cityMatch = filterCity === 'all' || post.location === filterCity;
      const searchMatch = !searchQuery || 
                          post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && cityMatch && searchMatch;
  });

  const filteredGroups = groups.filter(group => {
      const cityMatch = filterCity === 'all' || group.city === filterCity;
      const searchMatch = !searchQuery || 
                          group.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return cityMatch && searchMatch;
  });

  const filteredExperts = expertData.filter(expert => {
      const categoryMatch = filterCategory === 'all' || expert.specialization.toLowerCase().includes(filterCategory.toLowerCase());
      const cityMatch = filterCity === 'all' || expert.location === filterCity;
      const searchMatch = !searchQuery || 
                          expert.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          expert.specialization.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && cityMatch && searchMatch;
  });

  // Effect to handle automatic tab switching based on search results
  useEffect(() => {
    if (!searchQuery) return;

    const resultsCount = {
        home: filteredPosts.length,
        local: filteredGroups.length,
        experts: filteredExperts.length
    };
    
    // Don't switch if the current tab already has results
    if (resultsCount[activeTab as keyof typeof resultsCount] > 0) {
        return;
    }

    // Find the tab with the most results
    let maxResults = 0;
    let bestTab = activeTab;

    for (const [tab, count] of Object.entries(resultsCount)) {
        if (count > maxResults) {
            maxResults = count;
            bestTab = tab;
        }
    }

    if (bestTab !== activeTab) {
        setActiveTab(bestTab);
    }
  }, [searchQuery, filteredPosts.length, filteredGroups.length, filteredExperts.length, activeTab]);


  const allCategories = ['all', ...Array.from(new Set(initialPostsData.map(p => p.category)))];
  const allCities = ['all', ...Array.from(new Set([...initialPostsData.map(p => p.location), ...expertData.map(e => e.location), ...initialGroupsData.map(g => g.city)]))];

  const handleChat = (expert: (typeof expertData)[0]) => {
      if (!userProfile) {
          toast({ variant: 'destructive', title: "Login required", description: "You need to be logged in to connect with experts." });
          return;
      }

      toast({ title: "Creating Chat...", description: `Preparing a direct chat with ${expert.name}.` });

      // Create a "group" that represents a direct message channel
      const dmGroupId = `dm-${userProfile.farmerId}-${expert.id}`;
      const existingDm = getGroups().find(g => g.id === dmGroupId);

      if (existingDm) {
          router.push(`/community/${dmGroupId}`);
          return;
      }

      const newDmGroup = createGroup({
          id: dmGroupId, // Use a predictable ID for DMs
          name: `Chat with ${expert.name}`,
          description: `Direct message channel between ${userProfile.name} and ${expert.name}.`,
          city: userProfile.city,
          ownerId: userProfile.farmerId,
          members: [userProfile.farmerId, expert.id],
          createdBy: userProfile.name,
          avatarUrl: expert.avatar,
      });

      handleGroupCreated();
      router.push(`/community/${newDmGroup.id}`);
  };


  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Community Forum</h1>
        <p className="text-muted-foreground">
          Connect with other farmers, ask questions, and share your knowledge.
        </p>
      </div>

       <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search in a community" 
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <NewPostDialog userProfile={userProfile} onPostCreated={handleNewPost} />
            </div>
             <div className="flex flex-col md:flex-row gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by Topic" />
                    </SelectTrigger>
                    <SelectContent>
                        {allCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat === 'all' ? 'All Topics' : cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterCity} onValueChange={setFilterCity}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by Location" />
                    </SelectTrigger>
                    <SelectContent>
                        {allCities.map(city => (
                             <SelectItem key={city} value={city}>{city === 'all' ? 'All Locations' : city}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
        </div>


       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="home">Home Feed</TabsTrigger>
                <TabsTrigger value="myposts">My Posts ({myPosts.length})</TabsTrigger>
                <TabsTrigger value="local">Discover Groups</TabsTrigger>
                <TabsTrigger value="experts">Expert &amp; NGOs</TabsTrigger>
            </TabsList>
            <TabsContent value="home" className="pt-4">
                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPosts.map((post) => (
                           <Collapsible key={post.id} asChild>
                             <PostCard post={post} onLike={handleLike} onComment={handleComment} userProfile={userProfile} groups={userGroups} onPostCreated={handleNewPost} isGrid={true} />
                           </Collapsible>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground pt-8">No posts found for the selected filters.</p>
                )}
            </TabsContent>
            <TabsContent value="myposts" className="space-y-4 pt-4">
                {myPosts.length > 0 ? (
                    myPosts.map((post) => (
                         <Collapsible key={post.id} asChild>
                            <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} userProfile={userProfile} groups={userGroups} onPostCreated={handleNewPost} />
                        </Collapsible>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground pt-8">You haven't created any posts yet.</p>
                )}
            </TabsContent>
             <TabsContent value="local" className="pt-4 space-y-4">
                <div className="flex justify-end">
                    {isProfileComplete ? (
                        <CreateGroupDialog onGroupCreated={handleGroupCreated} />
                    ) : (
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" asChild>
                                        <Link href="/profile">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Create New Group
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Please complete your profile (State and City) to create a group.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                {isLoadingGroups ? (
                    <div className="flex justify-center items-center py-16"><Spinner className="h-8 w-8" /><p className="ml-2">Loading groups...</p></div>
                ) : filteredGroups.length === 0 ? (
                    <p className="text-center text-muted-foreground pt-8">No local groups match the current filters.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                    {filteredGroups.map(group => (
                        <Card key={group.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{group.name}</CardTitle>
                                        <div className="text-sm text-muted-foreground">
                                          <span>{group.city}</span>
                                          <span className="mx-1">•</span>
                                          <span className="flex items-center gap-1.5 -ml-1">
                                             <Crown className="h-4 w-4 text-amber-500"/>
                                             {group.createdBy}
                                          </span>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Users className="h-3 w-3"/>
                                        {group.members.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">{group.description || "No description available."}</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/community/${group.id}`}>Open Chat</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    </div>
                )}
             </TabsContent>
            <TabsContent value="experts" className="pt-4 space-y-4">
                 <div className="grid gap-4 md:grid-cols-2">
                    {filteredExperts.length > 0 ? filteredExperts.map(expert => (
                         <Card key={expert.id}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={expert.avatar} />
                                    <AvatarFallback>{expert.name.substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        {expert.name}
                                        <Badge variant="outline" className={expert.type === 'expert' ? 'border-blue-500 text-blue-600' : 'border-green-500 text-green-600'}>
                                            {expert.type === 'expert' ? <Briefcase className="h-3 w-3 mr-1" /> : <Building className="h-3 w-3 mr-1" />}
                                            {expert.type === 'expert' ? 'Expert' : 'NGO'}
                                        </Badge>
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">{expert.specialization}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p className="text-muted-foreground"><span className="font-semibold text-foreground">Location:</span> {expert.location}</p>
                                <p className="text-muted-foreground"><span className="font-semibold text-foreground">Contact:</span> {expert.contact}</p>
                            </CardContent>
                            <CardFooter className="grid grid-cols-2 gap-2">
                                <Button variant="outline" asChild>
                                    <a href={`tel:${expert.contact.replace(/\s/g, '')}`}>
                                      <Phone className="mr-2 h-4 w-4" /> Call
                                    </a>
                                </Button>
                                <Button onClick={() => handleChat(expert)}>
                                    <MessageSquare className="mr-2 h-4 w-4"/> Chat
                                </Button>
                            </CardFooter>
                        </Card>
                    )) : (
                        <p className="text-center text-muted-foreground pt-8 md:col-span-2">No experts or NGOs match the current filters.</p>
                    )}
                 </div>
            </TabsContent>
        </Tabs>

    </div>
  );
}
