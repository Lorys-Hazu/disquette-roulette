let messages = [];

export function logError(error) {
   console.error(`the following error occured during signaling: ${error}`);
}

export function hideElement(id) {
    document.getElementById(id)?.classList?.add('display-none');
}

export function displayElement(id) {
    document.getElementById(id)?.classList?.remove('display-none');
}

export function displayMessage(area, message, who) {
    const div = document.createElement('div');
    messages.push(message);
    div.innerText = message;
    div.classList.add('message')
    if (who === "me"){
        div.classList.add('myMessage')
    }
    else {
        div.classList.add('otherMessage')
    }
    area.appendChild(div);
}

export function canDisplayTest(){
    if (messages.length > 5){
        display()
    }
    else {
        displayMessage(chatArea,"Disquette Roulette: \n Il faut plus de messages pour débloquer la photo", "other")
    }
}

export function display(){
    console.log('toto');
}