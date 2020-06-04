export class Config {
    id: string;
    name: string;
    value: string;

    constructor(data) {
        this.id = data.id || '';
        this.name = data.name || '';
        this.value = data.value || '';
    }

    public getId() {
        return this.id;
    }

    public getObject() {
        const {id, ...config} = this;
        return config;
    }
}
