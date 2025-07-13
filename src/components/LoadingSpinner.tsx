export default function LoadingSpinner() {
  return (
    <div className="flex h-10 items-center">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-stone-400 border-t-transparent" />
    </div>
  );
}
