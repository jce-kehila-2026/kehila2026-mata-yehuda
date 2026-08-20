import { useEffect } from "react";
function ServicesPage() {
  useEffect(() => {
    document.title = "שירותים לוותיקים במטה יהודה | ותיקי מטה יהודה";
  
    const description =
      "השירותים של ותיקי מטה יהודה – מרכז יום, פעילויות +60 וקהילה תומכת לוותיקים במטה יהודה.";
  
    const metaDescription = document.querySelector('meta[name="description"]');
  
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }
  
    const canonical = document.querySelector('link[rel="canonical"]');
  
    if (canonical) {
      canonical.setAttribute(
        "href",
        "https://matayehuda-frontend.onrender.com/services"
      );
    }
  
    return () => {
      document.title =
        "ותיקי מטה יהודה | קהילה תומכת, מרכז יום ופעילויות";
  
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          "אתר ותיקי מטה יהודה - קהילה תומכת, מרכז יום, פעילויות, התנדבות, תרומות ושירותים לקהילה."
        );
      }
  
      if (canonical) {
        canonical.setAttribute(
          "href",
          "https://matayehuda-frontend.onrender.com/"
        );
      }
    };
  }, []);
  
  return (
    <div className="info-page">
      <h1>השירותים שלנו</h1>

      <h2>מרכז יום</h2>
      <p>מסגרת חברתית קהילתית תומכת ומעשירה לוותיקים במטה יהודה.</p>

      <h2>+60 מינוס</h2>
      <p>הרצאות, סיורים, פעילויות תרבות ומפגשים חברתיים.</p>

      <h2>קהילה תומכת</h2>
      <p>תוכנית המסייעת לוותיקים להמשיך להתגורר בביתם בביטחון ובעצמאות.</p>
    </div>
  );
}

export default ServicesPage;
