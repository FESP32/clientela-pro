import { QrCode } from "lucide-react";
import { Button } from "../ui/button";

export default function MobileQRButton({
  title,
  viewPath,
  onShowLink,
  className,
}: {
  title: string;
  viewPath: string;
  onShowLink: (title: string, path: string) => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      aria-label={`Show QR for ${title}`}
      aria-haspopup="dialog"
      onClick={() => onShowLink(title, viewPath)}
      variant="secondary"
      className={`md:hidden h-11 px-4 rounded-full shadow-sm active:scale-[0.98] ${
        className ?? ""
      }`}
    >
      <QrCode className="h-5 w-5 mr-2" />
      Show QR
    </Button>
  );
}
