import React from "react";
import "./Text.scss"

export function Text({ name }){    
    
    return(
        <div className="Text">
            <p>Nom d'utilisateur: {name}</p>
        </div>
    );
}