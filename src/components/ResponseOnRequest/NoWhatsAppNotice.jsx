import { buildTelUrl, formatPhoneForDisplay } from "../../utils/RespOneonRequest/formatters";

function NoWhatsAppNotice({ phone }) {
  const telUrl = buildTelUrl(phone);
  const displayPhone = formatPhoneForDisplay(phone);

  return (
    <div className="no-whatsapp-notice payment-info" role="alert">
      <p className="no-whatsapp-notice__title">למספר זה אין וואטסאפ</p>
      <p className="no-whatsapp-notice__text">יש להתקשר ללקוח במקום לשלוח הודעה.</p>
      {telUrl ? (
        <a className="no-whatsapp-notice__call" href={telUrl}>
          <strong>התקשרי:</strong> {displayPhone}
        </a>
      ) : (
        <p className="no-whatsapp-notice__text">
          <strong>טלפון:</strong> {displayPhone}
        </p>
      )}
    </div>
  );
}

export default NoWhatsAppNotice;
