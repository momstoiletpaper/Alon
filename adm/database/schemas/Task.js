const mongoose = require("mongoose")

// uid -> User ID
// sid -> Server ID

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    sid: { type: String, default: null },
    group: { type: String, default: null },
    text: { type: String, default: null },
    timestamp: { type: Number, default: 0 },
    cached: { type: Boolean, default: false },
    concluded: { type: Boolean, default: false }
})

const model = mongoose.model("Task", schema)

async function createTask(uid, sid, text, timestamp) {

    if (!await model.exists({ uid: uid, sid: sid, text: text, timestamp: timestamp })) await model.create({ uid: uid, sid: sid, text: text, timestamp: timestamp })

    return model.findOne({ uid: uid, sid: sid, text: text, timestamp: timestamp })
}

async function getTask(uid, timestamp) {
    return model.findOne({ uid: uid, timestamp: timestamp })
}

async function getCacheTask(uid, timestamp) {
    return model.findOne({ uid: uid, cached: true, timestamp: timestamp })
}

async function listAllUserTasks(uid) {
    return model.find({ uid: uid, cached: false })
}

async function listAllUserGuildTask(uid, sid) {
    return model.find({ uid: uid, cached: false, sid: sid })
}

async function listAllUserGroupTasks(uid, name) {
    return model.find({ uid: uid, group: name })
}

// Apaga uma task do usuário
async function dropTask(uid, timestamp) {
    await model.findOneAndDelete({ uid: uid, timestamp: timestamp })
}

async function dropTaskByGroup(uid, name) {
    await model.deleteMany({ uid: uid, group: name })
}

async function deleteUserCachedTasks(uid) {
    await model.deleteMany({ uid: uid, cached: true })
}

module.exports.Task = model
module.exports.createTask = createTask
module.exports.getTask = getTask
module.exports.getCacheTask = getCacheTask
module.exports.dropTask = dropTask
module.exports.dropTaskByGroup = dropTaskByGroup
module.exports.listAllUserTasks = listAllUserTasks
module.exports.listAllUserGuildTask = listAllUserGuildTask
module.exports.listAllUserGroupTasks = listAllUserGroupTasks
module.exports.deleteUserCachedTasks = deleteUserCachedTasks