
function DateTime() {

    const date = new Date()

    const hora = date.getHours().toString()
    const minuto = date.getMinutes().toString()

    if(hora >= '12'){
        if(minuto >= '10'){
            return `${hora}:${minuto}pm`
        }
        else if(minuto <= '10'){
            return `${hora}:0${minuto}pm`
        }
    }else{
        if(minuto >= '10'){
            return `${hora}:${minuto}am`
        }
        else if(minuto <= '10'){
            return `${hora}:0${minuto}pm`
        }
    }
}

module.exports = { DateTime }