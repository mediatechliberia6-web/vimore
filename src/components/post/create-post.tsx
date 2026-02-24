
"use client";

import { useState } from "react";
import { Image as ImageIcon, Smile, Send, Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { aiSuggestHashtags, aiSummarizePost } from "@/app/actions/ai";
import { useToast } from "@/hooks/use-toast";

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
    <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-4 space-y-4">
      <div className="flex gap-4">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src="https://picsum.photos/seed/me/200/200" alt="Me" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <Textarea 
            placeholder="What's happening on ViMore?" 
            className="min-h-[120px] border-none focus-visible:ring-0 text-lg resize-none p-0"
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs" 
                onClick={() => setSuggestedTags([])}
              >
                Clear
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-secondary">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                <Smile className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-accent hover:bg-accent/10 transition-colors"
                onClick={handleEnhance}
                disabled={isEnhancing || !content.trim()}
              >
                {isEnhancing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider">Groq AI Enhance</span>
              </Button>
            </div>
            <Button 
              className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white font-bold gap-2"
              disabled={!content.trim()}
            >
              <Send className="h-4 w-4" />
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
