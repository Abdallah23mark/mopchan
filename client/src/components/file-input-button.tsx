import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface FileInputButtonProps {
  accept?: string;
  onChange: (file: File | null) => void;
  className?: string;
  children: React.ReactNode;
}

export default function FileInputButton({ accept, onChange, className, children }: FileInputButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept || "image/*,.webm"}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        className={className}
      >
        {children}
      </Button>
    </>
  );
}