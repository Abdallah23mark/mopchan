import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Theme = "classic" | "netscape" | "mopworld";

export default function StyleChooser() {
  const [currentTheme, setCurrentTheme] = useState<Theme>("classic");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) {
      setCurrentTheme(saved);
      applyTheme(saved);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-classic', 'theme-netscape', 'theme-mopworld');
    
    // Add new theme class
    root.classList.add(`theme-${theme}`);
    
    // Apply theme-specific styles
    switch (theme) {
      case "classic":
        root.style.setProperty('--bg-main', '#FFFFEE');
        root.style.setProperty('--bg-post', '#F0F8FF');
        root.style.setProperty('--bg-header', '#FFFFFF');
        root.style.setProperty('--bg-nav', '#E0E0E0');
        root.style.setProperty('--text-main', '#000000');
        root.style.setProperty('--text-green', '#789922');
        root.style.setProperty('--text-quote', '#AA0000');
        root.style.setProperty('--border-color', '#B7B7B7');
        break;
      
      case "netscape":
        root.style.setProperty('--bg-main', '#C0C0C0');
        root.style.setProperty('--bg-post', '#FFFFFF');
        root.style.setProperty('--bg-header', '#C0C0C0');
        root.style.setProperty('--bg-nav', '#C0C0C0');
        root.style.setProperty('--text-main', '#000000');
        root.style.setProperty('--text-green', '#008000');
        root.style.setProperty('--text-quote', '#800000');
        root.style.setProperty('--border-color', '#808080');
        break;
      
      case "mopworld":
        root.style.setProperty('--bg-main', '#87CEEB');
        root.style.setProperty('--bg-post', '#FFFF00');
        root.style.setProperty('--bg-header', '#FF4500');
        root.style.setProperty('--bg-nav', '#FF1493');
        root.style.setProperty('--text-main', '#8B0000');
        root.style.setProperty('--text-green', '#228B22');
        root.style.setProperty('--text-quote', '#8B0000');
        root.style.setProperty('--border-color', '#000000');
        break;
    }
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 right-4 z-40 bg-white/80 hover:bg-white"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Style Chooser</DialogTitle>
        </DialogHeader>
        
        <RadioGroup value={currentTheme} onValueChange={handleThemeChange}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="classic" id="classic" />
              <Label htmlFor="classic" className="cursor-pointer">
                <div>
                  <div className="font-semibold">Classic 4chan</div>
                  <div className="text-sm text-gray-600">Traditional cream and blue styling</div>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="netscape" id="netscape" />
              <Label htmlFor="netscape" className="cursor-pointer">
                <div>
                  <div className="font-semibold">Netscape Retro</div>
                  <div className="text-sm text-gray-600">90s browser aesthetic with gray tones</div>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mopworld" id="mopworld" />
              <Label htmlFor="mopworld" className="cursor-pointer">
                <div>
                  <div className="font-semibold">MOPWORLD Theme Park</div>
                  <div className="text-sm text-gray-600">Vibrant pink and purple carnival styling</div>
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>
        
        <div className="mt-4 text-xs text-gray-600">
          Your theme preference is saved locally and will persist between visits.
        </div>
      </DialogContent>
    </Dialog>
  );
}