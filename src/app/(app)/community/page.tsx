
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageCircle, Send, Filter, Image as ImageIcon, Search, Share, Award } from "lucide-react";
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

export default function CommunityPage() {
  const [posts, setPosts] = useState(initialPosts);

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
             <TabsContent value="local" className="pt-4">
                <p className="text-center text-muted-foreground">Local, city-based groups will be shown here.</p>
            </TabsContent>
        </Tabs>

    </div>
  );
}

    