const SessionStates = {
    definition: 1,
    configuration: 2,
    instantiation: 3,
    runtime: 4,
    dataCollect: 5,
    shutdown: 6
};

const SessionStateDisplay = {
    1: 'Definition',
    2: 'Configuration',
    3: 'Instantiation',
    4: 'Runtime',
    5: 'Data Collect',
    6: 'Shutdown'
};

async function sendJson(url, data, type) {
    return await $.ajax({
        url,
        type,
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json'
    });
}

async function postJson(url, data) {
    console.log('POST: ', url);
    return await sendJson(url, data, 'POST');
}

async function putJson(url, data) {
    console.log('PUT: ', url);
    return await sendJson(url, data, 'PUT');
}

async function deleteJson(url, data) {
    console.log('DELETE: ', url);
    return await sendJson(url, data, 'DELETE');
}

class CoreRest {
    constructor() {
        this.currentSession = null;
    }

    getStateName(state) {
        return SessionStateDisplay[state];
    }

    async getSession() {
        return await $.getJSON(`/sessions/${this.currentSession}`);
    }

    async getSessions() {
        return await $.getJSON('/sessions');
    }

    async createSession() {
        return await postJson('/sessions');
    }

    async shutdownSession() {
        return await this.setSessionState(SessionStates.shutdown);
    }

    async setSessionState(state) {
        return await putJson(`/sessions/${this.currentSession}/state`, {state});
    }

    async deleteSession(sessionId) {
        return await deleteJson(`/sessions/${sessionId}`);
    }

    async getEmaneModels() {
        return await $.getJSON(`/sessions/${this.currentSession}/emane/models`);
    }

    async getEmaneConfig(config) {
        return await $.getJSON(`/sessions/${this.currentSession}/emane/config`, config);
    }

    async getEmaneModelConfig(config) {
        return await $.getJSON(`/sessions/${this.currentSession}/emane/model/config`, config);
    }

    async setEmaneConfig(config) {
        return await putJson(`/sessions/${this.currentSession}/emane/config`, config);
    }

    async setEmaneModelConfig(config) {
        return await putJson(`/sessions/${this.currentSession}/emane/model/config`, config);
    }

    async getNode(nodeId) {
        return await $.getJSON(`/sessions/${this.currentSession}/nodes/${nodeId}`);
    }

    async createNode(node) {
        return await postJson(`/sessions/${this.currentSession}/nodes`, node);
    }

    async editNode(node) {
        return await putJson(`/sessions/${this.currentSession}/nodes/${node.id}`, {
            id: node.id,
            x: node.x,
            y: node.y
        });
    }

    async nodeTerminal(nodeId) {
        return await $.getJSON(`/sessions/${this.currentSession}/nodes/${nodeId}/terminal`);
    }

    async createLink(link) {
        return await postJson(`/sessions/${this.currentSession}/links`, link);
    }

    async editLink(link) {
        return await putJson(`/sessions/${this.currentSession}/links`, link);
    }

    async getLinks(nodeId) {
        return await $.getJSON(`/sessions/${this.currentSession}/nodes/${nodeId}/links`);
    }

    async getServices(nodeId) {
        return await $.getJSON(`/sessions/${this.currentSession}/nodes/${nodeId}/services`);
    }

    async getService(nodeId, service) {
        return await $.getJSON(`/sessions/${this.currentSession}/nodes/${nodeId}/services/${service}`);
    }

    async setService(nodeId, service, data) {
        return await putJson(`/sessions/${this.currentSession}/nodes/${nodeId}/services/${service}`, data);
    }

    async getServiceFile(nodeId, service, serviceFile) {
        return await $.getJSON(`/sessions/${this.currentSession}/nodes/${nodeId}/services/${service}/file`,
            {file: serviceFile});
    }

    async setServiceFile(nodeId, service, serviceFile, data) {
        return await putJson(`/sessions/${this.currentSession}/nodes/${nodeId}/services/${service}/file`, {
            name: serviceFile,
            data
        });
    }

    async getNodeIps(nodeId, ip4Prefix, ip6Prefix) {
        return await postJson('/ips', {
            id: nodeId,
            ip4: ip4Prefix,
            ip6: ip6Prefix
        });
    }

    async retrieveSession() {
        let response = await this.getSessions();
        const sessions = response.sessions;
        console.log('current sessions: ', sessions);
        const session = {id: 0, state: 0};

        if (sessions.length) {
            session.id = sessions[0].id;
            session.state = sessions[0].state;
        } else {
            response = await this.createSession();
            session.id = response.id;
            session.state = response.state;
        }

        return session;
    }

    async isRunning() {
        const session = await this.getSession();
        return session.state === SessionStates.runtime;
    }
}
