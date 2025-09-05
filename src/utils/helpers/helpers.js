function getElement(id, data) {
    return data.find(item => item.id === id);
}

function getIndex(id, data) {
    return data.findIndex(obj => obj.id === id);
}

module.exports = { getElement, getIndex };