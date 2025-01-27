const phaseTimeouts = new Map();

function setPhaseTimeout(lobbyCode, phase, durationMs, onTimeout) {
    clearPhaseTimeout(lobbyCode, phase);

    const timeoutId = setTimeout(() => {
        onTimeout();
    }, durationMs);
    phaseTimeouts.set(lobbyCode, { timeoutId, phase});
}

function clearPhaseTimeout(lobbyCode) {
    if (phaseTimeouts.has(lobbyCode)) {
        const { timeoutId, phase} = phaseTimeouts.get(lobbyCode);
        clearTimeout(timeoutId);
        phaseTimeouts.delete(lobbyCode);
    }
}

function getPhaseTimoutInfo(lobbyCode) {
    return phaseTimeouts.get(lobbyCode) || null;

}

module.exports = { setPhaseTimeout, clearPhaseTimeout, getPhaseTimoutInfo};
