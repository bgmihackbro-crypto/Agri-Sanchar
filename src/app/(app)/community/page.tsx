
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageCircle, Send, Filter, Image as ImageIcon, Search, Share, Award, PlusCircle, Users, Crown } from "lucide-react";
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

const initialPosts = [
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
    image: "https://picsum.photos/seed/wheat-issue/600/400",
    imageHint: "wheat disease",
    likes: 12,
    comments: [
      { author: "AI Expert", content: "This looks like a nitrogen deficiency. Try applying a urea-based fertilizer.", isAi: true, isExpert: true },
      { author: "Gurpreet Kaur", content: "I had a similar issue. It was rust disease. Check for orange pustules." },
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
    image: "https://picsum.photos/seed/rice-paddy/600/400",
    imageHint: "rice paddy",
    likes: 28,
    comments: [
        { author: "Sukhdev Singh", content: "Looks great, Rani ji! My crop is also doing well." },
    ],
  },
];

type UserProfile = {
    farmerId: string;
    name: string;
    city: string;
    avatar: string;
};


const PostCard = ({ post }: { post: (typeof initialPosts)[0] }) => (
    <Card className="animate-fade-in-up">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Avatar>
          <AvatarImage src={post.avatar} data-ai-hint={post.avatarHint} />
          <AvatarFallback>{post.author.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{post.author}</p>
              <p className="text-xs text-muted-foreground">
                {post.time} • {post.location}
              </p>
            </div>
             <Badge className={`${post.categoryColor} text-white`}>{post.category}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="font-semibold mb-2">{post.title}</h4>
        <p className="text-sm text-muted-foreground">{post.content}</p>
        {post.image && (
          <div className="mt-4 rounded-lg overflow-hidden border">
            <Image
              src={post.image}
              alt="Crop issue"
              width={600}
              height={400}
              className="w-full h-auto"
              data-ai-hint={post.imageHint}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
         <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <ThumbsUp className="h-4 w-4" /> {post.likes}
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <MessageCircle className="h-4 w-4" /> {post.comments.length}
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <Share className="h-4 w-4" /> Share
            </Button>
         </div>
      </CardFooter>
      {post.comments.length > 0 && (
          <div className="px-6 pb-4 space-y-3">
            <Separator />
            {post.comments.map((comment, index) => (
                <div key={index} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.isAi ? '' : 'https://picsum.photos/seed/farm-avatar/40/40'} data-ai-hint="farm icon" />
                        <AvatarFallback>{comment.author.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 p-2 rounded-md text-sm ${comment.isAi ? 'bg-primary/10' : 'bg-muted/70'}`}>
                        <div className="flex items-center gap-2">
                            <p className="font-semibold">{comment.author}</p>
                             {comment.isExpert && <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200"><Award className="h-3 w-3 mr-1"/>Expert Answer</Badge>}
                        </div>
                        <p className="text-foreground/80">{comment.content}</p>
                    </div>
                </div>
            ))}
          </div>
      )}
    </Card>
);

const CreateGroupDialog = ({ onGroupCreated, userProfile }: { onGroupCreated: (newGroup: Group) => void, userProfile: UserProfile | null }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!name.trim() || !userProfile?.farmerId || !userProfile?.city) {
             toast({
                variant: "destructive",
                title: "Incomplete Profile",
                description: "Your profile must have a Farmer ID and City to create a group. Please also provide a group name.",
            });
            return;
        }
        setIsLoading(true);

        const newGroupData = {
            name,
            description,
            city: userProfile.city,
            ownerId: userProfile.farmerId,
            members: [userProfile.farmerId],
            createdBy: userProfile.name,
        };

        try {
            const newGroup = await createGroup(newGroupData);
            onGroupCreated(newGroup); // Optimistically update UI
            toast({
                title: "Group Created!",
                description: `The "${newGroupData.name}" group is now active.`,
            });
            setIsOpen(false);
            setName('');
            setDescription('');
        } catch (error) {
            console.error("Error creating group:", error);
            toast({
                variant: 'destructive',
                title: "Failed to Create Group",
                description: "There was a problem creating the group. Please try again.",
            });
        } finally {
            setIsLoading(false);
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
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="A short description of your group's purpose." />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={isLoading || !name.trim()}>
                        {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Create Group
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function CommunityPage() {
  const [posts] = useState(initialPosts);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
        setUserProfile(JSON.parse(profile));
    }

    const fetchGroups = async () => {
        setIsLoadingGroups(true);
        try {
            const fetchedGroups = await getGroups();
            setGroups(fetchedGroups);
        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setIsLoadingGroups(false);
        }
    };
    fetchGroups();
  }, []);
  
  const handleGroupCreated = (newGroup: Group) => {
      setGroups(prev => [newGroup, ...prev]);
  }

  const renderGroupButton = (group: Group) => {
    if (!userProfile || !userProfile.farmerId) return null;

    const isOwner = group.ownerId === userProfile.farmerId;
    
    let buttonText = "Open Chat";
    let buttonVariant: "default" | "secondary" | "outline" = "default";

    if (isOwner) {
        buttonText = "Manage & Chat";
        buttonVariant = "secondary";
    }

    return (
        <Button asChild className="w-full" variant={buttonVariant}>
            <Link href={`/community/${group.id}`}>{buttonText}</Link>
        </Button>
    )
  }


  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Community Forum</h1>
        <p className="text-muted-foreground">
          Connect with other farmers, ask questions, and share your knowledge.
        </p>
      </div>

       <div className="flex items-center gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search community..." className="pl-9" />
            </div>
            <Button className="bg-primary hover:bg-primary/90">
                <Send className="mr-2 h-4 w-4" />
                New Post
            </Button>
        </div>


       <Tabs defaultValue="home" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="home">Home Feed</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="myposts">My Posts</TabsTrigger>
                <TabsTrigger value="local">Local Groups</TabsTrigger>
            </TabsList>
            <TabsContent value="home" className="space-y-4 pt-4">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </TabsContent>
            <TabsContent value="categories" className="pt-4">
                <p className="text-center text-muted-foreground">Category filters will be available here.</p>
            </TabsContent>
             <TabsContent value="myposts" className="pt-4">
                <p className="text-center text-muted-foreground">Posts you have created will appear here.</p>
            </TabsContent>
             <TabsContent value="local" className="pt-4 space-y-4">
                <div className="flex justify-end">
                    <CreateGroupDialog onGroupCreated={handleGroupCreated} userProfile={userProfile} />
                </div>
                {isLoadingGroups ? (
                    <div className="flex justify-center items-center py-16"><Spinner className="h-8 w-8" /><p className="ml-2">Loading groups...</p></div>
                ) : groups.length === 0 ? (
                    <p className="text-center text-muted-foreground pt-8">No local groups yet. Why not create one?</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                    {groups.map(group => (
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
                                {renderGroupButton(group)}
                            </CardFooter>
                        </Card>
                    ))}
                    </div>
                )}
             </TabsContent>
        </Tabs>

    </div>
  );
}
