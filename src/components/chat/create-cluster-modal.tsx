
"use client";

import { useState, useMemo } from "react";
import { 
  X, 
  Search, 
  Check, 
  Users2, 
  Sparkles,
  ChevronRight,
  Plus
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePosts, Connection } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function CreateClusterModal({ children }: { children: React.ReactNode }) {
  const { connections, createCluster, triggerHaptic } = usePosts();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"members" | "identity">("members");
  const [selectedNodes, setSelectedNodes] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [clusterName, setClusterName] = useState("");

  const filteredNodes = useMemo(() => {
    return connections.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [connections, searchQuery]);

  const toggleNode = (node: Connection) => {
    triggerHaptic(10);
    setSelectedNodes(prev => {
      const exists = prev.find(n => n.username === node.username);
      if (exists) return prev.filter(n => n.username !== node.username);
      return [...prev, node];
    });
  };

  const handleCreate = () => {
    if (!clusterName.trim()) return;
    createCluster(clusterName, selectedNodes);
    toast({ title: "Cluster Materialized", description: `${clusterName} is now live.` });
    setIsOpen(false);
    reset();
  };

  const reset = () => {
    setStep("members");
    setSelectedNodes([]);
    setSearchQuery("");
    setClusterName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-t-[3rem] p-0 border-primary/10 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-3xl h-[85vh] flex flex-col top-auto bottom-0 translate-y-0 translate-x-[-50%] overflow-hidden">
        <div className="mx-auto w-12 h-1.5 bg-primary/20 rounded-full mt-4 mb-2 shrink-0" />
        
        <DialogHeader className="px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
              {step === 'members' ? 'Select Nodes' : 'Cluster Identity'}
            </DialogTitle>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>

        {step === 'members' ? (
          <>
            <div className="px-6 pb-4 space-y-4 shrink-0">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
                <Input 
                  placeholder="Search network nodes..." 
                  className="pl-11 h-12 bg-secondary/30 border-none rounded-2xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-3 pb-2">
                  {selectedNodes.map(node => (
                    <div key={node.username} className="relative shrink-0 animate-in zoom-in duration-300">
                      <Avatar className="h-12 w-12 border-2 border-primary shadow-lg">
                        <AvatarImage src={node.avatar} />
                      </Avatar>
                      <button 
                        onClick={() => toggleNode(node)}
                        className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 shadow-md"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {selectedNodes.length === 0 && (
                    <div className="h-12 flex items-center px-4 border border-dashed border-primary/20 rounded-xl text-[10px] font-black uppercase text-muted-foreground/40">
                      No nodes selected
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-3 pb-32">
                {filteredNodes.map((node) => {
                  const isSelected = selectedNodes.some(n => n.username === node.username);
                  return (
                    <button
                      key={node.username}
                      onClick={() => toggleNode(node)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-[1.75rem] transition-all border",
                        isSelected ? "bg-primary/10 border-primary/20" : "bg-secondary/20 border-transparent hover:bg-secondary/40"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-primary/5">
                          <AvatarImage src={node.avatar} />
                        </Avatar>
                        <div className="text-left">
                          <p className="font-bold text-sm leading-none">{node.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black mt-1">@{node.username}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected ? "bg-primary border-primary text-white" : "border-primary/20"
                      )}>
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-[#050505] via-white/95 to-transparent pt-12">
              <Button 
                className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest gap-2 shadow-2xl disabled:opacity-50"
                disabled={selectedNodes.length < 2}
                onClick={() => { triggerHaptic(20); setStep('identity'); }}
              >
                Next Step <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 px-6 space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="relative group">
                <div className="h-32 w-32 rounded-[2.5rem] bg-secondary/40 border-2 border-dashed border-primary/20 flex items-center justify-center relative overflow-hidden group-hover:border-primary/50 transition-all">
                  {selectedNodes.slice(0, 3).map((node, i) => (
                    <div 
                      key={node.username}
                      className="absolute border-2 border-white dark:border-card rounded-full overflow-hidden shadow-xl"
                      style={{ 
                        width: '64px', height: '64px',
                        left: i === 0 ? '10%' : i === 1 ? '40%' : '25%',
                        top: i === 2 ? '40%' : '15%',
                        zIndex: 10 - i
                      }}
                    >
                      <img src={node.avatar} alt="Member" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg ring-4 ring-white dark:ring-[#050505]">
                  <Plus className="h-5 w-5" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Collective Signature</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{selectedNodes.length} Nodes in Cluster</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">Cluster Label</label>
                <Input 
                  placeholder="Project Aura, Design Hub..." 
                  className="h-16 rounded-2xl bg-secondary/30 border-none px-6 font-black italic uppercase text-2xl tracking-tighter focus-visible:ring-primary/20 transition-all"
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  autoFocus
                />
              </div>
              
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-4">
                <Sparkles className="h-5 w-5 text-primary shrink-0" />
                <p className="text-[11px] font-medium leading-relaxed uppercase tracking-tighter text-muted-foreground">
                  Clusters are specialized nodes for high-velocity text and media collaboration. Audio/Video calls are disabled to ensure peak focus.
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
              <Button 
                className="w-full h-16 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em] text-lg shadow-2xl disabled:opacity-50"
                disabled={!clusterName.trim()}
                onClick={handleCreate}
              >
                Materialize Cluster
              </Button>
              <Button variant="ghost" className="w-full text-muted-foreground font-black uppercase text-[10px] tracking-widest" onClick={() => setStep('members')}>
                Back to Selection
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
