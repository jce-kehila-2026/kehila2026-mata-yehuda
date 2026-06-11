
function ProgramCard({program, buttons}){
    if(!program) return null

     return (
        <div className="program-card">
         <h2>{program.title}</h2>

         <img 
            src={program.image_url} 
            alt={program.title}
          />
          
          <p>{program.description}</p>

          <div className="program-buttons">
            {buttons}
          </div>

        </div>
     );
}
export default ProgramCard;