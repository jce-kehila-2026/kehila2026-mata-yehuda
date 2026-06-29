const PROGRAM_CARD_META = {
  supportive_community: {
    badge: "קהילה תומכת",
    badgeVariant: "mint",
  },
  "60_plus_minus": {
    badge: "60+ מינוס",
    badgeVariant: "sage",
  },
  day_center: {
    badge: "מרכז יום",
    badgeVariant: "sand",
  },
};

function ProgramCard({ program, buttons }) {
  if (!program) {
    return null;
  }

  const meta = PROGRAM_CARD_META[program.id] || {
    badge: program.title,
    badgeVariant: "mint",
  };

  return (
    <article className={`program-card program-card--${program.id}`}>
      <span
        className={`program-card__badge program-card__badge--${meta.badgeVariant}`}
      >
        {meta.badge}
      </span>

      <h2 className="program-card__title">{program.title}</h2>

      <div className="program-card__image-wrap">
        <img src={program.image_url} alt={program.title} />
      </div>

      <p className="program-card__description">{program.description}</p>

      <div className="program-buttons">{buttons}</div>
    </article>
  );
}

export default ProgramCard;
