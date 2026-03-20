export default function ReelsLoading() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        <p className="text-white/60 text-sm font-bold uppercase tracking-widest">Loading Reels</p>
      </div>
    </div>
  );
}
