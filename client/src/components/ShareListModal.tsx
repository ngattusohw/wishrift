import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Link, Mail, Facebook, Twitter, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ShareListModalProps {
  shareUrl: string;
  wishlistTitle: string;
  children: React.ReactNode;
}

const ShareListModal = ({ shareUrl, wishlistTitle, children }: ShareListModalProps) => {
  const [open, setOpen] = useState(false);
  const [copied, copy] = useCopyToClipboard();
  const { toast } = useToast();

  const handleCopy = () => {
    copy(shareUrl);
    toast({
      title: "Link copied!",
      description: "The wishlist link has been copied to your clipboard.",
    });
  };

  const handleShare = (platform: string) => {
    let shareLink = "";
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(`Check out my wishlist: ${wishlistTitle}`);

    switch (platform) {
      case "email":
        shareLink = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareLink, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Wishlist</DialogTitle>
          <DialogDescription>
            Share this wishlist link with friends and family.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <label htmlFor="share-link" className="sr-only">
              Link
            </label>
            <Input
              id="share-link"
              value={shareUrl}
              readOnly
              className="h-10"
            />
          </div>
          <Button
            type="button" 
            size="sm"
            className="px-3" 
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copy</span>
          </Button>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => handleShare("email")}
          >
            <Mail className="h-5 w-5" />
            <span className="sr-only">Share via Email</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 text-blue-600"
            onClick={() => handleShare("facebook")}
          >
            <Facebook className="h-5 w-5" />
            <span className="sr-only">Share on Facebook</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 text-sky-500"
            onClick={() => handleShare("twitter")}
          >
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Share on Twitter</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 text-blue-700"
            onClick={() => handleShare("linkedin")}
          >
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">Share on LinkedIn</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareListModal;
