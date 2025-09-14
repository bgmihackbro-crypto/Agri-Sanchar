"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageCircle, Send, Filter, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const initialPosts = [
  {
    id: 1,
    author: "Balwinder Singh",
    avatar: "https://picsum.photos/seed/wheat-field/40/40",
    avatarHint: "wheat field",
    city: "Amritsar",
    crop: "Wheat",
    time: "2 hours ago",
    content:
      "My wheat crop is showing yellow spots on the leaves. What could be the issue? I've attached a photo.",
    image: "https://picsum.photos/seed/wheat-issue/600/400",
    imageHint: "wheat disease",
    likes: 12,
    comments: [
      { author: "AI Expert", content: "This looks like a nitrogen deficiency. Try applying a urea-based fertilizer.", isAi: true },
      { author: "Gurpreet Kaur", content: "I had a similar issue. It was rust disease. Check for orange pustules." },
    ],
  },
  {
    id: 2,
    author: "Rani Devi",
    avatar: "https://picsum.photos/seed/rice-field/40/40",
    avatarHint: "rice field",
    city: "Ludhiana",
    crop: "Rice",
    time: "5 hours ago",
    content: "Sharing a picture of my healthy rice paddy this season! Good rainfall has helped a lot. How is everyone else's crop?",
    image: "https://picsum.photos/seed/rice-paddy/600/400",
    imageHint: "rice paddy",
    likes: 28,
    comments: [
        { author: "Sukhdev Singh", content: "Looks great, Rani ji! My crop is also doing well." },
    ],
  },
];

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

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <Card className="sticky top-20">
            <CardHeader>
              <h3 className="font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" /> Filters
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">City</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="amritsar">Amritsar</SelectItem>
                    <SelectItem value="ludhiana">Ludhiana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Crop Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Crops" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Crops</SelectItem>
                    <SelectItem value="wheat">Wheat</SelectItem>
                    <SelectItem value="rice">Rice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-3/4 space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Create a new post</h3>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="What's on your mind, farmer?" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                <ImageIcon className="mr-2 h-4 w-4" /> Upload Photo
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <Send className="mr-2 h-4 w-4" />
                Post
              </Button>
            </CardFooter>
          </Card>

          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Avatar>
                  <AvatarImage src={post.avatar} data-ai-hint={post.avatarHint} />
                  <AvatarFallback>{post.author.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{post.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.time} • {post.city} • {post.crop}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p>{post.content}</p>
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
                 <div className="flex gap-4">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                        <ThumbsUp className="h-4 w-4" /> {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                        <MessageCircle className="h-4 w-4" /> {post.comments.length} Comments
                    </Button>
                 </div>
              </CardFooter>
              <div className="px-6 pb-4 space-y-3">
                <Separator />
                {post.comments.map((comment, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                             <AvatarImage src={comment.isAi ? '' : 'https://picsum.photos/seed/farm-avatar/40/40'} data-ai-hint="farm icon" />
                            <AvatarFallback>{comment.author.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <div className={`flex-1 p-2 rounded-md ${comment.isAi ? 'bg-primary/10' : 'bg-muted/70'}`}>
                            <p className="font-semibold text-sm">{comment.author}</p>
                            <p className="text-sm text-foreground/80">{comment.content}</p>
                        </div>
                    </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
