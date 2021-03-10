
export function logError(error) {
   console.error(`the following error occured during signaling: ${error}`);
}

export function hideElement(id) {
    document.getElementById(id)?.classList?.add('display-none');
}

export function displayElement(id) {
    document.getElementById(id)?.classList?.remove('display-none');
}

export function displayMessage(area, message, user) {
    const div = document.createElement('div');
    div.innerText = user + " : " + message;
    area.appendChild(div);
}