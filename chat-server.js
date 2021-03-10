const pendingConnections = {};
const establishedConnections = {};
const rooms = {};
const uuids = {};

let signalingId = 1;

function connectUsers(Iam, Iwant, socket) {
    let room;
    if (!alreadyAsked(Iam, Iwant)) {
        if (!alreadyAsked(Iwant, Iam)) {
            startConnectionBetweenUsers(Iam, Iwant);
            room = `${Iam}${Iwant}`.replace(' ', '');
        } else {
            finishConnectionBetweenUsers(Iwant, Iam);
            room = `${Iwant}${Iam}`.replace(' ', '');
        }
        if (!rooms[room]) {
            rooms[room] = [];
        }
        rooms[room].push(Iam);
        joinRoom(room, socket);
    }
}

function generateSignalingIdForRoom(room) {
    if (!uuids[room]) {
        uuids[room] = signalingId;
        signalingId++;
    }
    return uuids[room];
}

function joinRoom(room, socket) {
    console.log(`Joingin room ${room}`);
    socket.room = room;
}

function startConnectionBetweenUsers(Iam, Iwant) {
    pendingConnections[Iam] = Iwant;
    console.log(`starting connection between users ${Iam} and ${Iwant}`);
}

function finishConnectionBetweenUsers(user2, user1) {
    console.log(`finishing connection between users ${user1} and ${user2}`);
    establishedConnections[user1] = user2;
    delete pendingConnections[user1];
    delete pendingConnections[user2];
}

function alreadyAsked(Iwant, Iam) {
    return pendingConnections[Iwant] === Iam;
}


function areUsersConnected(user1, user2) {
    return establishedConnections[user1] === user2 || establishedConnections[user2] === user1;
}

function existsRoom(room) {
    console.log(`rooms[${room}]`, rooms[room]);
    return !!rooms[room];
}

function disconnectUsers(room) {
    const [user1, user2] = rooms[room] || [];
    delete pendingConnections[user1];
    delete pendingConnections[user2];
    delete establishedConnections[user1];
    delete establishedConnections[user2];
    delete rooms[room];
}

module.exports = {
    connectUsers,
    areUsersConnected,
    disconnectUsers,
    existsRoom,
    generateSignalingIdForRoom
}