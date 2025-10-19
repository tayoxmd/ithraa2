import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <p className="mb-8 text-2xl text-foreground">
          {t({
            ar: "عذراً! الصفحة غير موجودة",
            en: "Oops! Page not found"
          })}
        </p>
        <Link to="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            {t({
              ar: "العودة للصفحة الرئيسية",
              en: "Return to Home"
            })}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
