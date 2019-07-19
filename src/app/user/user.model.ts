export class User {
    id: string;
    uid: string;
    firstName: string;
    lastName: string;
    role: string;
    theme: string;

    constructor(uid: string, firstName: string, lastName: string, role: string, theme: string, id?: string) {
        this.id = id;
        this.uid = uid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.theme = theme;
    }

    public getId() {
        return this.id;
    }

    public getObject() {
        return {
            uid: this.uid,
            firstName: this.firstName,
            lastName: this.lastName,
            role: this.role,
            theme: this.theme
        };
    }
}
