import { User } from "test/utils/common/User";

export abstract class SfdcCtx {
    abstract Ready: Promise<this>;
    public readonly user: User;

    constructor(user: User) {
        this.user = user;
    }
}