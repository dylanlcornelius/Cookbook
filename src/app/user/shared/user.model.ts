export class User {
    id: string;
    uid: string;
    firstName: string;
    lastName: string;
    role: string;
    theme: boolean;
    simplifiedView: boolean;
    hasImage: boolean;

    isAdmin: boolean;
    isPending: boolean;
    recipeCount: number;
    ratingCount: number;
    image: string;

    constructor(data) {
        this.id = data.id || '';
        this.uid = data.uid || '';
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.role = data.role || '';
        this.theme = data.theme || false;
        this.simplifiedView = data.simplifiedView || false;
        this.hasImage = data.hasImage || false;
        this.isAdmin = data.role === 'admin';
        this.isPending = data.role === 'pending';
    }

    public getId() {
        return this.id;
    }

    public getObject() {
        const {id, isAdmin, isPending, recipeCount, ratingCount, image, ...user} = this;
        return user;
    }
}
