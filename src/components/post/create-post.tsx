"use client";

import { useState } from "react";
import { Image as ImageIcon, Sparkles, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { aiSuggestHashtags, aiSummarizePost } from "@/app/actions/ai";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function CreatePost() {
  const [content, setContent] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const { toast } = useToast();

  const handleEnhance = async () => {
    if (!content.trim()) {
      toast({ description: "Please enter some content first!", variant: "destructive" });
      return;
    }

    setIsEnhancing(true);
    try {
      const [hashtagResult, summaryResult] = await Promise.all([
        aiSuggestHashtags({ postContent: content }),
        aiSummarizePost({ postContent: content })
      ]);
      
      setSuggestedTags(hashtagResult.hashtags);
      
      toast({ 
        title: "AI Summary Suggestion", 
        description: summaryResult.summary,
      });

    } catch (error) {
      toast({ 
        description: "Failed to enhance post. Check your Groq API key!", 
        variant: "destructive" 
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const addTag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (!content.includes(cleanTag)) {
      setContent(prev => `${prev.trim()} ${cleanTag} `);
    }
    setSuggestedTags(prev => prev.filter(t => t !== tag));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-primary/10 p-4 space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 border border-primary/10">
          <AvatarImage src="https://picsum.photos/seed/me/200/200" alt="Me" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" className="flex-1 justify-start rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors h-10 px-4 text-sm font-normal">
              What&apos;s on your mind, John?
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden rounded-2xl">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="text-center font-bold text-lg">Create Post</DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://picsum.photos/seed/me/200/200" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-sm">John Doe</p>
                  <Badge variant="secondary" className="text-[10px] px-2 h-5">Public</Badge>
                </div>
              </div>
              <Textarea 
                placeholder="What's on your mind, John?" 
                className="min-h-[150px] border-none focus-visible:ring-0 text-xl resize-none p-0 placeholder:text-muted-foreground/50"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {suggestedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 py-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 w-full mb-1">
                    <Sparkles className="w-3 h-3 text-primary" /> Suggestions:
                  </span>
                  {suggestedTags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-primary hover:text-white transition-colors py-1"
                      onClick={() => addTag(tag)}
                    >
                      #{tag.replace('#', '')}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between p-2 border rounded-xl">
                <span className="text-sm font-bold pl-2">Add to your post</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-green-500 rounded-full h-8 w-8">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-blue-500 rounded-full h-8 w-8">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-accent hover:bg-accent/10 transition-colors h-8"
                    onClick={handleEnhance}
                    disabled={isEnhancing || !content.trim()}
                  >
                    {isEnhancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                className="w-full h-10 font-bold bg-primary hover:bg-primary/90 text-white rounded-lg shadow-lg"
                disabled={!content.trim()}
              >
                Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Separator className="bg-secondary" />

      <div className="flex items-center justify-between px-2">
        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-destructive hover:bg-destructive/5 font-bold text-xs">
          <Video className="h-5 w-5" />
          Live Video
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-green-500 hover:bg-green-50 font-bold text-xs">
          <ImageIcon className="h-5 w-5" />
          Photo/Video
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-amber-500 hover:bg-amber-50 font-bold text-xs">
          <Sparkles className="h-5 w-5" />
          Enhance
        </Button>
      </div>
    </div>
  );
}
