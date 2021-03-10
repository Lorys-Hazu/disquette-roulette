const pendingConnections = {};
const establishedConnections = {};
const rooms = {};
const uuids = {};

let availableRooms = [];
let busyRooms = [];
let compteur = 1;

let signalingId = 1;

function connectUsers(sex, preference, socket) {
    let room = isAvailableRoom(sex, preference);
    if (!!room) {
        makeRoomBusy(room);
    } else {
        room = createRoom(sex, preference);
    }

    joinRoom(room, socket);
}

function createRoom(sex, preference) {
    const room = preference + '-' + sex + '-' + compteur;
    availableRooms.push(room);
    compteur++;
    return room;
}

function makeRoomBusy(room) {
    availableRooms = availableRooms.filter( r =>  r !== room);
    busyRooms.push(room);
}

function isAvailableRoom(sex, preference) {
    return availableRooms.find(r => {
        const [prefPart, sexPart] = r.split('-');
        return sexPart === preference && prefPart === sex;
    });
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