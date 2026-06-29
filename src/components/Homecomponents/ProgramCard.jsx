function ProgramCard({ program, buttons }) {
  if (!program) {
    return null;
  }

  return (
    <article className={`program-card program-card--${program.id}`}>
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
